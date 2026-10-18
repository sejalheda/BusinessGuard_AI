import json
import logging
from typing import Any, Optional
from backend.app.cache import request_cache
from backend.app.config import settings
from backend.app.llm.factory import llm_provider
from backend.app.models import ChatMessage, ChatResponse, StructuredCard, ReasoningCheck
from mcp_server.client import mcp_client
from mcp_server.tools import tool_get_case, tool_update_case, generate_reasoning_for_incident

logger = logging.getLogger("businessguard.agent")

SYSTEM_PROMPT = """You are BusinessGuard AI: a calm, practical first-responder advisor for small online sellers (Instagram boutiques, WhatsApp merchants, home creators).
Core behavioral principles:
1. Stay calm, empathetic, and constructive. Small sellers are often in panic when accounts are compromised or money is at risk.
2. Always give ONE clear, immediate next step first before listing further steps.
3. Use plain, simple, accessible language. Avoid complex legalistic or cyber jargon.
4. Never claim absolute certainty or guarantee account return; digital recovery has variables.
5. Never give formal legal advice. Explicitly position your advice as practical general guidance.
6. If the situation involves cyber fraud, identity theft, or financial extortion, recommend reporting to the platform security team and official authorities (e.g., cybercrime.gov.in or national equivalent).
7. When tools are provided, use them to analyze incidents, generate structured recovery plans, or log case details.
"""

def extract_reasoning(tools_used: list[dict], case_details: Optional[dict] = None, content: str = "") -> list[ReasoningCheck]:
    reasoning_list = []
    
    # 1. Check tools used
    for tu in tools_used:
        res = tu.get("result", {})
        if isinstance(res, dict) and "reasoning" in res:
            for r in res["reasoning"]:
                if isinstance(r, dict):
                    reasoning_list.append(ReasoningCheck(**r))
                elif isinstance(r, ReasoningCheck):
                    reasoning_list.append(r)

    # 2. Check case details
    if not reasoning_list and case_details and case_details.get("reasoning"):
        for r in case_details["reasoning"]:
            if isinstance(r, dict):
                reasoning_list.append(ReasoningCheck(**r))
            elif isinstance(r, ReasoningCheck):
                reasoning_list.append(r)

    # 3. Fallback mock reasoning generator based on query
    if not reasoning_list:
        inc_type = case_details.get("incident_type", "") if case_details else ""
        if not inc_type:
            c_lower = content.lower()
            if "instagram" in c_lower or "hack" in c_lower:
                inc_type = "instagram_hacked"
            elif "whatsapp" in c_lower or "sim" in c_lower:
                inc_type = "whatsapp_compromised"
            elif "payment" in c_lower or "screenshot" in c_lower or "money" in c_lower:
                inc_type = "fake_payment_fraud"
            elif "legal" in c_lower or "threat" in c_lower:
                inc_type = "legal_threat"
            else:
                inc_type = "general_security"
                
        raw_r = generate_reasoning_for_incident(inc_type, content)
        reasoning_list = [ReasoningCheck(**r) for r in raw_r]

    return reasoning_list

def extract_structured_card(content: str, tools_used: list[dict], case_details: Optional[dict] = None) -> StructuredCard:
    recovery_plan = None
    analysis = None
    for tu in tools_used:
        if tu.get("name") == "generate_recovery_plan":
            recovery_plan = tu.get("result")
        elif tu.get("name") == "analyze_incident":
            analysis = tu.get("result")

    if not recovery_plan and case_details and case_details.get("recovery_plan"):
        recovery_plan = case_details["recovery_plan"]

    risk_level = "Medium"
    if analysis and "risk_level" in analysis:
        risk_level = analysis["risk_level"]
    elif recovery_plan:
        risk_level = "Critical Threat" if "instagram" in str(recovery_plan).lower() or "whatsapp" in str(recovery_plan).lower() else "High Risk"

    recommended_actions = []
    prevention_tips = []
    if recovery_plan:
        recommended_actions = recovery_plan.get("immediate_actions", [])
        prevention_tips = recovery_plan.get("prevention_tips", [])
    else:
        recommended_actions = [
            "Check official platform notification emails for unauthorized changes",
            "Freeze linked payment methods and alert key customer contacts",
            "Submit video identity verification or contact carrier support"
        ]
        prevention_tips = [
            "Enable Authenticator App Two-Factor Authentication immediately",
            "Never share 6-digit SMS verification codes with third parties"
        ]

    situation_analysis = (
        analysis.get("analysis_summary") if analysis else
        "Potential credential compromise or fraudulent transaction pattern detected on social commerce channel."
    )

    reasoning = extract_reasoning(tools_used, case_details, content)

    return StructuredCard(
        risk_level=risk_level,
        situation_analysis=situation_analysis,
        recommended_actions=recommended_actions[:4],
        prevention_tips=prevention_tips[:3],
        reasoning=reasoning
    )

async def run_agent_loop(
    messages: list[ChatMessage],
    case_id: Optional[str] = None,
    context: Optional[dict[str, Any]] = None
) -> ChatResponse:
    cache_key = {
        "case_id": case_id,
        "messages": [{"role": m.role, "content": m.content} for m in messages[-4:]]
    }
    cached = request_cache.get(cache_key)
    if cached:
        logger.info(f"Cache hit for request (case_id={case_id})")
        return ChatResponse(**cached)

    case_details = None
    case_context_str = ""
    if case_id:
        case_details = tool_get_case(case_id)
        if "error" not in case_details:
            case_context_str = (
                f"\nCURRENT ACTIVE CASE: {case_id}\n"
                f"Title: {case_details.get('title')}\n"
                f"Type: {case_details.get('incident_type')}\n"
                f"Severity: {case_details.get('severity')}\n"
                f"Status: {case_details.get('status')}\n"
            )

    full_system_prompt = SYSTEM_PROMPT + case_context_str
    tools = mcp_client.get_tool_definitions()
    msg_dicts = [{"role": m.role, "content": m.content} for m in messages]

    initial_llm_response = await llm_provider.chat(
        messages=msg_dicts,
        tools=tools,
        system_prompt=full_system_prompt
    )

    tools_used: list[dict[str, Any]] = []
    
    if initial_llm_response.tool_calls:
        for tc in initial_llm_response.tool_calls:
            try:
                result = await mcp_client.call_tool_async(tc.name, tc.arguments)
                tools_used.append({
                    "id": tc.id,
                    "name": tc.name,
                    "arguments": tc.arguments,
                    "result": result
                })
            except Exception as e:
                logger.error(f"Error executing tool {tc.name}: {e}")
                tools_used.append({
                    "id": tc.id,
                    "name": tc.name,
                    "arguments": tc.arguments,
                    "error": str(e)
                })

    final_answer = initial_llm_response.content
    final_severity = "medium"
    
    if case_details and "severity" in case_details:
        final_severity = case_details["severity"]
    for tu in tools_used:
        res = tu.get("result", {})
        if isinstance(res, dict) and "severity" in res:
            final_severity = res["severity"]

    reasoning = extract_reasoning(tools_used, case_details, final_answer)

    if case_id and case_details and "error" not in case_details:
        turns = case_details.get("turns", [])
        last_user = messages[-1] if messages else None
        if last_user and last_user.role == "user":
            turns.append({
                "role": "user",
                "content": last_user.content,
                "timestamp": last_user.timestamp,
                "source": "advisor"
            })
        turns.append({
            "role": "assistant",
            "content": final_answer,
            "timestamp": None,
            "source": "advisor"
        })
        tool_update_case(case_id, {
            "turns": turns,
            "reasoning": [r.dict() for r in reasoning]
        })

    structured_card = extract_structured_card(final_answer, tools_used, case_details)
    structured_card.reasoning = reasoning

    response_payload = ChatResponse(
        answer=final_answer,
        severity=final_severity,
        case_id=case_id,
        tools_used=tools_used,
        provider=initial_llm_response.provider_name,
        is_fallback=initial_llm_response.is_fallback,
        structured_card=structured_card,
        reasoning=reasoning
    )

    request_cache.set(cache_key, response_payload.dict())
    return response_payload
