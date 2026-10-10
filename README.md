# BusinessGuard AI 🛡️

> **"Your business's first responder."**  
> *Sub-line: "Hacked, scammed or threatened? Get a calm, step-by-step rescue plan by voice or on screen."*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%2B-brightgreen.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-teal.svg)](https://fastapi.tiangolo.com)
[![Protocol: MCP](https://img.shields.io/badge/Agent-MCP%20Protocol-orange.svg)](https://modelcontextprotocol.io)
[![Frontend: React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue.svg)](https://vitejs.dev)

---

## 📌 Problem Statement

Millions of small businesses and solo creators across Instagram, WhatsApp, and social commerce platforms operate without dedicated IT departments, legal teams, or cyber security defense. When an Instagram account with 30,000 followers gets hijacked through a phishing DM, or a buyer intimidates an owner with a forged UPI screenshot or a fake consumer legal notice, the business owner panics. 

Existing cybersecurity tools are built for enterprise SOC teams with complex dashboards and technical jargon. Meta and platform support ticket queues often take days to respond—while attackers exploit the first 60 minutes to defraud the seller's followers.

**BusinessGuard AI** serves as the **calm, intelligent first responder**. An owner can trigger a rescue by voice through a simulated Alexa+ experience, receive an immediate Case ID (e.g. `BG-2026-005`), and continue the rescue seamlessly on screen with their full 24-hour containment plan, cyber cell evidence checklist, and Business Protection Score.

> **Transparency Note:** BusinessGuard AI is a hackathon prototype. The Alexa+ hardware experience is simulated in the browser, and all seed data represents realistic sample cases. General guidance only, not formal legal advice.

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TD
    User([Small Business Owner / Priya])
    
    subgraph ClientLayer["Frontend Client (React + Vite + Tailwind)"]
        AlexaSim["Alexa+ Voice Simulator (Web Speech API)"]
        WebConsole["Web Incident Console (Emergency Mode & Ledger)"]
        AuditUI["12-Point Health Audit & Protection Score"]
    end
    
    subgraph BackendLayer["Backend Server (FastAPI on :8000)"]
        API["FastAPI Orchestrator"]
        Cache["10-Min In-Memory TTL Cache"]
        AgentLoop["Agent Tool-Calling Loop"]
    end
    
    subgraph ProviderLayer["LLM Provider Abstraction"]
        MockP["Mock Provider (Scripted, Realistic, Keyless - DEFAULT)"]
        GeminiP["Google Gemini API (Function Calling)"]
        BedrockP["Amazon Bedrock Converse API"]
    end
    
    subgraph MCPLayer["Self-Hosted MCP Server (:8001 / Streamable HTTP)"]
        MCP["Model Context Protocol Official Python SDK"]
        T1["create_case()"]
        T2["get_case()"]
        T3["update_case()"]
        T4["analyze_incident()"]
        T5["generate_recovery_plan()"]
        T6["score_business()"]
    end
    
    subgraph StorageLayer["Local Storage"]
        DB[(SQLite: data/businessguard.db)]
    end

    User --> AlexaSim
    User --> WebConsole
    User --> AuditUI
    
    AlexaSim -->|POST /api/alexa/interact| API
    WebConsole -->|POST /api/chat & /api/emergency| API
    AuditUI -->|POST /api/audit| API
    
    API --> Cache
    Cache --> AgentLoop
    AgentLoop --> MockP
    AgentLoop -.-> GeminiP
    AgentLoop -.-> BedrockP
    
    MockP -->|Tool Calls| MCP
    GeminiP -->|Function Calls| MCP
    BedrockP -->|ToolConfig| MCP
    
    MCP --> T1 & T2 & T3 & T4 & T5 & T6
    T1 & T2 & T3 & T4 & T5 & T6 <--> DB
```

---

## ⚡ Quick Setup (5 Commands or Fewer)

Everything runs locally for free without requiring paid subscriptions or external databases:

```bash
# 1. Clone repository & navigate
git clone https://github.com/your-org/businessguard-ai.git && cd businessguard-ai

# 2. Set up Python virtual environment & install backend packages
python -m venv .venv && .\.venv\Scripts\activate && pip install -r requirements.txt

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Copy environment configuration (Default: LLM_PROVIDER=mock)
cp .env.example .env

# 5. Start the full application (Run Backend & Frontend)
# Terminal 1: Backend & MCP Server
.\.venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --reload
# Terminal 2: Frontend Web App
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🤖 AI Layer & Provider Abstraction

The backend implements a clean provider abstraction interface in `backend/app/llm/base.py`:
```python
async def chat(messages: list[dict], tools: list[dict], system_prompt: str) -> LLMResponse
```

Three selectable providers are implemented via `LLM_PROVIDER`:
1. **`mock` (Default used in demo):** Fully scripted, realistic, intelligent responses tailored to Indian & global social sellers. Simulates tool execution, generates structured output cards, and requires **no external API keys or paid accounts**.
2. **`gemini`:** Powered by Google's Gemini models using `GEMINI_API_KEY`, supporting native function declarations matching the MCP tool schemas.
3. **`bedrock`:** Present in the codebase using Amazon Bedrock Converse API (`boto3`) with `AWS_REGION` and `BEDROCK_MODEL_ID`. Only activated when explicitly configured with AWS credentials.

### Automatic Graceful Fallback
If `gemini` or `bedrock` is chosen but fails due to a missing API key, network timeout, or free-tier rate limit, the system **automatically falls back to `mock`** and displays a discreet `"Using demo responses"` badge in the UI. **Raw exceptions are never exposed to the user.**

### 10-Minute Free-Tier Rate Limiting Cache
Identical requests are cached in-memory with a 10-minute TTL to stay well within free-tier API quotas.

---

## 🛠️ Self-Hosted MCP Server Tools (`/mcp_server`)

BusinessGuard hosts a dedicated Model Context Protocol server built with the official `mcp` Python SDK:
- **`create_case(incident_type, details)`**: Initializes a new incident in SQLite and returns incrementing Case ID (`BG-2026-XXX`).
- **`get_case(case_id)`**: Retrieves full case timeline, severity, and answers.
- **`update_case(case_id, patch)`**: Updates status (`open`, `in_progress`, `resolved`), turns, or recovery plans.
- **`analyze_incident(case_id)`**: Assesses threat vectors, urgency, and affected platforms.
- **`generate_recovery_plan(incident_type, severity)`**: Emits immediate actions (0-60m), a 24-hour plan, evidence checklist for cyber authorities, and future hardening tips.
- **`score_business(audit_answers)`**: Evaluates 12 health audit responses across Legal, Security, Operations, and Brand hygiene.

You can inspect all tool definitions and execute live tests at the `/mcp/tools` UI page or `http://localhost:8000/mcp/tools`.

---

## 🌟 Key Features

1. **Alexa to Web Case Handoff (Signature Feature):**
   - Glowing cyan-blue Echo ring with realistic `idle`, `listening`, `thinking`, and `speaking` states.
   - User speaks or types: *"Alexa, ask BusinessGuard, my Instagram was hacked."* Wake phrase is stripped before processing.
   - Alexa asks 3 rapid follow-up questions, speaks immediate actions aloud, generates an incrementing Case ID (e.g. `BG-2026-005`), and saves it to SQLite.
   - Clicking **"Continue on Web App"** or entering the Case ID in the top bar instantly resumes the incident with a **"Continued from Alexa"** banner.
2. **AI Business Advisor:**
   - Real-time chat with structured assessment cards: Risk Level, Situation Analysis, Recommended Actions, and Prevention Tips.
3. **Emergency Mode:**
   - Big red emergency button instantly shifts the app into a dramatic red theme with a pulsing alert while a critical case is active.
4. **12-Point Business Health Audit:**
   - One question per screen with progress tracking across registration, GST, MFA, invoices, trademark, password vault, and cyber insurance.
5. **Business Protection Score Dashboard:**
   - Animated SVG circular gauges for Legal, Security, Operations, and Brand.
   - Large overall resilience score (e.g. 68/100).
   - 6-week trend line chart (*labeled Sample data*) and Top 3 fixes that raise the score the most.
6. **Case Ledger:**
   - Searchable, filterable ledger seeded with 4 realistic cases (`BG-2026-001` through `BG-2026-004`) plus live cases created during voice sessions.

---

## 🗺️ Roadmap

- [ ] **WhatsApp Business Webhook Integration:** Live inbound messaging support for merchants who cannot use voice.
- [ ] **Automated Meta Graph API Account Dispute:** One-click pre-filled PDF submission to Meta Intellectual Property & Account Recovery portals.
- [ ] **Indian Cyber Crime Portal (cybercrime.gov.in) Exporter:** Formats incident timestamps, screenshot hashes, and UTR numbers into official complaint templates.
- [ ] **Multi-Merchant Team Roles:** Support for multi-user boutiques with granular permission controls.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
