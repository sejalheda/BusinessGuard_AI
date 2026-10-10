import uuid
from typing import Any, Optional
from backend.app.llm.base import BaseLLMProvider, LLMResponse, LLMToolCall

class MockLLMProvider(BaseLLMProvider):
    def __init__(self):
        self.provider_name = "mock"

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        system_prompt: Optional[str] = None
    ) -> LLMResponse:
        # Determine user intent from the latest user message
        last_user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_msg = (m.get("content") or "").lower()
                break

        tool_calls: list[LLMToolCall] = []

        # Analyze context to trigger MCP tools if tools are enabled
        if tools:
            tool_names = [t.get("name") for t in tools]

            if ("instagram" in last_user_msg or "hacked" in last_user_msg) and "generate_recovery_plan" in tool_names:
                tool_calls.append(
                    LLMToolCall(
                        id=f"call_{uuid.uuid4().hex[:8]}",
                        name="generate_recovery_plan",
                        arguments={"incident_type": "instagram_hacked", "severity": "critical"}
                    )
                )
            elif ("whatsapp" in last_user_msg or "sim" in last_user_msg) and "generate_recovery_plan" in tool_names:
                tool_calls.append(
                    LLMToolCall(
                        id=f"call_{uuid.uuid4().hex[:8]}",
                        name="generate_recovery_plan",
                        arguments={"incident_type": "whatsapp_compromised", "severity": "critical"}
                    )
                )
            elif ("payment" in last_user_msg or "screenshot" in last_user_msg or "money" in last_user_msg or "upi" in last_user_msg) and "generate_recovery_plan" in tool_names:
                tool_calls.append(
                    LLMToolCall(
                        id=f"call_{uuid.uuid4().hex[:8]}",
                        name="generate_recovery_plan",
                        arguments={"incident_type": "fake_payment_fraud", "severity": "high"}
                    )
                )
            elif ("legal" in last_user_msg or "threat" in last_user_msg or "sue" in last_user_msg or "defamation" in last_user_msg) and "generate_recovery_plan" in tool_names:
                tool_calls.append(
                    LLMToolCall(
                        id=f"call_{uuid.uuid4().hex[:8]}",
                        name="generate_recovery_plan",
                        arguments={"incident_type": "legal_threat", "severity": "medium"}
                    )
                )

        # Craft realistic response text
        if "instagram" in last_user_msg or "hacked" in last_user_msg:
            content = (
                "Take a deep breath—we can work through this step by step. "
                "Your single immediate next step right now is to check your original email inbox for an official message from security@mail.instagram.com stating 'Your email was changed'. "
                "If you find it, click 'revert this change' immediately. If the hacker has already changed that, open your Instagram app and submit a Video Selfie Identity Verification. "
                "I have also prepared a complete 24-hour containment and recovery checklist for you below. "
                "Note: Meta never sends copyright notices or account warnings through direct messages."
            )
        elif "whatsapp" in last_user_msg or "sim" in last_user_msg:
            content = (
                "I understand how stressful this is, especially with customers reaching out. "
                "Your single immediate next step is to call your mobile telecom operator from a family member or colleague's phone right away to place a temporary freeze on your SIM card. "
                "Then email support@whatsapp.com with 'Lost/Stolen: Please deactivate my account' including your phone number with country code. "
                "Put a quick story on your Instagram or personal status advising buyers that your WhatsApp line is temporarily unavailable."
            )
        elif "payment" in last_user_msg or "screenshot" in last_user_msg or "money" in last_user_msg or "upi" in last_user_msg:
            content = (
                "Do not dispatch or ship the parcel under any circumstances. "
                "Your single immediate next step is to log into your official banking or merchant app directly—do not click any link sent by the buyer. "
                "Legitimate UPI and bank deposits reflect instantly in cleared ledger balance; buyers cannot place funds in 'escrow' that require you to ship first. "
                "Reply calmly to the customer: 'Our store policy requires confirmed bank credit settlement before dispatch.'"
            )
        elif "legal" in last_user_msg or "threat" in last_user_msg or "sue" in last_user_msg or "defamation" in last_user_msg:
            content = (
                "Please don't worry—aggressive threats are often intimidation tactics meant to trigger an emotional reaction. "
                "Your single immediate next step is to pause all verbal or angry replies. Review your courier tracking log and order history calmly. "
                "Transit delays caused by external weather or courier backlog are standard commercial friction, not criminal negligence. "
                "Respond in writing with polite, factual dates and a working tracking link. General guidance only, not formal legal advice."
            )
        else:
            content = (
                "I am here to protect your business. "
                "Your single next step is to tell me what symptoms you are noticing: Did you lose account access, receive a suspicious payment proof, or get an unexpected customer threat? "
                "I will help you isolate the risk, take the right immediate actions, and secure your brand."
            )

        return LLMResponse(
            content=content,
            tool_calls=tool_calls,
            provider_name="mock",
            is_fallback=False
        )
