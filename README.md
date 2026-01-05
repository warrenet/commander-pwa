# Commander PWA ⚡

**Commander** is a sovereign, offline-first execution cockpit designed for high-reliability daily operations. It's a "no-fail" surface for capturing thoughts, managing priorities, and ensuring you ship every day.

**Current Version:** v2.0.0 (The "Neural" Update)

---

## 🎯 What is Commander?

Commander is your **personal mission control** for getting things done. It follows a simple philosophy:

1. **Capture** everything quickly (voice, text, share from apps)
2. **Organize** into three zones (Inbox → Next → Ship Today)
3. **Ship** daily—complete what matters today

**No accounts. No cloud. No subscriptions. 100% offline. Your data stays on your device.**

---

## 🚀 Getting Started

### Installation
1. Navigate to the deployed URL
2. Tap **"Install App"** (or "Add to Home Screen")
3. Launch from your home screen—it works like a native app

### First 5 Minutes
1. **Add 3 tasks** to your Inbox using the Capture tab
2. **Move 1 task** to Ship Today (swipe right or use context menu)
3. **Complete it** and mark as shipped
4. **Check the Menu** to explore features

---

## 📋 The Three Zones

| Zone | Icon | Purpose | Best Practice |
|------|------|---------|---------------|
| **Inbox** | 📥 | Capture bucket | Dump everything here. Don't organize yet. |
| **Next** | 📋 | This week's work | Tasks you'll do soon. Review daily. |
| **Ship Today** | 🚀 | Today's focus | MAX 3-5 items. This is sacred. |

### Daily Workflow

```
☀️ MORNING (7-9 AM)
├── Open Commander
├── Review Ship Today (is it realistic?)
├── Move items from Next → Ship Today
├── Use Mission Control template for planning
└── Start working!

🌤️ MIDDAY (12-2 PM)
├── Quick check: How's Ship Today going?
├── Process any new Inbox items
└── Adjust if needed—it's okay!

🌙 EVENING (8-10 PM)
├── Use Nightly Delta template
├── Mark completed items as Shipped
├── Move unfinished Ship Today → Next
├── Capture any lingering thoughts
└── Clear your Inbox if possible (streak!)
```

---

## ✨ Features Overview

### 📱 Core Features
| Feature | Description |
|---------|-------------|
| **Voice Capture** | Click mic, speak, auto-transcribes |
| **Template System** | Mission Control, Nightly Delta, Weekly Review |
| **Smart Board** | Kanban view organizing by task type |
| **Tag Filtering** | Click any #tag to filter instantly |
| **Deep Links** | Share from any app into Commander |
| **Batch Import** | Add multiple tasks via URL |

### 🎯 Productivity Tools
| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Focus Mode** | Hides everything except Ship Today | Menu → 🔒 Focus Mode |
| **Pomodoro Timer** | 25-minute focus sessions with logging | Menu → 🍅 Pomodoro |
| **Keyboard Shortcuts** | Vim-style navigation | Press `?` anytime |
| **Inbox Zero Streak** | Gamifies daily inbox clearing | Automatic |

### 🤖 AI Integration (No API Keys!)
| Feature | Description |
|---------|-------------|
| **AI: Prioritize** | Copies prompt to rank your tasks |
| **AI: Break Down** | Splits big tasks into steps |
| **AI: Plan Day** | Creates time-blocked schedule |
| **Daily Debrief** | Exports logs for AI analysis |

**How it works:**
1. Click AI action in Menu
2. Prompt copied to clipboard (includes your tasks)
3. Paste into free ChatGPT/Gemini/Claude
4. Get AI-powered insights!

### 🔗 Automation (MacroDroid)
| Trigger | Action |
|---------|--------|
| 7 AM | Open Commander for morning planning |
| 9 PM | Open Nightly Delta template |
| Arrive at office | Show Ship Today |
| "OK Google, task" | Deep link to add task |

---

## ⌨️ Keyboard Shortcuts

Press `?` anytime to see all shortcuts.

| Key | Action |
|-----|--------|
| `j` / `↓` | Move selection down |
| `k` / `↑` | Move selection up |
| `Enter` | Edit selected item |
| `d` | Delete selected item |
| `m` | Move to different section |
| `n` | New item |
| `1` / `2` / `3` | Jump to Inbox / Next / Ship Today |
| `b` | Toggle Board view |
| `Escape` | Clear selection / Close modal |
| `?` | Show keyboard help |

---

## 📊 Smart Features

### 🏷️ Auto-Tagging
Tasks are automatically tagged based on keywords:

| You type | Auto-tag added |
|----------|----------------|
| "buy groceries" | #errand |
| "fix bug in login" | #dev |
| "call mom" | #comms |
| "exercise today" | #health |
| "pay electric bill" | #finance |
| "URGENT: deadline" | #priority |

### ⚡ Quartermaster
The floating action button changes based on time of day:
- **Morning**: Suggests Mission Control template
- **Afternoon**: Quick capture mode
- **Evening**: Suggests Nightly Delta
- **Sunday**: Suggests Weekly Review

### 💡 Smart Tips
Tips appear as toasts at appropriate moments:
- After shipping tasks
- When Inbox is getting large
- Time-appropriate suggestions
- Productivity reminders

---

## 🔧 Settings & Data

### Export Your Data
- **Menu → Export Data**: Full JSON backup
- **Menu → Weekly Export**: Last 7 days for AI review

### Safe Mode
If something breaks:
1. Add `?safemode=1` to URL
2. Access recovery options
3. Clear cache or reset

### Diagnostics
**Menu → Diagnostics** shows:
- App version
- Schema version
- IndexedDB status
- Cache status
- Device info

---

## 🏗️ Technical Details

### Architecture
- **Offline-First**: IndexedDB + Workbox Service Worker
- **Zero-Latency**: Instant interactions, no spinners
- **Data Sovereignty**: All data on your device
- **No APIs**: Works without internet
- **PWA**: Installable on any device

### File Structure
```
src/
├── main.js         # App entry point
├── state.js        # State management (appState)
├── ui.js           # UI rendering
├── db.js           # IndexedDB operations
├── components/
│   ├── Board.js    # Kanban board component
│   └── List.js     # List view component
└── utils/
    ├── tagger.js   # Auto-tagging
    ├── haptics.js  # Vibration feedback
    ├── keyboard.js # Keyboard shortcuts
    ├── streak.js   # Inbox Zero tracking
    ├── focus.js    # Focus Mode
    ├── pomodoro.js # Pomodoro timer
    ├── tips.js     # Smart tips/toasts
    ├── help.js     # Help content
    ├── validate.js # Defensive coding
    ├── perf.js     # Performance monitoring
    ├── startup.js  # Startup sequence
    └── ai-agents.js# AI prompt generation
```

### Build Stats
- **Bundle Size**: ~48KB JS (gzipped: 15.6KB)
- **CSS Size**: ~27KB (gzipped: 5.3KB)
- **Precache**: ~535KB for full offline support

---

## 📱 Best Practices

### Daily Habits
1. **Morning**: Review Ship Today, pick 3 priorities
2. **Midday**: Process Inbox, check progress
3. **Evening**: Nightly Delta, clear Inbox

### Weekly Habits
1. **Sunday evening**: Weekly Review template
2. Review Shipped items—celebrate wins!
3. Plan themes for the week ahead

### Tips for Success
- ✅ Keep Ship Today to MAX 5 items
- ✅ Process Inbox daily (streak motivation!)
- ✅ Use Focus Mode for deep work
- ✅ Use AI prompts when overwhelmed
- ❌ Don't organize in Inbox—just dump
- ❌ Don't overload Ship Today
- ❌ Don't skip Nightly Delta

---

## 🆘 Help & Support

### In-App Help
- **Menu → Getting Started Guide**: Onboarding tour
- **Menu → [Category] Help**: Detailed help for each feature
- **Menu → Show Random Tip**: Learn something new
- **Press `?`**: Keyboard shortcuts

### Troubleshooting
| Issue | Solution |
|-------|----------|
| App won't load | Add `?safemode=1` to URL |
| Data seems lost | Menu → Diagnostics → Check DB |
| Cache issues | Diagnostics → Clear Cache |
| Need to reset | Safe Mode → Nuke DB |

---

## 📜 Version History

### v2.0.0 - "Neural" Update
- ✨ 14 new utility modules
- 🎯 Focus Mode & Pomodoro timer
- ⌨️ Vim-style keyboard navigation
- 🤖 AI integration (no API keys)
- 💡 80+ smart tips as toasts
- 🎨 Visual polish (glassmorphism, animations)
- 🛡️ Error boundaries & health checks
- 📚 Comprehensive help system

### v1.7.0 - "Quartermaster" Update
- ⚡ Time-aware floating action button
- 📦 Batch import via deep links
- 🔧 Safe Mode menu

### v1.6.0 - "Cyborg" Update
- 🧠 Smart Board auto-organization
- 🏷️ Auto-categorization
- 🎙️ Protocol Droid voice templates

---

## License

Private / Internal Tools.

---

**Made with ❤️ for daily shipping.**
