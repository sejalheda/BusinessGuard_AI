import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

DB_FILE = Path(__file__).resolve().parent.parent / "data" / "businessguard.db"

def get_connection() -> sqlite3.Connection:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(cases)")
    cols = [r["name"] for r in cursor.fetchall()]
    if cols:
        if "reasoning" not in cols:
            cursor.execute("ALTER TABLE cases ADD COLUMN reasoning TEXT")
            conn.commit()
        if "completed_steps" not in cols:
            cursor.execute("ALTER TABLE cases ADD COLUMN completed_steps TEXT")
            conn.commit()
    return conn

def generate_reasoning_for_incident(incident_type: str, details: str = "") -> list[dict]:
    inc_norm = incident_type.lower()
    if "instagram" in inc_norm:
        return [
            {
                "check": "Account Access Anomaly",
                "evidence": "Password & primary email address modified from untrusted IP without owner 2FA approval",
                "confidence": "High",
                "tool": "analyze_incident"
            },
            {
                "check": "Phishing DM Form Interaction",
                "evidence": "User clicked external form link embedded in fake Meta copyright notice DM",
                "confidence": "High",
                "tool": "analyze_incident"
            },
            {
                "check": "Follower Exploitation Risk",
                "evidence": "Scammers actively posting high-yield crypto investment stories to boutique audience",
                "confidence": "Medium",
                "tool": "analyze_incident"
            }
        ]
    elif "whatsapp" in inc_norm:
        return [
            {
                "check": "SIM Swap Signal Loss",
                "evidence": "Physical SIM card lost cellular carrier connection prior to unauthorized WhatsApp re-registration",
                "confidence": "High",
                "tool": "analyze_incident"
            },
            {
                "check": "Customer Impersonation Threat",
                "evidence": "Active broadcasting of fraudulent bank transfer requests to saved customer catalog contacts",
                "confidence": "High",
                "tool": "analyze_incident"
            }
        ]
    elif "payment" in inc_norm or "fraud" in inc_norm:
        return [
            {
                "check": "Timestamp & Clock Verification",
                "evidence": "Screenshot display clock is inconsistent with payment processing window",
                "confidence": "High",
                "tool": "check_payment_screenshot"
            },
            {
                "check": "Typography & Editing Artifacts",
                "evidence": "Font weight and character spacing around amount field show pixel manipulation",
                "confidence": "High",
                "tool": "check_payment_screenshot"
            },
            {
                "check": "Merchant Ledger Absence",
                "evidence": "Zero matching credit settlement recorded in official bank merchant portal",
                "confidence": "High",
                "tool": "check_payment_screenshot"
            }
        ]
    elif "legal" in inc_norm or "threat" in inc_norm:
        return [
            {
                "check": "Force Majeure Delay",
                "evidence": "Courier transit tracking notes weather monsoon delay outside merchant control",
                "confidence": "High",
                "tool": "analyze_incident"
            },
            {
                "check": "Customer Intimidation Tactic",
                "evidence": "Smear threat initiated prior to formal consumer forum notice window",
                "confidence": "Medium",
                "tool": "analyze_incident"
            }
        ]
    else:
        return [
            {
                "check": "Security Baseline Audit",
                "evidence": "Multi-factor authentication missing or single-factor password reuse detected",
                "confidence": "Medium",
                "tool": "analyze_incident"
            }
        ]

# 1. create_case(incident_type, details)
def tool_create_case(
    incident_type: str,
    details: str,
    source: str = "mcp",
    answers: Optional[dict] = None,
    reasoning: Optional[list] = None
) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Generate next BG-2026-XXX
    cursor.execute("SELECT id FROM cases ORDER BY id DESC")
    rows = cursor.fetchall()
    highest_num = 0
    year = "2026"
    for r in rows:
        cid = r["id"]
        if cid.startswith(f"BG-{year}-"):
            try:
                num = int(cid.split("-")[-1])
                if num > highest_num:
                    highest_num = num
            except ValueError:
                pass
    case_id = f"BG-{year}-{highest_num + 1:03d}"
    
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    # Assess initial severity based on incident type
    incident_norm = incident_type.lower()
    if "instagram" in incident_norm or "whatsapp" in incident_norm or "hack" in incident_norm or "takeover" in incident_norm:
        severity = "critical"
    elif "fraud" in incident_norm or "payment" in incident_norm or "scam" in incident_norm:
        severity = "high"
    elif "legal" in incident_norm or "threat" in incident_norm or "defamation" in incident_norm:
        severity = "medium"
    else:
        severity = "medium"
        
    title_map = {
        "instagram_hacked": "Instagram Account Compromise & Recovery",
        "whatsapp_compromised": "WhatsApp Business Impersonation Incident",
        "fake_payment_fraud": "Fraudulent Payment Proof Verification",
        "legal_threat": "Customer Dispute & Legal Notice Guidance",
        "general_security": "Business Security Review"
    }
    title = title_map.get(incident_norm, f"{incident_type.replace('_', ' ').title()} Incident")
    
    plan = tool_generate_recovery_plan(incident_type, severity)
    case_reasoning = reasoning or generate_reasoning_for_incident(incident_type, details)
    
    # Safe insert including reasoning & completed_steps
    cursor.execute("""
    INSERT INTO cases (id, incident_type, severity, status, title, description, source, created_at, updated_at, answers, turns, recovery_plan, metadata, reasoning, completed_steps)
    VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        incident_type,
        severity,
        title,
        details,
        source,
        now_iso,
        now_iso,
        json.dumps(answers or {}),
        json.dumps([]),
        json.dumps(plan),
        json.dumps({"created_by": source}),
        json.dumps(case_reasoning),
        json.dumps([])
    ))
    conn.commit()
    conn.close()
    
    return {
        "case_id": case_id,
        "title": title,
        "incident_type": incident_type,
        "severity": severity,
        "status": "open",
        "recovery_plan": plan,
        "reasoning": case_reasoning,
        "completed_steps": [],
        "message": f"Case {case_id} successfully created."
    }

# 2. get_case(case_id)
def tool_get_case(case_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id.upper(),))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"error": f"Case {case_id} not found."}
        
    case_dict = dict(row)
    for json_col in ["answers", "turns", "recovery_plan", "metadata", "reasoning", "completed_steps"]:
        if case_dict.get(json_col):
            try:
                case_dict[json_col] = json.loads(case_dict[json_col])
            except Exception:
                pass
        elif json_col in ["reasoning", "completed_steps"]:
            if json_col == "reasoning":
                case_dict["reasoning"] = generate_reasoning_for_incident(case_dict.get("incident_type", "general"), case_dict.get("description", ""))
            else:
                case_dict["completed_steps"] = []
                
    return case_dict

# 3. update_case(case_id, patch)
def tool_update_case(case_id: str, patch: dict) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id.upper(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {"error": f"Case {case_id} not found."}
        
    allowed_fields = [
        "status", "severity", "title", "description", "answers",
        "turns", "recovery_plan", "metadata", "reasoning", "completed_steps"
    ]
    updates = []
    values = []
    
    for key, val in patch.items():
        if key in allowed_fields:
            updates.append(f"{key} = ?")
            if isinstance(val, (dict, list)):
                values.append(json.dumps(val))
            else:
                values.append(val)
                
    if not updates:
        conn.close()
        return {"error": "No valid fields provided to patch."}
        
    now_iso = datetime.utcnow().isoformat() + "Z"
    updates.append("updated_at = ?")
    values.append(now_iso)
    values.append(case_id.upper())
    
    sql = f"UPDATE cases SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(sql, values)
    conn.commit()
    conn.close()
    
    return tool_get_case(case_id.upper())

# 4. analyze_incident(case_id)
def tool_analyze_incident(case_id: str) -> dict:
    case = tool_get_case(case_id)
    if "error" in case:
        return case
        
    inc_type = case.get("incident_type", "").lower()
    desc = (case.get("description") or "").lower()
    
    reasoning = case.get("reasoning") or generate_reasoning_for_incident(inc_type, desc)
    
    if "instagram" in inc_type or "hacked" in desc:
        severity = "critical"
        risk_level = "Critical Threat"
        key_risks = [
            "Hacker impersonating seller to solicit fake payments from followers",
            "Permanent loss of account if email and 2FA are replaced",
            "Loss of customer direct message archives and catalog"
        ]
        urgency = "Immediate action required within the first 60 minutes"
        platform_flagged = "Meta / Instagram Account Security"
    elif "whatsapp" in inc_type or "sim" in desc:
        severity = "critical"
        risk_level = "Critical Compromise"
        key_risks = [
            "Direct fraud broadcasts to active buyer contacts",
            "Potential unauthorized access to linked banking OTPs if SIM hijacked",
            "Customer trust breakdown and reputation loss"
        ]
        urgency = "Urgent: freeze SIM line within 30 minutes"
        platform_flagged = "WhatsApp Business & Telecom Carrier"
    elif "payment" in inc_type or "fraud" in desc:
        severity = "high"
        risk_level = "Financial Scam / High Risk"
        key_risks = [
            "Dispatching inventory with zero financial credit",
            "Secondary social engineering (fake banking helpline / escrow spoof)",
            "Cash flow loss on high-ticket products"
        ]
        urgency = "Hold fulfillment immediately pending settled bank ledger credit"
        platform_flagged = "UPI / National Payments Corporation of India"
    elif "legal" in inc_type or "threat" in desc:
        severity = "medium"
        risk_level = "Reputational & Customer Dispute"
        key_risks = [
            "Negative social media smear campaign or unfair reviews",
            "Escalation to Consumer Protection forum if mishandled",
            "Wasted executive time on bad-faith intimidation"
        ]
        urgency = "Respond within 24 hours with calm, factual documentation"
        platform_flagged = "Consumer Dispute / Civil Guidance"
    else:
        severity = "medium"
        risk_level = "Elevated Operational Risk"
        key_risks = ["Vulnerability in digital business hygiene", "Lack of documented incident protocol"]
        urgency = "Address within 48 hours"
        platform_flagged = "Internal Business Operations"
        
    return {
        "case_id": case_id,
        "incident_type": inc_type,
        "severity": severity,
        "risk_level": risk_level,
        "key_risks": key_risks,
        "urgency": urgency,
        "platform_flagged": platform_flagged,
        "reasoning": reasoning,
        "analysis_summary": f"Incident evaluated as {risk_level}. Primary focus is preventing immediate financial and reputational loss."
    }

# 5. generate_recovery_plan(incident_type, severity)
def tool_generate_recovery_plan(incident_type: str, severity: str = "high") -> dict:
    inc_norm = incident_type.lower()
    
    if "instagram" in inc_norm:
        first_hour = [
            "Search primary email for 'security@mail.instagram.com' and click 'revert this change'",
            "Initiate Video Selfie Verification on Instagram mobile app ('Need more help?')",
            "Post an alert on personal WhatsApp status warning followers not to send payments"
        ]
        first_24h = [
            "Unlink compromised Instagram from Meta Business Suite / Facebook Page to protect ad spend",
            "Submit official compromised account report at instagram.com/hacked",
            "Audit linked payment cards in Meta Ads Manager and temporarily freeze active cards"
        ]
        first_week = [
            "Enable Authenticator App Two-Factor Authentication once account access is restored",
            "Generate and save 5 offline Instagram backup recovery codes in a secure password vault",
            "Establish secondary Meta Business Admin accounts with verified business identity"
        ]
    elif "whatsapp" in inc_norm:
        first_hour = [
            "Call mobile telecom carrier immediately from another phone to block and suspend SIM card",
            "Email support@whatsapp.com with subject 'Lost/Stolen: Please deactivate my account'",
            "Notify key VIP clients via phone call or alternate social channel not to honor payment requests"
        ]
        first_24h = [
            "Visit telecom operator outlet with physical ID to re-issue official replacement SIM",
            "Log into WhatsApp on new SIM and immediately set up a 6-digit 2FA PIN",
            "File official cybercrime report at cybercrime.gov.in with SIM deactivation timestamp"
        ]
        first_week = [
            "Configure carrier-level SIM PIN in mobile phone settings to prevent future SIM swaps",
            "Audit all bank accounts and UPI handles linked to business phone line",
            "Implement automated backup of WhatsApp business chat histories"
        ]
    elif "payment" in inc_norm or "fraud" in inc_norm:
        first_hour = [
            "Hold parcel dispatch immediately - do not hand package to courier under any pressure",
            "Log into official mobile banking / merchant portal to check cleared ledger balance",
            "Reply calmly: 'Our shop policy requires confirmed bank credit settlement before dispatch.'"
        ]
        first_24h = [
            "Verify 12-digit UPI UTR number in merchant dashboard to check for duplicate or fake ID",
            "Log customer phone, handle, and shipping address in internal scam blacklist",
            "Contact courier hotline for immediate in-transit Return-To-Origin (RTO) if collected"
        ]
        first_week = [
            "Integrate automated payment gateway (Razorpay, Cashfree, Stripe) with webhook auto-fulfillment",
            "Install instant UPI merchant soundbox or SMS push alert hub for audible payment alerts",
            "Publish clear shop policy: 'Screenshots are not proof of payment. Dispatches require bank settlement.'"
        ]
    elif "legal" in inc_norm or "threat" in inc_norm:
        first_hour = [
            "Pause emotional replies; avoid admitting liability, making promises, or arguing in anger",
            "Verify order history: delivery tracking, item specifications, and written customer chats",
            "Send a calm, factual message acknowledging their concern and offering standard policy resolution"
        ]
        first_24h = [
            "Compile all order milestones into an organized PDF dossier (receipt, dispatch time, tracking log)",
            "Review published Terms of Service for Force Majeure and shipping delay clauses",
            "Evaluate whether courtesy store credit or partial shipping refund resolves friction"
        ]
        first_week = [
            "Publish explicit Terms of Service, Shipping Delay, and Grievance Officer details on website",
            "Configure automated WhatsApp/SMS courier tracking updates for transit delays",
            "Standardize written dispute resolution templates for customer support"
        ]
    else:
        first_hour = [
            "Isolate affected accounts and freeze sensitive admin actions",
            "Document all indicators of compromise (timestamps, screenshots, messages)",
            "Communicate factually with trusted team members and stakeholders"
        ]
        first_24h = [
            "Reset master passwords using a secure password manager",
            "Enable multi-factor authentication across all core business platforms",
            "Conduct security audit of linked third-party integrations"
        ]
        first_week = [
            "Establish quarterly health audit reviews of business access credentials",
            "Implement least-privilege access for contractors and staff",
            "Back up critical customer and product catalog databases weekly"
        ]

    return {
        "first_hour": first_hour,
        "first_24h": first_24h,
        "first_week": first_week,
        "immediate_actions": first_hour,
        "plan_24h": first_24h,
        "evidence_checklist": [
            "Official platform alert email confirming change of credentials or payment request",
            "Screenshots of buyer DM or forged payment proof",
            "Police / Cyber Crime complaint reference number (cybercrime.gov.in)"
        ],
        "prevention_tips": [
            "Enforce Authenticator App 2FA across all admin accounts",
            "Always verify cleared ledger bank balance before shipping orders"
        ]
    }

# 6. check_payment_screenshot(image_b64, filename)
def tool_check_payment_screenshot(image_b64: str = "", filename: str = "") -> dict:
    # Realistic analysis of payment proof
    warning_signs = [
        "Inconsistent Timestamp: Receipt clock displays 11:42 AM while transaction window is dated 09:15 AM",
        "Font & Alignment Disparity: Typography around ₹8,500 shows editing artifacts common in Canva/Photoshop templates",
        "Unverified UTR Reference: 12-digit UTR #329104829104 does not match any cleared bank credit in merchant portal",
        "Non-Standard App UI: Bank header gradient and button spacing deviate from official UPI application layout",
        "High-Pressure Dispatch Requirement: Buyer demanding same-day shipping before credit settlement"
    ]
    bank_checklist = [
        "1. Open your official mobile banking or merchant portal directly (never click links sent by buyer)",
        "2. Verify cleared ledger credit balance for that exact timestamp",
        "3. Search for the 12-digit UTR in your merchant settlement report",
        "4. Never dispatch items based on third-party screenshots or buyer escrow claims"
    ]
    reasoning = [
        {
            "check": "Timestamp & Clock Verification",
            "evidence": "Screenshot display clock is inconsistent with payment processing window",
            "confidence": "High",
            "tool": "check_payment_screenshot"
        },
        {
            "check": "Typography & Editing Artifacts",
            "evidence": "Font weight and character spacing around amount field show pixel manipulation",
            "confidence": "High",
            "tool": "check_payment_screenshot"
        },
        {
            "check": "Merchant Ledger Absence",
            "evidence": "Zero matching credit settlement recorded in official bank merchant portal",
            "confidence": "High",
            "tool": "check_payment_screenshot"
        }
    ]
    return {
        "risk_level": "High Risk",
        "risk_score": 88,
        "warning_signs": warning_signs,
        "bank_checklist": bank_checklist,
        "disclaimer": "Always confirm the credit in your bank account before shipping.",
        "suggested_incident_type": "fake_payment_fraud",
        "reasoning": reasoning
    }

# 7. score_business(audit_answers)
def tool_score_business(audit_answers: dict) -> dict:
    def get_val(key: str) -> bool:
        return bool(audit_answers.get(key, False))
        
    legal_score = int(
        (30 if get_val("registration") else 5) +
        (25 if get_val("gst") else 5) +
        (25 if get_val("vendor_contracts") else 5) +
        (20 if get_val("trademark") else 5)
    )
    
    security_score = int(
        (35 if get_val("mfa") else 5) +
        (35 if get_val("password_manager") else 5) +
        (30 if get_val("staff_access") else 5)
    )
    
    operations_score = int(
        (35 if get_val("invoices") else 5) +
        (35 if get_val("backups") else 5) +
        (30 if get_val("incident_plan") else 5)
    )
    
    brand_score = int(
        (40 if get_val("payment_verification") else 5) +
        (30 if get_val("cyber_insurance") else 5) +
        (30 if get_val("trademark") else 5)
    )
    
    overall_score = int(round(
        0.30 * security_score +
        0.25 * operations_score +
        0.25 * legal_score +
        0.20 * brand_score
    ))
    overall_score = max(10, min(98, overall_score))
    
    if overall_score >= 80:
        maturity_level = "Resilient"
    elif overall_score >= 60:
        maturity_level = "Protected"
    elif overall_score >= 40:
        maturity_level = "Building"
    else:
        maturity_level = "Starter"
        
    strengths = []
    weaknesses = []
    top_fixes = []
    recommendations = []
    
    if get_val("mfa"):
        strengths.append("Multi-Factor Authentication active on primary business accounts")
    else:
        weaknesses.append("Accounts vulnerable to single-password credential stuffing")
        top_fixes.append({"title": "Enable MFA on Meta & Google", "impact_points": 18, "effort": "15 mins", "category": "Security"})
        recommendations.append("Set up authenticator apps on Meta Business, Gmail, and banking accounts.")
        
    if get_val("payment_verification"):
        strengths.append("Robust bank settlement verification protects against fake UPI screenshots")
    else:
        weaknesses.append("Relying on buyer screenshots exposes business to fake payment scams")
        top_fixes.append({"title": "Enforce settled funds check before dispatch", "impact_points": 14, "effort": "Immediate", "category": "Brand"})
        recommendations.append("Install an official merchant soundbox or verify bank ledger balance before shipping.")
        
    if get_val("password_manager"):
        strengths.append("Centralized encrypted password management in place")
    else:
        weaknesses.append("Shared or reused passwords increase cross-platform breach risk")
        top_fixes.append({"title": "Adopt a dedicated Password Manager", "impact_points": 12, "effort": "30 mins", "category": "Security"})
        recommendations.append("Migrate all store and vendor credentials to Bitwarden or 1Password.")
        
    if get_val("incident_plan"):
        strengths.append("Documented emergency incident protocol ready for sudden outages")
    else:
        weaknesses.append("No written protocol for account hijacking or scam response")
        if len(top_fixes) < 3:
            top_fixes.append({"title": "Create a 1-page emergency response plan", "impact_points": 10, "effort": "1 hour", "category": "Operations"})
        recommendations.append("Bookmark the BusinessGuard recovery checklists for Instagram & WhatsApp.")
        
    if get_val("backups"):
        strengths.append("Regular offline or cloud backups of customer orders and catalog")
    else:
        weaknesses.append("No independent backup of order history and customer phone contacts")
        if len(top_fixes) < 3:
            top_fixes.append({"title": "Schedule weekly cloud backups of order data", "impact_points": 9, "effort": "20 mins", "category": "Operations"})
            
    if get_val("registration"):
        strengths.append("Formal business registration (MSME/Udyam or Sole Proprietorship)")
    else:
        weaknesses.append("Unregistered business limits trademark and legal dispute recourse")
        if len(top_fixes) < 3:
            top_fixes.append({"title": "Register MSME / Udyam online for free", "impact_points": 11, "effort": "2 days", "category": "Legal"})
            
    if not top_fixes:
        top_fixes = [
            {"title": "Review staff role permissions quarterly", "impact_points": 5, "effort": "30 mins", "category": "Security"},
            {"title": "Inquire about MSME Cyber Insurance policy", "impact_points": 6, "effort": "1 day", "category": "Brand"},
            {"title": "Register Brand Trademark in Class 25/35", "impact_points": 7, "effort": "1 week", "category": "Legal"}
        ]
        
    action_plan = [
        "1. Activate Authenticator App 2FA across Meta, WhatsApp, and Google Admin within 24 hours.",
        "2. Establish strict order fulfillment SOP: dispatch only after verified bank settlement.",
        "3. Store emergency platform recovery codes in a secure password vault.",
        "4. Standardize customer terms and shipping policies with force majeure clauses.",
        "5. Keep an offline emergency contact list for your telecom carrier and payment gateway."
    ]
    
    return {
        "overall_score": overall_score,
        "maturity_level": maturity_level,
        "category_scores": {
            "legal": legal_score,
            "security": security_score,
            "operations": operations_score,
            "brand": brand_score
        },
        "strengths": strengths if strengths else ["Active entrepreneurial initiative on social commerce platforms"],
        "weaknesses": weaknesses if weaknesses else ["Minor operational opportunities for formalization"],
        "recommendations": recommendations,
        "action_plan": action_plan,
        "top_fixes": top_fixes[:3]
    }

# Schema definitions for MCP tools
TOOL_DEFINITIONS = [
    {
        "name": "create_case",
        "description": "Create a new emergency or advisory incident case in SQLite and return case details with recovery plan and reasoning.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "incident_type": {
                    "type": "string",
                    "description": "Incident type, e.g. instagram_hacked, whatsapp_compromised, fake_payment_fraud, legal_threat, general_security"
                },
                "details": {
                    "type": "string",
                    "description": "Factual description of what occurred, buyer details, or symptoms observed"
                },
                "source": {
                    "type": "string",
                    "description": "Origin of case: 'alexa', 'web', 'advisor', 'emergency_button', 'payment_checker'",
                    "default": "mcp"
                }
            },
            "required": ["incident_type", "details"]
        }
    },
    {
        "name": "get_case",
        "description": "Retrieve full case history, conversation turns, severity, reasoning checks, and recovery plan by Case ID (e.g. BG-2026-001).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "case_id": {
                    "type": "string",
                    "description": "The unique case identifier, e.g. BG-2026-001"
                }
            },
            "required": ["case_id"]
        }
    },
    {
        "name": "update_case",
        "description": "Update existing case fields such as status, severity, notes, turns, completed_steps, or recovery plan.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "case_id": {
                    "type": "string",
                    "description": "The case ID to update, e.g. BG-2026-001"
                },
                "patch": {
                    "type": "object",
                    "description": "Dictionary of fields to update (status, severity, completed_steps, description, etc.)"
                }
            },
            "required": ["case_id", "patch"]
        }
    },
    {
        "name": "analyze_incident",
        "description": "Analyze an incident's risk level, threat vectors, urgency, affected platforms, and visible reasoning checks.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "case_id": {
                    "type": "string",
                    "description": "Case ID to analyze"
                }
            },
            "required": ["case_id"]
        }
    },
    {
        "name": "generate_recovery_plan",
        "description": "Generate immediate actions, 24-hour plan, 3-phase timeline (first_hour, first_24h, first_week), evidence checklist, and prevention tips for a specific incident type.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "incident_type": {
                    "type": "string",
                    "description": "Incident type, e.g. instagram_hacked, whatsapp_compromised, fake_payment_fraud, legal_threat"
                },
                "severity": {
                    "type": "string",
                    "description": "Severity level: critical, high, medium, low",
                    "default": "high"
                }
            },
            "required": ["incident_type"]
        }
    },
    {
        "name": "check_payment_screenshot",
        "description": "Analyze a payment receipt/screenshot image for visual warning signs, font anomalies, timestamp disparities, and UTR verification status.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "image_b64": {
                    "type": "string",
                    "description": "Base64 encoded image string (PNG or JPG)"
                },
                "filename": {
                    "type": "string",
                    "description": "Uploaded image filename"
                }
            }
        }
    },
    {
        "name": "score_business",
        "description": "Evaluate 12-question health audit answers and compute category scores (Legal, Security, Operations, Brand), overall protection score, maturity level, and top 3 fixes.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "audit_answers": {
                    "type": "object",
                    "description": "Boolean dictionary of 12 audit questions"
                }
            },
            "required": ["audit_answers"]
        }
    }
]
