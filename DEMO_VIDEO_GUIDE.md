# BusinessGuard AI — Master Screen Recording & Video Demo Guide 🎬

> **Tagline:** *"Your business's first responder."*  
> **Sub-line:** *"Hacked, scammed or threatened? Get a calm, step-by-step rescue plan by voice or on screen."*  
> **Repository:** `https://github.com/sejalheda/BusinessGuard_AI.git`

---

## 📋 Section A: Before-Recording Checklist

### 1. Server Launch Commands
Open two separate terminal windows from the repository root:

* **Terminal 1 (Backend API & MCP Server):**
  ```powershell
  .\.venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --reload
  ```
  *(Verify output shows `Application startup complete` on port 8000).*

* **Terminal 2 (Frontend Web Application):**
  ```powershell
  cd frontend
  npm run dev
  ```
  *(Verify output shows `Local: http://localhost:5173/`).*

### 2. Environment Configuration (`.env`)
Make sure `.env` contains:
```env
LLM_PROVIDER=mock
PORT=8000
DATABASE_PATH=data/businessguard.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
* **Why `LLM_PROVIDER=mock`?**  
  Mock mode is 100% deterministic, instant, requires no paid API keys, will never hit Google rate limits during recording, and includes realistic domain-specific scripts for social commerce incidents.

### 3. Display & Browser Hygiene
- [ ] **Browser:** Chrome or Edge (recommended for Web Speech API and Web SpeechSynthesis).
- [ ] **Window Size:** Maximize the browser at 1080p (1920x1080) or set zoom to **110%** (`Ctrl + Plus`) so labels, gauges, and text are crisp and easy to read.
- [ ] **Clean Tab Bar:** Close all other browser tabs and applications.
- [ ] **Hide Distractions:** Hide the bookmarks bar (`Ctrl + Shift + B`), close Windows notifications, and turn on Windows **Focus Assist** / Do Not Disturb.
- [ ] **Sample Assets Ready:** Keep `fake_payment_sample.png` (in project root) easily accessible on your desktop or secondary folder ready for drag-and-drop.

### 4. Fresh State Reset
To start with a clean demo ledger:
1. Delete `data/businessguard.db` if you want fresh seed cases `BG-2026-001` through `BG-2026-004`.
2. Clear browser `localStorage.clear()` in developer tools console so Protection Score bonuses start at 0.
3. Refresh `http://localhost:5173`.

---

## ⏱️ Section B: Timed Script (Scene-by-Scene Table)

### Scene 1: The Hook — Meet Priya & The Problem
* **Timestamp:** `[0:00 - 0:18]`
* **Screen:** Home Page (`http://localhost:5173`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | Start on the Home Page hero section with the gradient banner and the tagline *"Your business's first responder"*. Move cursor gently across the headline. |
| **Word-for-Word Narration** | "Meet Priya. She runs an Indian ethnic wear boutique on Instagram called Saree Haven with 28,000 followers. This morning, she received a fake copyright warning link, panicked, and clicked it. Within four minutes, her password was reset, 2FA was blocked, and the hacker began posting fraudulent crypto promotions to her buyers. Priya has no IT team, no lawyer, and Meta support takes days. Who does a solo entrepreneur call in the first sixty minutes? This is BusinessGuard AI: your business's first responder." |

---

### Scene 2: Home Page Tour
* **Timestamp:** `[0:18 - 0:45]`
* **Screen:** Home Page

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Point cursor at the **Risk Radar** widget at the top.<br>2. Scroll smoothly down to the **Protection Score** summary card.<br>3. Point to the **Recent Cases** list (`BG-2026-001` to `BG-2026-004`). |
| **Word-for-Word Narration** | "Here on the BusinessGuard dashboard, Priya has a real-time defense center. At the top is the **Risk Radar**, monitoring her exposure across Cyber, Fraud, Legal, and Brand pillars. Below that is her live **Protection Score**, calibrated across core defenses, and a persistent ledger of open incident cases. Everything runs locally, keyless, and free." |

---

### Scene 3: Alexa Simulator — Voice First Responder Call
* **Timestamp:** `[0:45 - 1:25]`
* **Screen:** Alexa Simulator (`/alexa`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click **'Alexa Simulator'** on the left sidebar.<br>2. Click the **'Start Voice Rescue'** button or tap the glowing cyan Echo ring.<br>3. Click the first suggestion chip: *'Alexa, ask BusinessGuard, my Instagram was hacked.'*<br>4. Ring turns cyan (thinking), then green as Alexa speaks.<br>5. Click quick chip: *'No, I cannot log in.'*<br>6. Click quick chip: *'Yes, got an email saying my email was changed.'*<br>7. Click quick chip: *'Yes, scammers messaging followers for crypto!'*<br>8. Listen to Alexa announce Case ID `BG-2026-005` and speak the 3 immediate actions. |
| **Word-for-Word Narration** | "Priya starts her rescue by voice on Alexa. She says: *'Alexa, ask BusinessGuard, my Instagram was hacked.'* The Alexa Echo ring animates into thinking mode. Alexa asks three rapid triage questions: Can you log in? Did you get an email alert? Are scammers messaging buyers? Within seconds, Alexa isolates the threat vector, assigns priority Case ID `BG-2026-005`, and speaks the first three immediate containment actions aloud." |

---

### Scene 4: QR Code & Case ID Handoff
* **Timestamp:** `[1:25 - 1:55]`
* **Screen:** Alexa Simulator (Handoff Card)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Focus on the generated **QR Code Handoff** card displaying the 160px QR code and `BG-2026-005`.<br>2. Click the **'Copy link'** button; watch the button turn green with a checkmark and show **'Copied!'**.<br>3. Click **'Continue on Web App'** (or paste URL in browser tab).<br>4. Point to the cyan top banner: **'Continued from Alexa Voice Rescue • Alexa+ Handoff Verified'**. |
| **Word-for-Word Narration** | "Here is BusinessGuard's signature handoff. Alexa generates a scannable QR code and a direct web link. Priya can scan the QR code to continue on her smartphone, or click 'Continue on Web App'. Notice the signature banner: *'Continued from Alexa Voice Rescue'*. The entire voice conversation, answers, and timestamps were persisted directly into SQLite through our self-hosted Model Context Protocol server. Zero context lost." |

---

### Scene 5: Case Detail & Visible Reasoning Panel
* **Timestamp:** `[1:55 - 2:30]`
* **Screen:** Case Detail Page (`/cases/BG-2026-005`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Scroll past the transcript showing Priya and Alexa turns.<br>2. Click to expand the **'Why this verdict' Visible Reasoning Panel**.<br>3. Highlight the 3 animated checks with **High** confidence chips and `analyze_incident` MCP tool tags.<br>4. Click **'MCP Tool Inspector'** button in top right to show the raw JSON tool telemetry. |
| **Word-for-Word Narration** | "Unlike black-box AI tools, BusinessGuard provides complete transparency with our **Visible Reasoning Panel**. Rather than an unexplained 'Critical' alert, Priya sees the exact evidence: foreign IP login, no 2FA challenge, and active follower exploitation. Each check displays its confidence level and the MCP tool that verified it. Clicking the MCP Inspector reveals the real-time tool calls running under the hood." |

---

### Scene 6: Emergency Mode Protocol
* **Timestamp:** `[2:30 - 3:05]`
* **Screen:** Emergency Page (`/emergency`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click the red **'Emergency'** button in the top navigation bar.<br>2. Notice the red border shift across the application.<br>3. Point to the 4 crisis categories: Instagram Hacked, WhatsApp Compromised, Fake Payment Fraud, Customer Legal Threat.<br>4. Click **'Instagram Hacked'** (or 'Deploy Plan'). |
| **Word-for-Word Narration** | "If a crisis strikes, any seller can hit the red **Emergency** button in the header. The interface immediately shifts to a high-contrast emergency theme. BusinessGuard offers pre-built stabilization protocols for the four most common social commerce crises. Deploying a plan creates an instant priority ledger entry and activates four containment quadrants: Immediate Actions (0-60 min), a 24-hour plan, cybercrime evidence checklists, and future hardening." |

---

### Scene 7: 3-Phase Recovery Timeline with Live Ticks
* **Timestamp:** `[3:05 - 3:45]`
* **Screen:** Case Detail or Emergency Page

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Locate the **3-Phase Recovery Milestones** card.<br>2. Tick the first step: *'Search primary email for security@mail.instagram.com...'*<br>3. Watch the floating **'+2 Protection Score'** animation fly up.<br>4. Watch the circular progress ring advance.<br>5. Tick the second step: *'Initiate Video Selfie Verification...'*<br>6. Point to the auto-logged milestone entry in the conversation history.<br>7. Tick remaining steps to reach 100% and show the celebratory green resolution state. |
| **Word-for-Word Narration** | "Here is the interactive **Recovery Timeline**. Recovery is organized into three realistic phases: First hour, First 24 hours, and First week. As Priya completes each task, she ticks the step. Watch this: a floating +2 points animation triggers, the circular progress dial advances, and an official audit milestone is logged in SQLite. When all steps are ticked, Priya can mark the case officially Resolved." |

---

### Scene 8: AI Business Advisor
* **Timestamp:** `[3:45 - 4:15]`
* **Screen:** Advisor Page (`/advisor`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click **'Advisor'** on the sidebar.<br>2. Click one of the quick scenario chips: *'Buyer claims they paid via UPI, but no money in my bank.'*<br>3. Watch the answer card generate with Situation Analysis, Recommended Actions, and Prevention Tips.<br>4. Point to the **'Why this verdict'** reasoning panel embedded directly on the answer card. |
| **Word-for-Word Narration** | "For non-emergency guidance, merchants turn to the **AI Business Advisor**. Priya clicks a common dispute scenario: a customer demanding immediate parcel dispatch based on a payment screenshot. The advisor generates a structured advisory card: risk level, factual communication script, and a strict verification rule: never dispatch before bank credit settles." |

---

### Scene 9: Fake Payment Screenshot Checker
* **Timestamp:** `[4:15 - 4:55]`
* **Screen:** Payment Checker Page (`/payment`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click **'Payment Checker'** on the left sidebar.<br>2. Drag-and-drop `fake_payment_sample.png` into the upload zone.<br>3. Watch the animated scanning beam glide across the image.<br>4. Observe the risk gauge swing to **'High Risk (88%)'**.<br>5. Scroll through the detected warning signs: timestamp disparity, typography artifacts, and missing ledger credit.<br>6. Point to the mandatory disclaimer: *'Always confirm the credit in your bank account before shipping.'*<br>7. Click **'Create a case from this'**; watch it navigate to a newly logged Fake Payment Fraud case. |
| **Word-for-Word Narration** | "Fake payment fraud is rampant on WhatsApp and Instagram. Scammers forge UPI receipts and demand same-day delivery. In our **Payment Checker**, Priya drops the buyer's screenshot. The scanner inspects font alignment, timestamp discrepancies, and layout anomalies. It returns an 88% High Risk verdict with specific visual warning signs and a bank verification SOP. Priya can click 'Create a case from this' to attach the evidence directly to a new incident case." |

---

### Scene 10: Guided 12-Point Health Audit
* **Timestamp:** `[4:55 - 5:35]`
* **Screen:** Health Audit Page (`/audit`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click **'Health Audit'** on the sidebar.<br>2. Click through the 12 questions using **'Yes'** or **'No'**:<br>   - Q1 Business Registration: **Yes**<br>   - Q2 GST: **Yes**<br>   - Q3 Authenticator MFA: **No** *(creates high-impact fix)*<br>   - Q4 Written Invoices: **Yes**<br>   - Q5 Vendor Contracts: **No**<br>   - Q6 Registered Trademark: **No**<br>   - Q7 Order Backups: **Yes**<br>   - Q8 Password Manager: **No** *(creates high-impact fix)*<br>   - Q9 Staff Access Review: **No**<br>   - Q10 Cyber Insurance: **No**<br>   - Q11 Settled Funds Check: **Yes**<br>   - Q12 Incident Response Plan: **Yes**<br>3. Watch the progress bar advance to 100% and view the completion summary. |
| **Word-for-Word Narration** | "Once the crisis is averted, prevention begins. Priya takes our guided 12-point **Health Audit**—covering registration, GST, MFA, password management, and invoice practices. The MCP scoring engine processes her responses and produces a full resilience diagnostic." |

---

### Scene 11: Protection Score Dashboard
* **Timestamp:** `[5:35 - 6:05]`
* **Screen:** Protection Score Page (`/score`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. View the **Total Business Protection** gauge (e.g. 72 / 100, reflecting audit score + recovery tick bonus).<br>2. Highlight the 4 defense pillar gauges: Legal (65%), Security (60%), Operations (75%), Brand (70%).<br>3. Scroll to the **6-Week Trend Chart** labeled *Sample data*.<br>4. Point to the **Top 3 High-Impact Fixes** (e.g. Enable MFA +18 pts, Adopt Password Manager +12 pts). |
| **Word-for-Word Narration** | "The result is Priya's **Protection Score Dashboard**. Her overall resilience score stands at 72—automatically boosted by the recovery steps she checked off earlier. She sees her exact breakdown across Legal, Security, Operations, and Brand pillars. Most importantly, instead of a confusing 50-page report, she gets the Top 3 high-impact fixes that will raise her score the most: turning on Authenticator MFA (+18 points) and adopting a password vault (+12 points)." |

---

### Scene 12: Risk Radar Dynamic Update
* **Timestamp:** `[6:05 - 6:25]`
* **Screen:** Home Page (`/`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Return to the Home Page.<br>2. Point to the **Risk Radar** widget.<br>3. Click the **'Cyber'** row; view the explanation pop-up/card.<br>4. Click the **'Brand'** row; view the explanation. |
| **Word-for-Word Narration** | "Back on the Home page, notice how the **Risk Radar** dynamically reflects her updated status. Cyber threat is tracked in real-time based on open cases, while Brand and Legal reflect her audit answers. Clicking any row explains the exact rationale in one simple sentence." |

---

### Scene 13: Cases Ledger & MCP Tool Inspector
* **Timestamp:** `[6:25 - 6:50]`
* **Screen:** Cases Page (`/cases`) & MCP Tools Page (`/mcp`)

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click **'Cases'** on the sidebar.<br>2. Filter by status 'Resolved' or search for 'Instagram'.<br>3. Click **'MCP Tools'** on the sidebar.<br>4. Scroll through the 7 exposed tools (`create_case`, `get_case`, `update_case`, `analyze_incident`, `generate_recovery_plan`, `check_payment_screenshot`, `score_business`). |
| **Word-for-Word Narration** | "In the **Cases Ledger**, every voice call, payment scan, and emergency dispatch is permanently organized. On the **MCP Tools** page, you can see all seven tools our agent exposes using the official Model Context Protocol Python SDK, complete with their input schemas." |

---

### Scene 14: Interactive Demo Tour
* **Timestamp:** `[6:50 - 7:05]`
* **Screen:** Home Page

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | 1. Click **'Watch Priya's Walkthrough'** on the home page hero.<br>2. Show the floating guided tour modal in the bottom-right corner.<br>3. Click through two steps to show the guided onboarding. |
| **Word-for-Word Narration** | "For judges or new merchants exploring on their own, the built-in **Demo Tour** provides a guided, clickable walkthrough through Priya's entire story from crisis to resolution." |

---

### Scene 15: Architecture & Tech Stack
* **Timestamp:** `[7:05 - 7:25]`
* **Screen:** Architecture Diagram in README or Slide

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | Switch to the Mermaid architecture diagram in `README.md` or a presentation view. Point to the Client Layer, FastAPI, LLM Provider abstraction, MCP Server, and SQLite. |
| **Word-for-Word Narration** | "Architecturally, BusinessGuard is built with React, Vite, TypeScript, and Tailwind on the frontend, powered by the browser Web Speech API for voice. The backend is Python 3.11 with FastAPI and SQLite. Tools run over the Model Context Protocol SDK. Our LLM provider abstraction supports Google Gemini with function calling, while defaulting to a reliable, keyless mock provider for instant offline demos." |

---

### Scene 16: Honest Closing & Disclaimer
* **Timestamp:** `[7:25 - 7:45]`
* **Screen:** Home Page hero banner with tagline

| Detail | Action & Narration |
| :--- | :--- |
| **Visual / Clicks** | Return to the Home Page hero. Center the screen on the project tagline. |
| **Word-for-Word Narration** | "BusinessGuard AI is an investor-ready hackathon prototype. Alexa is simulated in-browser, all data is sample data, and guidance is general informational support, not formal legal advice. Our roadmap includes WhatsApp webhook integration and automated cyber crime complaint filing. Small sellers shouldn't have to face hackers and scammers alone. BusinessGuard AI: Your business's first responder. Thank you." |

---

## ⚡ Section C: Two Versions

### Full Version (6 to 7 Minutes)
* Record all 16 scenes above in sequence.
* Ideal for: Comprehensive hackathon evaluation, deep technical judging, and full feature showcase.

### Short Version (Under 3 Minutes) — Strict Hackathon Cut
If the hackathon imposes a hard 3-minute limit, use this streamlined 6-scene sequence:

1. **[0:00 - 0:25] The Hook & Problem (Scene 1):**  
   Introduce Priya, Saree Haven, and the lack of a first responder.
2. **[0:25 - 1:05] Alexa Voice Rescue & QR Handoff (Scenes 3 & 4):**  
   Simulate the voice call, show case creation `BG-2026-005`, show QR code, and click 'Continue on Web App'.
3. **[1:05 - 1:35] Visible Reasoning & Recovery Timeline (Scenes 5 & 7):**  
   Highlight the 'Continued from Alexa' banner, open the 'Why this verdict' reasoning panel, tick a recovery step, and show the floating `+2 Protection Score` boost.
4. **[1:35 - 2:10] Fake Payment Screenshot Checker (Scene 9):**  
   Drop `fake_payment_sample.png`, show the 88% High Risk scan, warning signs, and 'Create a case from this'.
5. **[2:10 - 2:40] Protection Score Dashboard & Risk Radar (Scenes 11 & 12):**  
   Show the four pillar gauges, the trend line, the top 3 fixes, and the Risk Radar widget.
6. **[2:40 - 2:55] Honest Closing & Tagline (Scene 16):**  
   Prototype disclaimer, roadmap, and tagline: *"Your business's first responder."*

---

## 🖥️ Section D: Recording & Upload Tips for Windows

### 1. Recording Setup
* **Xbox Game Bar (Built into Windows):**  
  - Press `Win + G`.  
  - Check audio source in the Capture widget.  
  - Press `Win + Alt + R` to start/stop recording.  
  - Videos save to `C:\Users\<User>\Videos\Captures`.
* **OBS Studio (Recommended for highest quality):**  
  - Base resolution: `1920x1080` at 60 fps.  
  - Source: **Window Capture** targeting Chrome/Edge.  
  - Audio: Add **Audio Output Capture** (for Alexa's voice) and **Audio Input Capture** (for your microphone).
  - Use noise suppression filter (RNNoise) on microphone.

### 2. Presentation & Pacing
* **Slow, deliberate cursor movements:** Never whip the mouse across the screen; hover deliberately over badges and buttons before clicking.
* **1-Second Pause Rule:** Whenever a modal opens, an alert animates, or a step is ticked, pause for 1 full second before speaking so viewers can process the UI.
* **Speak slowly and clearly:** Keep an even, calm, confident tone that matches BusinessGuard's philosophy.

### 3. Mistakes to Avoid
- ❌ Do NOT open or show `.env`, terminal API keys, or raw bash logs.
- ❌ Do NOT leave personal bookmarks, WhatsApp desktop notifications, or browser tabs visible.
- ❌ Do NOT speak too fast during the Alexa voice prompt.

### 4. YouTube Upload & Devpost Submission
1. **Export:** MP4 (H.264), 1080p, AAC Audio.
2. **Upload to YouTube:**
   - **Title:** `BusinessGuard AI — Your Business's First Responder (Demo)`
   - **Visibility:** **Unlisted** (if allowed by hackathon) or **Public**.
   - **Description:**
     ```markdown
     BusinessGuard AI: Your business's first responder.
     Hacked, scammed or threatened? Get a calm, step-by-step rescue plan by voice or on screen.

     GitHub Repository: https://github.com/sejalheda/BusinessGuard_AI.git
     Demo Stack: React, Vite, TypeScript, Tailwind CSS, FastAPI, SQLite, MCP Python SDK.
     Prototype note: Alexa is simulated in-browser, all data is mock/sample data.
     ```
3. **Verification:** Open the YouTube link in a **Private / Incognito Window** to confirm video and audio play without requiring sign-in.
4. **Devpost:** Paste the verified YouTube URL directly into the video submission field.

---

## 🛡️ Section E: Retake & Failure Recovery Plan

| Failure Vector | What Might Happen | Immediate Demo Backup Plan |
| :--- | :--- | :--- |
| **Microphone / Web Speech** | Browser doesn't recognize speech or mic permission is blocked. | **Click the suggested prompt chips** or type into the fallback input box below the Echo ring. It triggers the exact same agent turn. |
| **Audio SpeechSynthesis** | Alexa's voice is muted or silent. | Toggle the sound icon next to the Echo ring to ensure voice is ON. If audio device fails, point to the live dialogue stream transcript on screen. |
| **Gemini Rate Limit** | If using `gemini` and free-tier 429 quota hits. | The system automatically falls back to `mock` with the discrete 'Using demo responses' badge. Or keep `LLM_PROVIDER=mock` throughout the entire recording. |
| **File Drag & Drop** | Screenshot doesn't trigger file drop. | Click the upload area to open the native Windows file picker and select `fake_payment_sample.png`. |
| **Camera / Phone QR Scan** | Phone screen glare during camera scan. | Click the **'Copy link'** button next to the QR code, show the 'Copied!' toast, and paste it into a new browser tab. |
