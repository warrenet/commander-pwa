# Changelog

All notable changes to Commander PWA will be documented in this file.

## [2.2.0] - 2026-01-05

### Added
- **App Icon Shortcuts**: Long-press the app icon for quick actions (New Task, Ship Mode, Quick Capture)
- **Status Brief Generator**: Copy formatted status reports for Slack/Teams with one tap
- **Eisenhower Matrix View**: Toggle Next section into a 2x2 priority grid
- **Recurring Task Engine**: Tasks tagged `#daily` are detected for automatic reset
- **Cross-Tab Sync**: Changes in one tab automatically refresh other open tabs
- **Storage Quota Warning**: Alerts when approaching 4MB storage limit

### Fixed
- All menu buttons now have working handlers
- Missing help/tip button handlers restored
- Lint warnings for backdrop-filter order resolved
- Inline styles moved to CSS classes

### Technical
- Added `utils/recurring.js` for daily task reset and status reports
- Added `checkStorageOnStartup()` defensive check
- Added `initCrossTabSync()` for multi-tab data integrity
- All new functions use try/catch for error safety

## [2.1.0] - 2026-01-05

### Added
- MacroDroid automation integration
- Silent mode for background task creation
- Command dispatcher for deep links
- Automation helper page (`/automation.html`)

## [2.0.0] - 2026-01-04

### Added
- Smart Tips system with context-aware toasts
- Natural Language Date parsing (`utils/nlp-date.js`)
- Smart Task analysis - duplicate detection, priority inference
- 14 AI clipboard prompts for ChatGPT/Gemini integration
- Premium visual polish (glassmorphism, gradients, animations)
- Comprehensive README documentation

## [1.7.0] - 2026-01-03

### Added
- Keyboard shortcuts (j/k navigation, ? for help)
- Pomodoro timer with session logging
- Focus mode for distraction-free work
- Board view with smart categorization
- Haptic feedback on actions

## [1.6.0] - 2026-01-02

### Added
- Share Target API integration
- Batch ingestion via URL parameters
- Template system for capture workflows
- Offline-first with Service Worker
