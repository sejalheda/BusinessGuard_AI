import json
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

def run_tests():
    init_db()
    client = TestClient(app)

    print("1. Testing /health and /mcp/tools...")
    res = client.get("/health")
    assert res.status_code == 200, res.text
    health = res.json()
    assert health["status"] == "ok"
    assert health["tools_count"] == 7
    print(f"   [PASS] /health OK. Tools count: {health['tools_count']}")

    res_tools = client.get("/mcp/tools")
    assert res_tools.status_code == 200
    tools = res_tools.json()["tools"]
    tool_names = [t["name"] for t in tools]
    assert "check_payment_screenshot" in tool_names
    assert "generate_recovery_plan" in tool_names
    print(f"   [PASS] /mcp/tools OK. Tools: {', '.join(tool_names)}")

    print("\n2. Testing Alexa Voice Interaction flow...")
    # Turn 0: User reports hack
    r0 = client.post("/api/alexa/interact", json={
        "transcript": "Alexa, ask BusinessGuard, my Instagram was hacked.",
        "turn_index": 0
    })
    assert r0.status_code == 200
    d0 = r0.json()
    assert not d0["is_complete"]
    assert d0["next_question"]

    # Turn 1
    r1 = client.post("/api/alexa/interact", json={
        "transcript": "No, I cannot log in.",
        "turn_index": 1,
        "previous_answers": {"incident_type": "instagram_hacked", "initial_complaint": "my Instagram was hacked"}
    })
    assert r1.status_code == 200

    # Turn 2
    r2 = client.post("/api/alexa/interact", json={
        "transcript": "Yes, got an email saying my email was changed.",
        "turn_index": 2,
        "previous_answers": {"incident_type": "instagram_hacked"}
    })
    assert r2.status_code == 200

    # Turn 3: Complete rescue & register case
    r3 = client.post("/api/alexa/interact", json={
        "transcript": "Yes, scammers are messaging my buyers asking for cryptocurrency!",
        "turn_index": 3,
        "previous_answers": {"incident_type": "instagram_hacked"}
    })
    assert r3.status_code == 200
    d3 = r3.json()
    assert d3["is_complete"]
    case_id = d3["case_id"]
    assert case_id.startswith("BG-")
    assert len(d3["immediate_actions"]) >= 3
    print(f"   [PASS] Alexa generated Case: {case_id} with {len(d3['immediate_actions'])} actions")

    print(f"\n3. Testing Case Lookup ({case_id})...")
    r_case = client.get(f"/api/cases/{case_id}")
    assert r_case.status_code == 200
    c_data = r_case.json()
    assert c_data["id"] == case_id
    assert c_data["incident_type"] == "instagram_hacked"
    assert c_data["source"] == "alexa"
    assert "recovery_plan" in c_data
    assert len(c_data.get("reasoning", [])) > 0
    print(f"   [PASS] Case {case_id} loaded from SQLite with {len(c_data['reasoning'])} reasoning checks")

    print(f"\n4. Testing AI Advisor with Visible Reasoning on {case_id}...")
    r_chat = client.post("/api/chat", json={
        "messages": [{"role": "user", "content": "What should I post on my personal WhatsApp status right now?"}],
        "case_id": case_id
    })
    assert r_chat.status_code == 200
    chat_res = r_chat.json()
    assert chat_res["provider"] == "mock"
    assert chat_res["structured_card"] is not None
    assert len(chat_res["reasoning"]) > 0
    print(f"   [PASS] Advisor response delivered with {len(chat_res['reasoning'])} reasoning checks")

    print("\n5. Testing Emergency Dispatch with Recovery Plan & Reasoning...")
    r_emg = client.post("/api/emergency", json={
        "emergency_type": "whatsapp_compromised",
        "details": "Lost cellular reception, customer catalog compromised"
    })
    assert r_emg.status_code == 200
    emg_res = r_emg.json()
    assert emg_res["severity"] == "critical"
    assert emg_res["case_id"].startswith("BG-")
    assert len(emg_res["immediate_actions"]) > 0
    assert len(emg_res["plan_24h"]) > 0
    assert len(emg_res.get("reasoning", [])) > 0
    assert emg_res.get("recovery_plan") is not None
    assert "first_hour" in emg_res["recovery_plan"]
    print(f"   [PASS] Emergency case {emg_res['case_id']} created with 3-phase plan and {len(emg_res['reasoning'])} reasoning checks")

    print("\n6. Testing Fake Payment Screenshot Checker (POST /payment-check)...")
    r_pay = client.post("/payment-check", json={
        "image_b64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "filename": "fake_upi_receipt.png"
    })
    assert r_pay.status_code == 200
    pay_res = r_pay.json()
    assert pay_res["risk_level"] in ["High Risk", "Medium Risk", "Low Risk"]
    assert len(pay_res["warning_signs"]) >= 3
    assert len(pay_res["bank_checklist"]) >= 3
    assert len(pay_res.get("reasoning", [])) >= 2
    assert "Always confirm the credit" in pay_res["disclaimer"]
    print(f"   [PASS] Payment checker returned: {pay_res['risk_level']} ({pay_res['risk_score']}%) with {len(pay_res['warning_signs'])} signs")

    print(f"\n7. Testing Recovery Milestone Ticking on {case_id}...")
    completed_steps = [
        "Search primary email for 'security@mail.instagram.com' and click 'revert this change'",
        "Initiate Video Selfie Verification on Instagram mobile app ('Need more help?')"
    ]
    r_tick = client.patch(f"/api/cases/{case_id}", json={
        "completed_steps": completed_steps,
        "turns": [
            {
                "role": "assistant",
                "content": "[Recovery Milestone Update] Step 1 marked as COMPLETED ✓ (+2 Protection Score).",
                "source": "timeline_tick"
            }
        ]
    })
    assert r_tick.status_code == 200
    tick_res = r_tick.json()
    assert len(tick_res.get("completed_steps", [])) == 2
    assert tick_res["completed_steps"][0] == completed_steps[0]
    print(f"   [PASS] Recovery steps persisted in SQLite: {len(tick_res['completed_steps'])} steps completed")

    print("\n8. Testing Health Audit & Protection Score Engine...")
    r_audit = client.post("/api/audit", json={
        "registration": True, "gst": True, "mfa": True, "invoices": True,
        "vendor_contracts": False, "trademark": False, "backups": True,
        "password_manager": True, "staff_access": False, "cyber_insurance": False,
        "payment_verification": True, "incident_plan": True
    })
    assert r_audit.status_code == 200
    audit_res = r_audit.json()
    assert 10 <= audit_res["overall_score"] <= 100
    assert audit_res["maturity_level"] in ["Starter", "Building", "Protected", "Resilient"]
    assert len(audit_res["top_fixes"]) > 0
    print(f"   [PASS] Health Audit score: {audit_res['overall_score']} ({audit_res['maturity_level']}) with top fixes")

    print("\n9. Testing Case Ledger List & Search...")
    r_list = client.get("/api/cases?search=instagram")
    assert r_list.status_code == 200
    found_cases = r_list.json()["cases"]
    assert len(found_cases) > 0
    print(f"   [PASS] Ledger search returned {len(found_cases)} matching cases")

    print("\n" + "=" * 50)
    print("ALL 9 END-TO-END TIER 1 & TIER 2 TESTS PASSED!")
    print("=" * 50)

if __name__ == "__main__":
    run_tests()
