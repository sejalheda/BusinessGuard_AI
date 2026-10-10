import re
import json
from datetime import datetime
from typing import Any, Optional
from fastapi import APIRouter
from backend.app.models import AlexaInteractRequest, AlexaInteractResponse
from mcp_server.tools import (
    tool_create_case,
    tool_generate_recovery_plan,
    tool_analyze_incident,
    tool_update_case,
    tool_get_case
)

router = APIRouter(prefix="/api/alexa", tags=["alexa"])

def clean_transcript(text: str) -> str:
    # Strip common wake words and prefix patterns
    cleaned = re.sub(r"^(alexa,?\s*(ask\s+businessguard,?\s*)?|hey\s+alexa,?\s*|ask\s+businessguard,?\s*)", "", text, flags=re.IGNORECASE)
    return cleaned.strip()

@router.post("/interact", response_model=AlexaInteractResponse)
def interact_alexa(req: AlexaInteractRequest):
    raw_text = req.transcript
    user_text = clean_transcript(raw_text)
    turn = req.turn_index
    answers = req.previous_answers or {}
    case_id = req.case_id
    now_iso = datetime.utcnow().isoformat() + "Z"
    tools_used = []

    # Detect incident type
    text_lower = user_text.lower()
    incident_type = answers.get("incident_type")
    if not incident_type:
        if "instagram" in text_lower or "insta" in text_lower or "saree" in text_lower:
            incident_type = "instagram_hacked"
        elif "whatsapp" in text_lower or "sim" in text_lower:
            incident_type = "whatsapp_compromised"
        elif "payment" in text_lower or "screenshot" in text_lower or "money" in text_lower or "upi" in text_lower:
            incident_type = "fake_payment_fraud"
        elif "legal" in text_lower or "threat" in text_lower or "sue" in text_lower:
            incident_type = "legal_threat"
        else:
            incident_type = "instagram_hacked"  # Default for demo persona
        answers["incident_type"] = incident_type

    # Conversation progression
    if turn == 0:
        # First query from user
        answers["initial_complaint"] = user_text
        
        # Tools: analyze preliminary context
        tools_used.append({
            "name": "analyze_incident_preliminary",
            "arguments": {"incident_type": incident_type},
            "result": {"severity": "critical", "risk_level": "Immediate Threat"}
        })

        if incident_type == "instagram_hacked":
            next_q = "I'm right here with you. Can you still log in to your Instagram account on your mobile app?"
            spoken = "I understand how urgent this is. Can you still log in to your Instagram account on your mobile app?"
        elif incident_type == "whatsapp_compromised":
            next_q = "I understand the urgency. Do you still have mobile carrier signal on your phone?"
            spoken = "I understand the urgency. Do you still have mobile carrier signal on your phone?"
        else:
            next_q = "I'm here to help. Has any payment or inventory already left your possession?"
            spoken = "I am here to help. Has any payment or inventory already left your possession?"

        return AlexaInteractResponse(
            spoken_response=spoken,
            display_text=next_q,
            case_id=None,
            is_complete=False,
            next_question=next_q,
            immediate_actions=[],
            turn_index=1,
            tools_used=tools_used
        )

    elif turn == 1:
        answers["can_login_response"] = user_text
        if incident_type == "instagram_hacked":
            next_q = "Did you get an official security email from Instagram stating your email address or phone number was changed?"
            spoken = "Did you receive an official security email from Instagram saying your email address or phone number was changed?"
        elif incident_type == "whatsapp_compromised":
            next_q = "Did you share any six-digit verification code or click any external link recently?"
            spoken = "Did you share any six digit verification code or click an external link recently?"
        else:
            next_q = "Have you checked your official merchant banking app directly for cleared funds?"
            spoken = "Have you checked your official merchant banking app directly for cleared funds?"

        return AlexaInteractResponse(
            spoken_response=spoken,
            display_text=next_q,
            case_id=case_id,
            is_complete=False,
            next_question=next_q,
            immediate_actions=[],
            turn_index=2,
            tools_used=[]
        )

    elif turn == 2:
        answers["email_changed_response"] = user_text
        if incident_type == "instagram_hacked":
            next_q = "Are the scammers currently posting fake stories or messaging your followers for money or crypto?"
            spoken = "Are the attackers currently posting fake stories or messaging your followers for money?"
        else:
            next_q = "Are customers currently contacting you with complaints or payment requests?"
            spoken = "Are customers currently contacting you with complaints?"

        return AlexaInteractResponse(
            spoken_response=spoken,
            display_text=next_q,
            case_id=case_id,
            is_complete=False,
            next_question=next_q,
            immediate_actions=[],
            turn_index=3,
            tools_used=[]
        )

    else:
        # Final resolution turn (Turn 3+)
        answers["attacker_activity_response"] = user_text
        
        # 1. MCP Tool: create_case
        case_res = tool_create_case(
            incident_type=incident_type,
            details=f"Alexa voice rescue initiated: {answers.get('initial_complaint', 'Account compromise')}. Owner states attacker activity present.",
            source="alexa",
            answers=answers
        )
        created_id = case_res["case_id"]
        tools_used.append({
            "name": "create_case",
            "arguments": {"incident_type": incident_type, "source": "alexa"},
            "result": case_res
        })

        # 2. MCP Tool: generate_recovery_plan
        plan_res = tool_generate_recovery_plan(incident_type, severity="critical")
        tools_used.append({
            "name": "generate_recovery_plan",
            "arguments": {"incident_type": incident_type, "severity": "critical"},
            "result": plan_res
        })

        # Immediate actions (top 3)
        actions = plan_res.get("immediate_actions", [])[:3]

        # 3. Assemble turns for case history
        turns = [
            {"role": "user", "content": answers.get("initial_complaint", "My Instagram was hacked"), "timestamp": now_iso, "source": "alexa_voice"},
            {"role": "assistant", "content": "Can you still log in to your account?", "timestamp": now_iso, "source": "alexa_voice"},
            {"role": "user", "content": answers.get("can_login_response", "No, password changed"), "timestamp": now_iso, "source": "alexa_voice"},
            {"role": "assistant", "content": "Did you receive a security email about an email change?", "timestamp": now_iso, "source": "alexa_voice"},
            {"role": "user", "content": answers.get("email_changed_response", "Yes, email was changed"), "timestamp": now_iso, "source": "alexa_voice"},
            {"role": "assistant", "content": "Are attackers messaging followers?", "timestamp": now_iso, "source": "alexa_voice"},
            {"role": "user", "content": user_text, "timestamp": now_iso, "source": "alexa_voice"}
        ]

        # Update case with turns and Priya's business metadata
        tool_update_case(created_id, {
            "turns": turns,
            "title": f"Instagram Compromise: Saree Haven ({created_id})",
            "metadata": {"business_name": "Saree Haven by Priya", "channel": "Alexa Voice", "handoff_ready": True}
        })

        spoken = (
            f"I have registered Case {created_id}. Here are your first three immediate actions: "
            f"One: Search your registered email for an alert from security at mail dot instagram dot com and tap Revert This Change. "
            f"Two: On your Instagram app login screen, tap Need More Help and submit a Video Selfie Identity Verification. "
            f"Three: Post a warning on your personal WhatsApp status telling customers not to transfer funds. "
            f"You can now continue this exact case on your BusinessGuard web app using Case ID {created_id}."
        )

        display = (
            f"Case {created_id} has been created and synced. "
            f"First 3 Immediate Actions:\n"
            f"1. Check registered email for security@mail.instagram.com alert & tap 'revert this change'.\n"
            f"2. Submit Video Selfie Identity Verification on Instagram mobile app.\n"
            f"3. Alert followers on WhatsApp status not to send any payments.\n\n"
            f"Continue this rescue on the web app using Case ID: {created_id}"
        )

        return AlexaInteractResponse(
            spoken_response=spoken,
            display_text=display,
            case_id=created_id,
            is_complete=True,
            next_question=None,
            immediate_actions=actions,
            turn_index=4,
            tools_used=tools_used
        )
