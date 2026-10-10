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
    return conn

# 1. create_case(incident_type, details)
def tool_create_case(incident_type: str, details: str, source: str = "mcp", answers: Optional[dict] = None) -> dict:
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
    
    cursor.execute("""
    INSERT INTO cases (id, incident_type, severity, status, title, description, source, created_at, updated_at, answers, turns, recovery_plan, metadata)
    VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        json.dumps({"created_by": source})
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
    for json_col in ["answers", "turns", "recovery_plan", "metadata"]:
        if case_dict.get(json_col):
            try:
                case_dict[json_col] = json.loads(case_dict[json_col])
            except Exception:
                pass
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
        
    allowed_fields = ["status", "severity", "title", "description", "answers", "turns", "recovery_plan", "metadata"]
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
        "analysis_summary": f"Incident evaluated as {risk_level}. Primary focus is preventing immediate financial and reputational loss."
    }

# 5. generate_recovery_plan(incident_type, severity)
def tool_generate_recovery_plan(incident_type: str, severity: str = "high") -> dict:
    inc_norm = incident_type.lower()
    
    if "instagram" in inc_norm:
        return {
            "immediate_actions": [
                "Search your registered email inbox for 'security@mail.instagram.com' and click 'revert this change' immediately",
                "Open Instagram mobile app, tap 'Forgot password?' -> 'Need more help?' -> request Video Selfie Identity Verification",
                "Publish an alert on your personal WhatsApp Status and Facebook Page alerting followers not to transfer money"
            ],
            "plan_24h": [
                "Unlink compromised Instagram from Meta Business Suite / Facebook Page to protect ad spend",
                "Submit official compromised account report at instagram.com/hacked",
                "Audit linked payment cards in Meta Ads Manager and temporarily freeze active advertising cards",
                "Reset passwords and terminate all active sessions for your business email and cloud storage"
            ],
            "evidence_checklist": [
                "Original registration email address and username proof",
                "Screenshots of official Meta 'Email changed' notification emails",
                "Recent business utility bills, GST certificate, or bank statement matching business name for Meta appeal",
                "Police / Cyber Crime complaint reference number (cybercrime.gov.in)"
            ],
            "prevention_tips": [
                "Never click copyright violation warning links received via Instagram Direct Messages",
                "Enforce Authenticator App 2FA (e.g. Google Authenticator) instead of SMS-only OTPs",
                "Save and store 5 offline Instagram Backup Backup Codes in a secure password manager",
                "Designate at least two trusted Business Admins inside Meta Business Manager"
            ]
        }
    elif "whatsapp" in inc_norm:
        return {
            "immediate_actions": [
                "Call your mobile telecom carrier immediately from another phone to lock and suspend the SIM card",
                "Send an emergency email to support@whatsapp.com with subject: 'Lost/Stolen: Please deactivate my account' (+[Country Code][Number])",
                "Notify key VIP clients via phone call or alternate social channel not to honor payment requests"
            ],
            "plan_24h": [
                "Visit your telecom operator outlet with physical government photo ID to re-issue official SIM",
                "Log into WhatsApp on new SIM and immediately set up a 6-digit Two-Step Verification PIN",
                "Check linked bank accounts and UPI IDs for suspicious balance checks or transfers",
                "File cybercrime report with call logs and time when mobile network dropped"
            ],
            "evidence_checklist": [
                "Exact timestamp when network signal ceased on physical device",
                "Telecom store interaction receipt and replacement SIM confirmation",
                "Screenshots of fraudulent messages forwarded by concerned customers",
                "Log of all bank accounts linked to that mobile number"
            ],
            "prevention_tips": [
                "Set a carrier SIM PIN (default is usually 0000/1234 - customize it immediately in phone settings)",
                "Enable WhatsApp Two-Step Verification with an emergency rescue email address",
                "Never reveal 6-digit SMS registration codes to anyone claiming to be WhatsApp support"
            ]
        }
    elif "payment" in inc_norm or "fraud" in inc_norm:
        return {
            "immediate_actions": [
                "Hold parcel dispatch immediately - do not let shipping partners collect without settled bank credit",
                "Open your official mobile banking or merchant app to confirm cleared funds (do NOT rely on buyer screenshots)",
                "Send a professional canned response: 'Our accounting policy requires settled bank credit verification prior to shipment.'"
            ],
            "plan_24h": [
                "Verify the 12-digit UPI UTR number in your merchant dashboard to confirm if transaction exists or is forged",
                "Log customer profile, shipping address, and phone number in internal fraud blacklist",
                "If courier was already dispatched, instruct courier API / hotline for immediate in-transit return-to-origin (RTO)"
            ],
            "evidence_checklist": [
                "Customer's forged payment screenshot (preserving image file metadata)",
                "Full chat transcript including delivery pressure tactics",
                "Bank statement for that 4-hour window demonstrating no matching transaction credit",
                "Courier consignment note / tracking number"
            ],
            "prevention_tips": [
                "Deploy automated payment gateway links (Razorpay, Cashfree, Stripe) that trigger webhook auto-fulfillment",
                "Install a UPI Soundbox or SMS notification hub for instant audible payment verification",
                "Display clear shop policy: 'Screenshots are not proof of payment. Orders dispatch only upon bank settlement.'"
            ]
        }
    elif "legal" in inc_norm or "threat" in inc_norm:
        return {
            "immediate_actions": [
                "Pause all emotional replies; do not admit fault, make promises, or insult the customer in anger",
                "Verify order history: delivery tracking, item specification, and written customer communication",
                "Send a calm, structured message acknowledging their concern and offering standard policy resolution"
            ],
            "plan_24h": [
                "Compile all order milestones into an organized PDF dossier (receipt, dispatch time, tracking log)",
                "Check your published refund, return, and shipping terms for applicable force majeure clauses",
                "Evaluate whether a full/partial store credit or courtesy gesture resolves the friction peacefully"
            ],
            "evidence_checklist": [
                "Purchase timestamp and invoice detailing items purchased",
                "Courier tracking trail with delivery attempt timestamps and driver notes",
                "Unedited chat / email records with exact date and time stamps",
                "Published website Terms & Conditions and Shipping Policy at the time of purchase"
            ],
            "prevention_tips": [
                "Publish clear, accessible Terms of Service, Return Policy, and Grievance Officer details",
                "Proactively notify buyers via automated WhatsApp/SMS notifications when courier delays happen",
                "Maintain professional written communication channels; avoid verbal altercations"
            ]
        }
    else:
        return {
            "immediate_actions": [
                "Isolate affected accounts and freeze sensitive actions",
                "Document all current indicators of compromise (timestamps, screenshots, messages)",
                "Communicate factually with trusted team members and stakeholders"
            ],
            "plan_24h": [
                "Reset master passwords using a secure password manager",
                "Enable multi-factor authentication across all core business platforms",
                "Conduct a 360-degree security audit of linked third-party integrations"
            ],
            "evidence_checklist": [
                "System access logs and IP addresses if available",
                "Screenshots of unauthorized activity",
                "Official support tickets opened with relevant service providers"
            ],
            "prevention_tips": [
                "Conduct quarterly health audits of business access credentials",
                "Implement least-privilege access for contractors and staff",
                "Back up critical customer and product catalog databases weekly"
            ]
        }

# 6. score_business(audit_answers)
def tool_score_business(audit_answers: dict) -> dict:
    # 12 keys: registration, gst, mfa, invoices, vendor_contracts, trademark,
    # backups, password_manager, staff_access, cyber_insurance, payment_verification, incident_plan
    
    # Category weights
    # Legal: registration (30), gst (25), vendor_contracts (25), trademark (20) -> total 100
    # Security: mfa (35), password_manager (35), staff_access (30) -> total 100
    # Operations: invoices (35), backups (35), incident_plan (30) -> total 100
    # Brand: payment_verification (40), cyber_insurance (30), trademark (30) -> total 100
    
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
    
    # Overall score (weighted average)
    overall_score = int(round(
        0.30 * security_score +
        0.25 * operations_score +
        0.25 * legal_score +
        0.20 * brand_score
    ))
    overall_score = max(10, min(98, overall_score))
    
    # Maturity Level
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
        "description": "Create a new emergency or advisory incident case in SQLite and return case details with recovery plan.",
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
                    "description": "Origin of case: 'alexa', 'web', or 'advisor'",
                    "default": "mcp"
                }
            },
            "required": ["incident_type", "details"]
        }
    },
    {
        "name": "get_case",
        "description": "Retrieve full case history, conversation turns, severity, and recovery plan by Case ID (e.g. BG-2026-001).",
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
        "description": "Update existing case fields such as status, severity, notes, turns, or recovery plan.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "case_id": {
                    "type": "string",
                    "description": "The case ID to update, e.g. BG-2026-001"
                },
                "patch": {
                    "type": "object",
                    "description": "Dictionary of fields to update (status, severity, description, etc.)"
                }
            },
            "required": ["case_id", "patch"]
        }
    },
    {
        "name": "analyze_incident",
        "description": "Analyze an incident's risk level, threat vectors, urgency, and affected platforms.",
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
        "description": "Generate immediate actions, 24-hour plan, evidence checklist, and future prevention tips for a specific incident type.",
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
