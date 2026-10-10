import urllib.request
import json

def test():
    base = 'http://127.0.0.1:8000'
    print("1. Testing Health and MCP tools...")
    with urllib.request.urlopen(f"{base}/health") as r:
        assert r.status == 200
        print("   /health OK:", json.loads(r.read()))
    with urllib.request.urlopen(f"{base}/mcp/tools") as r:
        assert r.status == 200
        tools = json.loads(r.read())['tools']
        print(f"   /mcp/tools OK: {len(tools)} tools exposed")

    print("\n2. Testing Alexa Flow...")
    # Turn 0
    data0 = json.dumps({'transcript': 'Alexa, ask BusinessGuard, my Instagram was hacked.', 'turn_index': 0}).encode('utf-8')
    req0 = urllib.request.Request(f"{base}/api/alexa/interact", data=data0, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req0) as r:
        res0 = json.loads(r.read())
        print("   Turn 0 next question:", res0['next_question'])
    
    # Turn 1
    data1 = json.dumps({'transcript': 'No, I cannot log in.', 'turn_index': 1, 'previous_answers': {'incident_type': 'instagram_hacked', 'initial_complaint': 'my Instagram was hacked'}}).encode('utf-8')
    req1 = urllib.request.Request(f"{base}/api/alexa/interact", data=data1, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req1) as r:
        res1 = json.loads(r.read())
        print("   Turn 1 next question:", res1['next_question'])
    
    # Turn 2
    data2 = json.dumps({'transcript': 'Yes, got an email saying it was changed.', 'turn_index': 2, 'previous_answers': {'incident_type': 'instagram_hacked'}}).encode('utf-8')
    req2 = urllib.request.Request(f"{base}/api/alexa/interact", data=data2, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req2) as r:
        res2 = json.loads(r.read())
        print("   Turn 2 next question:", res2['next_question'])

    # Turn 3 (Final Resolution)
    data3 = json.dumps({'transcript': 'Yes, they are messaging my followers for money right now!', 'turn_index': 3, 'previous_answers': {'incident_type': 'instagram_hacked'}}).encode('utf-8')
    req3 = urllib.request.Request(f"{base}/api/alexa/interact", data=data3, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req3) as r:
        res3 = json.loads(r.read())
        created_case = res3['case_id']
        print("   Turn 3 Case Created:", created_case)
        print("   Spoken snippet:", res3['spoken_response'][:110] + "...")

    print(f"\n3. Testing Case Lookup ({created_case})...")
    with urllib.request.urlopen(f"{base}/api/cases/{created_case}") as r:
        case = json.loads(r.read())
        print("   Case Title:", case['title'])
        print("   Source:", case['source'])
        print("   Turns count:", len(case['turns']))
        print("   Recovery plan immediate actions:", len(case['recovery_plan']['immediate_actions']))

    print(f"\n4. Testing AI Advisor continuation on {created_case}...")
    chat_payload = json.dumps({
        'messages': [{'role': 'user', 'content': 'What should I tell my followers on WhatsApp right now?'}],
        'case_id': created_case
    }).encode('utf-8')
    req_chat = urllib.request.Request(f"{base}/api/chat", data=chat_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_chat) as r:
        chat_res = json.loads(r.read())
        print("   Advisor provider:", chat_res['provider'])
        print("   Advisor answer snippet:", chat_res['answer'][:90] + "...")
        print("   Structured card risk level:", chat_res['structured_card']['risk_level'])

    print("\n5. Testing Emergency Dispatch...")
    emg_payload = json.dumps({'emergency_type': 'whatsapp_compromised', 'details': 'Phone SIM swapped'}).encode('utf-8')
    req_emg = urllib.request.Request(f"{base}/api/emergency", data=emg_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_emg) as r:
        emg_res = json.loads(r.read())
        print("   Emergency Case ID:", emg_res['case_id'])
        print("   Emergency Severity:", emg_res['severity'])
        print("   Immediate Actions count:", len(emg_res['immediate_actions']))

    print("\n6. Testing Health Audit & Protection Score...")
    audit_payload = json.dumps({
        'registration': True, 'gst': True, 'mfa': True, 'invoices': True,
        'vendor_contracts': False, 'trademark': False, 'backups': True,
        'password_manager': True, 'staff_access': False, 'cyber_insurance': False,
        'payment_verification': True, 'incident_plan': True
    }).encode('utf-8')
    req_audit = urllib.request.Request(f"{base}/api/audit", data=audit_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_audit) as r:
        audit_res = json.loads(r.read())
        print("   Overall Protection Score:", audit_res['overall_score'])
        print("   Maturity Level:", audit_res['maturity_level'])
        print("   Category Scores:", audit_res['category_scores'])
        print("   Top Fixes count:", len(audit_res['top_fixes']))

    print("\n7. Testing Cases Ledger List & Filter...")
    with urllib.request.urlopen(f"{base}/api/cases") as r:
        cases_list = json.loads(r.read())['cases']
        print(f"   Total cases in DB: {len(cases_list)}")
        for c in cases_list[:4]:
            cid = c['id']
            title = c['title']
            sev = c['severity']
            src = c['source']
            safe_title = title.encode('ascii', errors='replace').decode('ascii')
            print(f"     - {cid}: {safe_title} ({sev}, {src})")

    print("\n==========================================")
    print("ALL END-TO-END VERIFICATION CHECKS PASSED!")
    print("==========================================")

if __name__ == '__main__':
    test()
