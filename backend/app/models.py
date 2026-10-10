from typing import Any, Optional
from pydantic import BaseModel, Field

class RecoveryPlan(BaseModel):
    immediate_actions: list[str] = Field(default_factory=list)
    plan_24h: list[str] = Field(default_factory=list)
    evidence_checklist: list[str] = Field(default_factory=list)
    prevention_tips: list[str] = Field(default_factory=list)

class StructuredCard(BaseModel):
    risk_level: str = "Medium"  # Critical, High, Medium, Low
    situation_analysis: str = ""
    recommended_actions: list[str] = Field(default_factory=list)
    prevention_tips: list[str] = Field(default_factory=list)

class CaseModel(BaseModel):
    id: str
    incident_type: str
    severity: str
    status: str = "open"  # open, in_progress, resolved
    title: str
    description: Optional[str] = ""
    source: str = "web"  # alexa, web, advisor
    created_at: str
    updated_at: str
    answers: Optional[dict[str, Any]] = None
    turns: list[dict[str, Any]] = Field(default_factory=list)
    recovery_plan: Optional[RecoveryPlan] = None
    metadata: Optional[dict[str, Any]] = None

class CreateCaseRequest(BaseModel):
    incident_type: str
    details: str
    title: Optional[str] = None
    source: str = "web"
    answers: Optional[dict[str, Any]] = None
    metadata: Optional[dict[str, Any]] = None

class UpdateCaseRequest(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    recovery_plan: Optional[RecoveryPlan] = None
    answers: Optional[dict[str, Any]] = None
    metadata: Optional[dict[str, Any]] = None

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    timestamp: Optional[str] = None
    source: Optional[str] = "web"

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    case_id: Optional[str] = None
    context: Optional[dict[str, Any]] = None

class ChatResponse(BaseModel):
    answer: str
    severity: str = "medium"
    case_id: Optional[str] = None
    tools_used: list[dict[str, Any]] = Field(default_factory=list)
    provider: str = "mock"
    is_fallback: bool = False
    structured_card: Optional[StructuredCard] = None

class AlexaInteractRequest(BaseModel):
    transcript: str
    case_id: Optional[str] = None
    turn_index: int = 0
    previous_answers: Optional[dict[str, Any]] = None

class AlexaInteractResponse(BaseModel):
    spoken_response: str
    display_text: str
    case_id: Optional[str] = None
    is_complete: bool = False
    next_question: Optional[str] = None
    immediate_actions: list[str] = Field(default_factory=list)
    turn_index: int = 0
    tools_used: list[dict[str, Any]] = Field(default_factory=list)

class AuditAnswers(BaseModel):
    registration: bool = False
    gst: bool = False
    mfa: bool = False
    invoices: bool = False
    vendor_contracts: bool = False
    trademark: bool = False
    backups: bool = False
    password_manager: bool = False
    staff_access: bool = False
    cyber_insurance: bool = False
    payment_verification: bool = False
    incident_plan: bool = False

class AuditResponse(BaseModel):
    overall_score: int
    maturity_level: str  # Starter, Building, Protected, Resilient
    category_scores: dict[str, int]  # legal, security, operations, brand
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    action_plan: list[str]
    top_fixes: list[dict[str, Any]]

class EmergencyRequest(BaseModel):
    emergency_type: str  # instagram_hacked, whatsapp_compromised, fake_payment_fraud, legal_threat
    business_name: Optional[str] = "Online Business"
    details: Optional[str] = ""

class EmergencyResponse(BaseModel):
    case_id: str
    severity: str
    emergency_type: str
    immediate_actions: list[str]
    plan_24h: list[str]
    evidence_checklist: list[str]
    prevention_tips: list[str]
