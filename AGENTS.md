# AGENTS.md — Commander PWA
*Deploy to: project root of Commander PWA repo*
*Last updated: S81 | 2026-03-01*

---

## What This Is

Commander PWA is Warren's sovereign, offline-first execution cockpit — a Vanilla JS + Vite PWA with zero cloud dependency. Three-zone task system: Inbox → Next → Ship Today. v2.2.0 "Omega" — feature-complete. Deployed at warrenet.github.io/commander-pwa. No accounts, no server, no subscriptions.

---

## System Architecture

```
Browser PWA (Vanilla JS + Vite)
    ↓
IndexedDB (idb) — all task state, offline-first
    ↓
Service Worker — offline cache
    ↓
share.html — deep link intake (AI → Commander)
```

---

## Stack

- **Frontend:** Vanilla JS (ES modules) + Vite
- **PWA:** vite-plugin-pwa + service worker
- **Storage:** IndexedDB via `idb` library
- **Deployment:** GitHub Pages (`warrenet.github.io/commander-pwa`)
- **Windows scripts:** `wt-ship.ps1` (deploy), `wt-capture.ps1` (capture)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main.js` | App entry point, event wiring |
| `src/state.js` | Global state management |
| `src/store.js` | IndexedDB CRUD layer |
| `src/db.js` | Database initialization + schema |
| `src/ui.js` | DOM rendering and UI updates |
| `src/templates.js` | Task template library (50+ prompts) |
| `src/smart-sorting.js` | Priority sorting algorithm |
| `src/integrations.js` | External integrations (share, deep links) |
| `share.html` | Deep link intake — AI sends tasks here |
| `ai-instructions.md` | How AI assistants should format Commander deep links |
| `wt-ship.ps1` | Windows deploy script |
| `vite.config.js` | Build config — do not modify without approval |

---

## AI Deep Link Format

Claude can push tasks directly into Commander via:

```
https://warrenet.github.io/commander-pwa/share.html?text=<URL_ENCODED_TASK>&source=ai&auto=true
```

- `text`: Task content (under 200 chars)
- `source=ai`: Required
- `auto=true`: Triggers instant save

---

## Rules

**Before declaring done:**
1. Run `npm run build` — zero errors, clean dist/
2. Run `npm run preview` — verify PWA loads offline
3. Test deep link: open `share.html?text=test&source=ai&auto=true` — task should save
4. Verify IndexedDB: no data loss on page reload

**Never:**
- Add cloud state or server calls — offline-first is an invariant
- Add a framework (React, Vue, etc.) — this is intentionally Vanilla JS
- Modify the IndexedDB schema without a migration path
- Break the three-zone system (Inbox / Next / Ship Today)
- Remove PWA manifest or service worker registration

**Always:**
- Create rollback tag before major changes: `git tag pre-codex-$(date +%s)`
- Test offline — disconnect network, reload, verify all features work
- Keep bundle size minimal — no large dependencies
- Preserve deep link contract — `share.html` API is stable

---

## Commit Message Format

```
fix: <description>
feat: <description>
refactor: <description>
```

---

## Test Commands

```bash
npm run build    # must succeed, clean dist/
npm run preview  # verify PWA loads and works offline
```

---

## Coding Standards

- Vanilla JS ES modules — no transpiled TypeScript, no JSX
- IndexedDB access only through `src/store.js` — no direct IDB calls elsewhere
- DOM manipulation via `src/ui.js` — no ad-hoc querySelector in feature code
- Async: `async/await` throughout
- No `console.log` left in production builds

---

## Protected Files

- `vite.config.js` — build config (do not modify without explicit instruction)
- `src/db.js` — database schema (modify only with migration plan)
- `ai-instructions.md` — deep link spec (update if share.html API changes)
- `public/manifest.json` — PWA manifest (do not modify without explicit instruction)

---

*This file is read by Codex before every task. Keep it current.*
