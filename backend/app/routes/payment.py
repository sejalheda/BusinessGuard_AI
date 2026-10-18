import base64
import json
import logging
from typing import Optional
import httpx
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from backend.app.config import settings
from backend.app.models import PaymentCheckResponse, ReasoningCheck
from mcp_server.tools import tool_check_payment_screenshot

logger = logging.getLogger("businessguard.payment")

router = APIRouter(tags=["payment"])

class Base64PaymentRequest(BaseModel):
    image_b64: str
    filename: Optional[str] = "payment_receipt.jpg"

async def analyze_with_gemini_vision(image_b64: str, mime_type: str = "image/jpeg") -> Optional[dict]:
    if not settings.GEMINI_API_KEY:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    prompt = (
        "You are an expert financial fraud examiner for small online merchants. "
        "Inspect this payment proof / UPI receipt screenshot for visual warning signs of manipulation "
        "(inconsistent timestamp, odd font or alignment, missing transaction reference, amount mismatch, unusual app UI). "
        "Respond strictly with valid JSON with these keys: "
        "'risk_level' ('High Risk', 'Medium Risk', or 'Low Risk'), "
        "'risk_score' (integer 0-100), "
        "'warning_signs' (list of detailed warning strings), "
        "'bank_checklist' (list of verification step strings), "
        "'reasoning' (list of objects with keys: check, evidence, confidence, tool='check_payment_screenshot')."
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": image_b64
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
    except Exception as e:
        logger.warning(f"Gemini vision call failed, falling back to mock: {e}")
    return None

@router.post("/api/payment-check", response_model=PaymentCheckResponse)
@router.post("/payment-check", response_model=PaymentCheckResponse)
async def check_payment_endpoint(
    file: Optional[UploadFile] = File(None),
    payload: Optional[Base64PaymentRequest] = None
):
    image_b64 = ""
    filename = "receipt.jpg"
    mime_type = "image/jpeg"

    if file:
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file exceeds 5 MB limit. Please upload a smaller image.")
        filename = file.filename or "receipt.jpg"
        mime_type = file.content_type or "image/jpeg"
        image_b64 = base64.b64encode(contents).decode("utf-8")
    elif payload and payload.image_b64:
        image_b64 = payload.image_b64
        filename = payload.filename or "receipt.jpg"
    else:
        filename = "demo_receipt.jpg"

    result = None
    if settings.LLM_PROVIDER == "gemini" and image_b64:
        result = await analyze_with_gemini_vision(image_b64, mime_type)

    if not result:
        result = tool_check_payment_screenshot(image_b64, filename)

    reasoning = [
        ReasoningCheck(**r) if isinstance(r, dict) else r
        for r in result.get("reasoning", [])
    ]

    return PaymentCheckResponse(
        risk_level=result.get("risk_level", "High Risk"),
        risk_score=result.get("risk_score", 88),
        warning_signs=result.get("warning_signs", []),
        bank_checklist=result.get("bank_checklist", []),
        disclaimer="Always confirm the credit in your bank account before shipping.",
        suggested_incident_type="fake_payment_fraud",
        reasoning=reasoning
    )
