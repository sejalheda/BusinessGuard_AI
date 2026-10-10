import json
import sqlite3
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.database import get_db_connection, generate_next_case_id
from backend.app.models import CreateCaseRequest, UpdateCaseRequest
from mcp_server.tools import tool_create_case, tool_get_case, tool_update_case

router = APIRouter(prefix="/api/cases", tags=["cases"])

@router.get("")
def list_cases(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM cases WHERE 1=1"
    params = []
    
    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR id LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
        
    if status and status != "all":
        query += " AND status = ?"
        params.append(status.lower())
        
    if severity and severity != "all":
        query += " AND severity = ?"
        params.append(severity.lower())
        
    if source and source != "all":
        query += " AND source = ?"
        params.append(source.lower())
        
    if incident_type and incident_type != "all":
        query += " AND incident_type = ?"
        params.append(incident_type.lower())
        
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    cases = []
    for r in rows:
        c = dict(r)
        for field in ["answers", "turns", "recovery_plan", "metadata"]:
            if c.get(field):
                try:
                    c[field] = json.loads(c[field])
                except Exception:
                    pass
        cases.append(c)
        
    return {"cases": cases, "total": len(cases)}

@router.get("/{case_id}")
def get_case_by_id(case_id: str):
    res = tool_get_case(case_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("")
def create_new_case(req: CreateCaseRequest):
    res = tool_create_case(
        incident_type=req.incident_type,
        details=req.details,
        source=req.source,
        answers=req.answers
    )
    return res

@router.patch("/{case_id}")
def update_case_endpoint(case_id: str, req: UpdateCaseRequest):
    patch = req.dict(exclude_unset=True)
    res = tool_update_case(case_id, patch)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
