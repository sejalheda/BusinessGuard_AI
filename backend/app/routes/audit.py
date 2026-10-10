import json
from datetime import datetime
from fastapi import APIRouter
from backend.app.models import AuditAnswers, AuditResponse
from backend.app.database import get_db_connection
from mcp_server.tools import tool_score_business

router = APIRouter(prefix="/api/audit", tags=["audit"])

@router.post("", response_model=AuditResponse)
def evaluate_audit(answers: AuditAnswers):
    ans_dict = answers.dict()
    result = tool_score_business(ans_dict)
    
    # Store in database
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    cursor.execute("""
    INSERT INTO audits (created_at, overall_score, maturity_level, category_scores, strengths, weaknesses, recommendations, action_plan, answers)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_iso,
        result["overall_score"],
        result["maturity_level"],
        json.dumps(result["category_scores"]),
        json.dumps(result["strengths"]),
        json.dumps(result["weaknesses"]),
        json.dumps(result["recommendations"]),
        json.dumps(result["action_plan"]),
        json.dumps(ans_dict)
    ))
    conn.commit()
    conn.close()
    
    return AuditResponse(
        overall_score=result["overall_score"],
        maturity_level=result["maturity_level"],
        category_scores=result["category_scores"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        recommendations=result["recommendations"],
        action_plan=result["action_plan"],
        top_fixes=result["top_fixes"]
    )

@router.get("/latest")
def get_latest_audit():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audits ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        # Default baseline scores (e.g. 68 for demonstration)
        return {
            "overall_score": 68,
            "maturity_level": "Building",
            "category_scores": {"legal": 65, "security": 60, "operations": 75, "brand": 70},
            "strengths": ["Active customer engagement", "Regular product catalog updates"],
            "weaknesses": ["Multi-Factor Authentication disabled on Meta Business", "Manual UPI payment verification"],
            "recommendations": ["Enable 2FA authenticator apps across all platforms", "Install merchant payment soundbox"],
            "action_plan": [
                "1. Turn on Google Authenticator for Instagram & Meta account.",
                "2. Standardize refund and shipping policies.",
                "3. Secure offline backup of customer contacts."
            ],
            "top_fixes": [
                {"title": "Enable MFA on Meta & Google", "impact_points": 18, "effort": "15 mins", "category": "Security"},
                {"title": "Enforce settled funds check before dispatch", "impact_points": 14, "effort": "Immediate", "category": "Brand"},
                {"title": "Adopt a dedicated Password Manager", "impact_points": 12, "effort": "30 mins", "category": "Security"}
            ],
            "is_default": True
        }
        
    audit = dict(row)
    return {
        "id": audit["id"],
        "created_at": audit["created_at"],
        "overall_score": audit["overall_score"],
        "maturity_level": audit["maturity_level"],
        "category_scores": json.loads(audit["category_scores"]),
        "strengths": json.loads(audit["strengths"] or "[]"),
        "weaknesses": json.loads(audit["weaknesses"] or "[]"),
        "recommendations": json.loads(audit["recommendations"] or "[]"),
        "action_plan": json.loads(audit["action_plan"] or "[]"),
        "answers": json.loads(audit["answers"] or "{}"),
        "is_default": False
    }
