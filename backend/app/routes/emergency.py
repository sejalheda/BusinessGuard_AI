from fastapi import APIRouter
from backend.app.models import EmergencyRequest, EmergencyResponse
from mcp_server.tools import tool_create_case, tool_generate_recovery_plan

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

@router.post("", response_model=EmergencyResponse)
def trigger_emergency(req: EmergencyRequest):
    inc_type = req.emergency_type.lower()
    
    if "instagram" in inc_type or "whatsapp" in inc_type:
        severity = "critical"
    elif "payment" in inc_type or "fraud" in inc_type:
        severity = "high"
    else:
        severity = "medium"

    details = req.details or f"Emergency rescue triggered via web console for {req.emergency_type.replace('_', ' ').title()}."
    
    # Create emergency case in SQLite
    case_res = tool_create_case(
        incident_type=inc_type,
        details=details,
        source="emergency_button"
    )
    case_id = case_res["case_id"]
    
    # Generate complete recovery plan
    plan = tool_generate_recovery_plan(inc_type, severity=severity)
    
    return EmergencyResponse(
        case_id=case_id,
        severity=severity,
        emergency_type=inc_type,
        immediate_actions=plan.get("immediate_actions", []),
        plan_24h=plan.get("plan_24h", []),
        evidence_checklist=plan.get("evidence_checklist", []),
        prevention_tips=plan.get("prevention_tips", [])
    )
