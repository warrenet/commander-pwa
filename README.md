# Commander PWA ⚡

**Commander** is a sovereign, offline-first execution cockpit designed for high-reliability daily operations. It serves as a "no-fail" surface for capturing thoughts, managing priorities, and ensuring daily shipping targets are met.

**Current Version:** v1.6.3 (The "Cyborg" Update)

## ✨ New Features (v1.6+)

### 🧠 AI & Smart Features
- **Smart Board:** Auto-organizes your tasks into columns (Urgent, Bugs, Ideas, Meetings) based on content.
- **Auto-Categorization:** Type "fix bug" -> `#bug` tag added automatically.
- **Protocol Droid:** Voice capture templates (say "Protocol Bug" -> fills bug template).
- **AI Integration Hub:** Pre-made prompts to connect Gemini/ChatGPT to Commander via deep links.

### ⚡ Speed & Workflow
- **Keyboard Shortcuts:** `n` (new), `1/2/3` (sections), `b` (board), `Esc` (close).
- **Tag Filtering:** Click any tag to filter your view instantly.
- **Deep Linking:** Share from any app to capture URLs with auto-tags (`&source=ai`, `&priority=high`).

### 🎨 Visual & UX
- **Rich Toasts:** Visual feedback with icons and haptics.
- **View Transitions:** Smooth fading between List and Board views.
- **Swipe Indicators:** Helpful hints for horizontal navigation.

## 🚀 Getting Started

### Installation
1.  Navigate to the deployed URL.
2.  Tap **"Install App"** (or "Add to Home Screen").
3.  Launch from your home screen.

### First Run
- Follow the **Onboarding Tutorial** to learn the basics.
- Go to **Menu -> 🦾 AI Integration Hub** to set up your AI assistants.

## 🛠️ Architecture
- **Offline-First:** IndexedDB + Workbox (100% functional offline).
- **Zero-Latency:** Immediate interactions, no spinners.
- **Data Sovereignty:** All data lives on your device. Export to JSON/Markdown anytime.

## ⌨️ Shortcuts (Desktop)
| Key | Action |
|-----|--------|
| `n` | New Capture |
| `b` | Toggle Board View |
| `1` | Jump to Inbox |
| `2` | Jump to Next |
| `3` | Jump to Ship Today |
| `Esc`| Close / Blur |

## License
Private / Internal Tools.
