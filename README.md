# Commander PWA

**Titan Prompt Commander** is a sovereign, offline-first execution cockpit designed for high-reliability daily operations. It serves as a "no-fail" surface for capturing thoughts, managing immediate priorities, and ensuring daily shipping targets are met, regardless of network conditions.

## 🎯 What This Is
Commander is a **Progressive Web App (PWA)** that acts as your primary interface for "getting things done" on mobile. It replaces the friction of complex project management tools with a streamlined, text-based interface optimized for speed and capture.

It solves the problem of "capture friction" — the delay between having a thought and recording it. By living locally on your device and using the system share sheet, Commander accepts input instantly, even in airplane mode.

## ✨ Key Benefits

### 1. 🛡️ Unbreakable Reliability (Offline-First)
- **Zero Latency:** Built on a local-first architecture (IndexedDB + Workbox). Interactions happen instantly on your device, not on a remote server.
- **Works Anywhere:** Capture ideas in the subway, on a plane, or in a dead zone. The app automatically syncs and persists data locally.
- **No Spinners:** You never wait for a network request to finish before moving to the next task.

### 2. ⚡ Speed & Friction Reduction
- **Universal Capture:** A dedicated view for rapid-fire entry of thoughts, tasks, and logs.
- **Share Target:** deep integration with Android allows you to "Share to Commander" from any other app (browser, YouTube, Twitter) to capture URLs and content instantly.
- **Large Touch Targets:** A UI designed specifically for thumbs and movement, minimizing mis-taps.

### 3. 🔐 Data Sovereignty
- **Your Data:** All data resides on your device. You are not dependent on a SaaS provider's uptime or privacy policy.
- **Standard Standards:** Export your data anytime to JSON or Markdown. No lock-in.

### 4. 🧠 Focused Workflow
- **The "Ship Today" List:** A constrained list for your absolute top priorities, forcing focus on what matters now.
- **Inbox Zero:** Easy drag-and-drop triage to move items from Inbox to Next or Ship, keeping your mental RAM clear.

## 🛣️ Roadmap & Future Upgrades

We are actively evolving Commander into a full "AI Partner" interface.

- **Phase 1: Hardening (Current)** ✅
    - Offline resilience, conflict resolution, diagnostics, and deployment automation.
- **Phase 2: AI Agent Integration** 🚧
    - **Active Inference:** The app will proactively suggest tasks or reorganize your inbox based on your habits.
    - **LLM Context:** Feed your logs into local or cloud LLMs to generate weekly summaries and "Tree of Thought" planning.
- **Phase 3: Multi-Modal** 🔮
    - **Voice Mode:** One-tap voice capture with local transcription.
    - **Image Analysis:** Snap photos of whiteboards/notebooks and have them auto-transcribed into tasks.
- **Phase 4: Sync & Federation** 🌐
    - **P2P Sync:** Sync between desktop and mobile without a central cloud server.
    - **Team Mode:** Shared encrypted workspaces for small squads.

## Architecture

*   **Runtime:** Browser / PWA (installable)
*   **Build:** Vite + Rollup
*   **State:** Custom Reactive Store + IDB
*   **Deploy:** GitHub Pages (Self-contained)

## Usage

### Installation
1.  Navigate to the deployed URL.
2.  Tap **Install App** in your browser menu.
3.  Launch from home screen as a standalone app.

### The "Ship" Workflow
Use the included `ship.ps1` to deploy updates:
```powershell
.\ship.ps1
```
This script validates your environment, builds the app, checks for offline artifacts, and pushes to GitHub Pages in one go.

## License
Private / Internal Tools.
