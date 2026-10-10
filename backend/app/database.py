import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

DB_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "businessguard.db"

def get_db_connection() -> sqlite3.Connection:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Cases Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        incident_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        title TEXT NOT NULL,
        description TEXT,
        source TEXT NOT NULL DEFAULT 'web',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        answers TEXT,
        turns TEXT,
        recovery_plan TEXT,
        metadata TEXT
    )
    """)
    
    # Audit Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        maturity_level TEXT NOT NULL,
        category_scores TEXT NOT NULL,
        strengths TEXT,
        weaknesses TEXT,
        recommendations TEXT,
        action_plan TEXT,
        answers TEXT NOT NULL
    )
    """)
    
    conn.commit()
    
    # Check if seed cases are needed
    cursor.execute("SELECT COUNT(*) as count FROM cases")
    row = cursor.fetchone()
    if row and row["count"] == 0:
        seed_cases(conn)
        
    conn.close()

def generate_next_case_id(cursor: sqlite3.Cursor) -> str:
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
    next_num = highest_num + 1
    return f"BG-{year}-{next_num:03d}"

def seed_cases(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    sample_cases = [
        {
            "id": "BG-2026-001",
            "incident_type": "whatsapp_compromised",
            "severity": "critical",
            "status": "in_progress",
            "title": "WhatsApp Business SIM Swap & Impersonation",
            "description": "Scammer cloned phone number and took over business WhatsApp account. Demanding ransom and messaging catalog customers.",
            "source": "alexa",
            "created_at": "2026-10-08T09:15:00Z",
            "updated_at": "2026-10-09T14:30:00Z",
            "answers": json.dumps({"can_login": False, "sim_active": False, "passcode_set": False}),
            "turns": json.dumps([
                {"role": "user", "content": "Alexa, ask BusinessGuard, my WhatsApp business line stopped working and customers are being messaged for money.", "timestamp": "2026-10-08T09:15:00Z", "source": "voice"},
                {"role": "assistant", "content": "I understand how urgent this is. Do you still have mobile carrier signal on your phone?", "timestamp": "2026-10-08T09:15:05Z", "source": "voice"},
                {"role": "user", "content": "No, signal disappeared 2 hours ago.", "timestamp": "2026-10-08T09:15:20Z", "source": "voice"},
                {"role": "assistant", "content": "This points to an unauthorized SIM swap. I have registered Case BG-2026-001. Immediately call your telecom carrier from another phone to lock the SIM, warn your customers on Instagram/Email, and email WhatsApp support.", "timestamp": "2026-10-08T09:15:35Z", "source": "voice"}
            ]),
            "recovery_plan": json.dumps({
                "immediate_actions": [
                    "Call telecom provider immediately from a secondary phone to block SIM card and report fraud",
                    "Email support@whatsapp.com with subject: 'Lost/Stolen: Please deactivate my account' including phone number in full international format",
                    "Post an emergency notice on Instagram, Facebook, and website warning customers not to send payments"
                ],
                "plan_24h": [
                    "Visit telecom store with physical government ID to recover official SIM ownership",
                    "Request transaction logs and bank statements to check for unauthorized payment gateway redirects",
                    "File an official cyber crime report at cybercrime.gov.in with SIM deactivation timestamp"
                ],
                "evidence_checklist": [
                    "Telecom SMS confirmation of SIM swap or lost signal time",
                    "Screenshots of fraudulent messages sent to customers",
                    "Customer complaint messages and any payment transfer attempts",
                    "Police / Cyber cell complaint reference number"
                ],
                "prevention_tips": [
                    "Set up WhatsApp Two-Step Verification PIN with an emergency email backup",
                    "Lock SIM card with a carrier-level SIM PIN",
                    "Never share 6-digit registration codes or SMS OTPs with anyone"
                ]
            }),
            "metadata": json.dumps({"business_name": "Craft Jewelry by Meera", "platform": "WhatsApp Business"})
        },
        {
            "id": "BG-2026-002",
            "incident_type": "fake_payment_fraud",
            "severity": "high",
            "status": "open",
            "title": "Manipulated UPI Payment Screenshot (₹8,500 order)",
            "description": "Buyer sent an edited screenshot showing ₹8,500 transferred and is demanding urgent same-day courier dispatch.",
            "source": "web",
            "created_at": "2026-10-09T11:42:00Z",
            "updated_at": "2026-10-09T11:42:00Z",
            "answers": json.dumps({"money_in_bank": False, "ref_number_valid": False}),
            "turns": json.dumps([
                {"role": "user", "content": "A buyer sent a payment screenshot for ₹8,500 but my bank statement shows zero deposit. They claim it is in escrow.", "timestamp": "2026-10-09T11:42:00Z", "source": "web"},
                {"role": "assistant", "content": "Do not dispatch the goods. UPI and direct bank transfers never hold funds in buyer-controlled escrow. Only trust cleared funds visible inside your actual banking app.", "timestamp": "2026-10-09T11:42:05Z", "source": "web"}
            ]),
            "recovery_plan": json.dumps({
                "immediate_actions": [
                    "Hold shipment immediately - do not hand package to courier under any pressure",
                    "Verify actual bank balance via official mobile banking app or SMS alert, not third-party links",
                    "Respond firmly in chat: 'We dispatch strictly after credit settlement appears in our merchant account.'"
                ],
                "plan_24h": [
                    "Log sender's phone number, Instagram handle, and delivery address in scam ledger",
                    "Check if the UTR / transaction ID is duplicated or fabricated",
                    "Inform delivery partner to return package to warehouse if already picked up"
                ],
                "evidence_checklist": [
                    "Screenshot of the fake payment receipt submitted by buyer",
                    "Official bank statement proving zero credit at that timestamp",
                    "Chat log of buyer attempting high-pressure dispatch demands"
                ],
                "prevention_tips": [
                    "Use integrated payment links (Razorpay, Cashfree, Shopify Payments) instead of manual screenshot verification",
                    "Enable instant audio soundbox or SMS push alerts for confirmed UPI credits",
                    "Establish a written shop policy: 'Dispatches occur only after settled funds confirmation.'"
                ]
            }),
            "metadata": json.dumps({"business_name": "Artisan Leather Goods", "amount": 8500})
        },
        {
            "id": "BG-2026-003",
            "incident_type": "legal_threat",
            "severity": "medium",
            "status": "resolved",
            "title": "Defamation & Legal Notice Threat over Courier Transit Delay",
            "description": "Customer threatened to sue for ₹1,00,000 and post smear campaigns on consumer forums due to 2-day monsoon courier delay.",
            "source": "advisor",
            "created_at": "2026-10-06T15:20:00Z",
            "updated_at": "2026-10-08T18:00:00Z",
            "answers": json.dumps({"tracking_shared": True, "policy_on_site": True}),
            "turns": json.dumps([
                {"role": "user", "content": "Customer is threatening me with a court notice and consumer court case because courier was delayed by rain.", "timestamp": "2026-10-06T15:20:00Z", "source": "web"},
                {"role": "assistant", "content": "Stay calm and do not engage in heated arguments. Courier transit delays caused by force majeure (weather) are covered under standard terms of service. Send a calm, factual status update with tracking proof.", "timestamp": "2026-10-06T15:20:06Z", "source": "web"}
            ]),
            "recovery_plan": json.dumps({
                "immediate_actions": [
                    "Acknowledge the customer's frustration calmly without admitting legal liability",
                    "Share live courier tracking link with courier partner's official weather advisory note",
                    "Offer complimentary expedited shipping refund or store credit as goodwill"
                ],
                "plan_24h": [
                    "Review published Terms of Service regarding estimated vs guaranteed delivery timelines",
                    "Archive all correspondence and order timestamps into a single PDF file",
                    "Follow up once delivery partner marks out-for-delivery to ensure peaceful resolution"
                ],
                "evidence_checklist": [
                    "Original order confirmation showing estimated delivery window",
                    "Courier tracking history log with weather delay notes",
                    "Polite written email or chat communication record"
                ],
                "prevention_tips": [
                    "Add explicit Force Majeure and shipping delay clauses in checkout terms",
                    "Set proactive SMS notification triggers when couriers report transit delay",
                    "Avoid personal phone debates; maintain clear, documented written communications"
                ]
            }),
            "metadata": json.dumps({"business_name": "Sweet Treats Bakery", "resolution": "Delivered successfully with complimentary ₹150 coupon"})
        },
        {
            "id": "BG-2026-004",
            "incident_type": "instagram_hacked",
            "severity": "critical",
            "status": "in_progress",
            "title": "Phishing Link Clicked via Direct Message - Password & Email Changed",
            "description": "Seller received fake copyright infringement DM, clicked external form, and account credentials were changed within 5 minutes.",
            "source": "web",
            "created_at": "2026-10-07T14:10:00Z",
            "updated_at": "2026-10-09T16:20:00Z",
            "answers": json.dumps({"received_revert_email": True, "hacker_added_2fa": True}),
            "turns": json.dumps([
                {"role": "user", "content": "I clicked a copyright warning DM on Instagram and now I can't log in. My email was replaced by a Russian domain.", "timestamp": "2026-10-07T14:10:00Z", "source": "web"},
                {"role": "assistant", "content": "Do not panic. Check your original email inbox immediately for an official message from security@mail.instagram.com stating 'Your email was changed'. Click 'revert this change' or 'secure your account'.", "timestamp": "2026-10-07T14:10:08Z", "source": "web"}
            ]),
            "recovery_plan": json.dumps({
                "immediate_actions": [
                    "Search primary email for 'security@mail.instagram.com' and click 'revert this change' or 'secure your account here'",
                    "Initiate Video Selfie Verification on the mobile Instagram app via 'Need more help?' login support",
                    "Notify followers and collaborators via personal account or WhatsApp status that business handle is hijacked"
                ],
                "plan_24h": [
                    "Revoke linked Facebook Page access or unlink Meta Business Manager if access remains in Business Suite",
                    "Report compromised account via instagram.com/hacked",
                    "Change passwords and terminate sessions on all accounts sharing similar credentials"
                ],
                "evidence_checklist": [
                    "Screenshot of phishing DM purporting to be Instagram Copyright Support",
                    "Notification email from Meta confirming email/phone change timestamp",
                    "Government photo ID and business incorporation document for Meta identity appeal"
                ],
                "prevention_tips": [
                    "Remember: Meta NEVER sends official copyright notices via Instagram Direct Messages",
                    "Always enforce App-based Two-Factor Authentication (Authenticator app, not SMS alone)",
                    "Maintain secondary business admin accounts with verified Meta Business Portfolio"
                ]
            }),
            "metadata": json.dumps({"business_name": "Home Decor Co.", "followers": 42000})
        }
    ]
    
    for case in sample_cases:
        cursor.execute("""
        INSERT INTO cases (id, incident_type, severity, status, title, description, source, created_at, updated_at, answers, turns, recovery_plan, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            case["id"], case["incident_type"], case["severity"], case["status"], case["title"],
            case["description"], case["source"], case["created_at"], case["updated_at"],
            case["answers"], case["turns"], case["recovery_plan"], case["metadata"]
        ))
        
    conn.commit()
