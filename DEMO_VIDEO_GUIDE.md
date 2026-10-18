# BusinessGuard AI — Screen Recording & Video Demo Guide (2:50 Target) 🎬

> **Exact Video Runtime:** 2 Minutes 50 Seconds (170 Seconds)  
> **Tagline:** *"Your business's first responder."*  
> **Sub-line:** *"Hacked, scammed or threatened? Get a calm, step-by-step rescue plan by voice or on screen."*  
> **Target GitHub Repository:** `https://github.com/sejalheda/BusinessGuard_AI.git`

---

## 📋 Section A: Before-Recording Checklist (2 Minutes Prep)

### 1. Launch Servers
Open two terminal windows from the project root:
* **Terminal 1 (Backend & MCP Server):**
  ```powershell
  .\.venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --reload
  ```
* **Terminal 2 (Frontend Web App):**
  ```powershell
  cd frontend
  npm run dev
  ```

### 2. Environment Settings (`.env`)
Make sure `.env` has:
```env
LLM_PROVIDER=mock
PORT=8000
DATABASE_PATH=data/businessguard.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
*(Mock mode is 100% deterministic, instant, free, and guarantees zero API rate limits during your take).*

### 3. Screen & Browser Hygiene
- [ ] **Browser:** Chrome or Edge at `http://localhost:5173`.
- [ ] **Zoom:** Set browser zoom to **110%** (`Ctrl + Plus`) for optimal legibility at 1080p.
- [ ] **Clean View:** Hide bookmarks bar (`Ctrl + Shift + B`), close all other tabs, and turn on Windows Focus Assist (Do Not Disturb).
- [ ] **Assets Ready:** Have `fake_payment_sample.png` (in project root) ready on your desktop for quick drag-and-drop.
- [ ] **Clean Reset:** In browser DevTools Console run `localStorage.clear()` and refresh to start with fresh score state.

---

## ⏱️ Section B: Exact 2:50 Shot-by-Shot Timed Script

*Pacing Guideline: Speak at a calm, confident pace (~130 words/minute). Pause 1 second after clicks to let animations shine.*

| Scene # & Title | Timestamp | Exact Visual Clicks & Actions | Word-for-Word Narration |
| :--- | :--- | :--- | :--- |
| **Scene 1: The Hook & Home Dashboard** | `0:00 - 0:20`<br>*(20 sec)* | 1. Start on Home Page (`http://localhost:5173`).<br>2. Hover cursor smoothly over the gradient hero headline.<br>3. Scroll down slightly to point at the **Risk Radar** and **Protection Score** summary. | "Meet Priya. She runs an Instagram boutique called Saree Haven with 28,000 followers. This morning, she clicked a fake copyright link, lost account access, and the hacker began scamming her buyers. Priya has no IT department or corporate lawyer. This is BusinessGuard AI: your business's first responder." *(45 words)* |
| **Scene 2: Alexa Voice Rescue** | `0:20 - 0:55`<br>*(35 sec)* | 1. Click **'Alexa Simulator'** on the sidebar.<br>2. Click **'Start Voice Rescue'** (Echo ring lights up).<br>3. Click suggestion chip: *'Alexa, ask BusinessGuard, my Instagram was hacked.'*<br>4. Ring turns cyan (thinking), then green.<br>5. Click chip: *'No, I cannot log in.'*<br>6. Click chip: *'Yes, got an email saying my email was changed.'*<br>7. Click chip: *'Yes, scammers messaging followers for crypto!'*<br>8. Alexa generates Case `BG-2026-005` and speaks 3 immediate actions. | "Priya starts her rescue by voice on Alexa: *'Alexa, ask BusinessGuard, my Instagram was hacked.'* The animated Echo ring responds immediately. Alexa asks three rapid triage questions to isolate the threat vector, assigns priority Case ID `BG-2026-005`, and speaks the first three containment actions aloud." *(47 words)* |
| **Scene 3: QR Code Phone Handoff** | `0:55 - 1:20`<br>*(25 sec)* | 1. Focus camera on the **QR Code Handoff** card (160px QR code).<br>2. Click the **'Copy link'** button (button turns green with checkmark: **'Copied!'**).<br>3. Click **'Continue on Web App'**.<br>4. Point cursor to top banner: **'Continued from Alexa Voice Rescue • Alexa+ Handoff Verified'**. | "Alexa renders a scannable QR code and link so Priya can continue on her smartphone or web console. Clicking Continue seamlessly loads Case `BG-2026-005`. Notice the signature banner: all voice dialogue turns, timestamps, and answers were persisted directly into SQLite through our self-hosted MCP server." *(48 words)* |
| **Scene 4: Visible Reasoning & Recovery Timeline** | `1:20 - 1:50`<br>*(30 sec)* | 1. On Case Detail, click to expand **'Why this verdict' Visible Reasoning Panel**.<br>2. Point to the 3 checks with **High** confidence chips and `analyze_incident` tool tags.<br>3. Scroll down to **3-Phase Recovery Milestones**.<br>4. Tick Step 1 (*'Search primary email...'*) -> watch floating **'+2 Protection Score'** animation fly up and progress ring advance.<br>5. Tick Step 2 (*'Initiate Video Selfie...'*) -> show auto-logged milestone entry. | "Here is BusinessGuard's **Visible Reasoning Panel**. Rather than an opaque verdict, Priya sees the exact evidence: foreign IP login, no 2FA challenge, and active follower exploitation, tagged by MCP tools. Below, she follows the 3-phase recovery timeline. Ticking a step logs a milestone, advances the progress ring, and awards a live +2 boost to her Protection Score." *(61 words)* |
| **Scene 5: Fake Payment Screenshot Checker** | `1:50 - 2:20`<br>*(30 sec)* | 1. Click **'Payment Checker'** on sidebar.<br>2. Drag-and-drop `fake_payment_sample.png` into dropzone.<br>3. Watch animated scanning beam glide across image.<br>4. Observe the **88% High Risk** meter swing.<br>5. Point to warning signs (timestamp disparity, Canva font artifacts) and bank checklist.<br>6. Click **'Create a case from this'**; opens new Fraud case. | "Sellers also face fake payments. In our **Payment Checker**, Priya drops a buyer's suspicious UPI screenshot. The scanner inspects font alignment and timestamps, returning an 88% High Risk alert with visual anomalies and a bank verification checklist. One click instantly converts this into an official Fraud case with findings attached." *(54 words)* |
| **Scene 6: Protection Score Dashboard & Risk Radar** | `2:20 - 2:40`<br>*(20 sec)* | 1. Click **'Protection Score'** on sidebar.<br>2. Point to the overall resilience gauge (e.g. 72 / 100, updated with recovery bonus).<br>3. Point to the 4 defense pillars: Legal (65%), Security (60%), Operations (75%), Brand (70%).<br>4. Highlight **Top 3 High-Impact Fixes** (+18 pts for MFA, +12 pts for Password Manager). | "Prevention is driven by our **Protection Score Dashboard**. Priya's score now reflects her completed recovery actions alongside four defense pillars: Legal, Security, Operations, and Brand—giving her the top three high-impact fixes to make her store resilient against future attacks." *(42 words)* |
| **Scene 7: Honest Closing & Tagline** | `2:40 - 2:50`<br>*(10 sec)* | 1. Click **'Home'** on sidebar to return to the hero.<br>2. Center cursor under the project tagline. | "Built with React, FastAPI, SQLite, and the Model Context Protocol SDK. Prototype demo using simulated Alexa and mock data. BusinessGuard AI: your business's first responder." *(26 words)* |

**Total Words:** ~323 words spoken at ~125 wpm = **2 minutes 35 seconds of voice** + **15 seconds of animation buffers** = **Exactly 2 Minutes 50 Seconds.**

---

## 🖥️ Section C: Recording & Uploading on Windows

### 1. Screen Capture (Win + G or OBS)
* **Option A — Windows Xbox Game Bar:**  
  Press `Win + Alt + R` to start recording. Press again to stop. File is saved to `Videos\Captures`.
* **Option B — OBS Studio (Recommended):**  
  Window Capture on Chrome/Edge at `1920x1080` 60fps. Ensure microphone and desktop audio (for Alexa's voice) are both enabled.

### 2. YouTube & Devpost Upload
1. Upload MP4 (1080p) to YouTube.
2. Set visibility to **Unlisted** (or Public).
3. **Title:** `BusinessGuard AI — Your Business's First Responder (Hackathon Demo)`
4. **Description:**
   ```markdown
   BusinessGuard AI: Your business's first responder.
   Hacked, scammed or threatened? Get a calm, step-by-step rescue plan by voice or on screen.

   Target GitHub: https://github.com/sejalheda/BusinessGuard_AI.git
   Stack: React, Vite, TypeScript, Tailwind CSS, FastAPI, SQLite, Model Context Protocol Python SDK.
   Note: Hackathon prototype. Alexa is simulated in-browser; all data is mock/sample data.
   ```
5. Test the video link in a **Private / Incognito window** before pasting into Devpost.

---

## 🛡️ Section D: Instant Retake & Backup Plan

* **If microphone permission fails:** Click the suggested prompt chips immediately without breaking flow.
* **If Alexa voice is muted:** Toggle the audio icon next to the Echo ring; the on-screen dialogue stream displays the text synchronously.
* **If file drag-and-drop lags:** Click the upload box to open the Windows file dialog and select `fake_payment_sample.png`.
* **If a phone camera isn't handy for the QR code:** Click **'Copy link'** (shows green 'Copied!' toast) and click **'Continue on Web App'**.
