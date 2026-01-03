# SOP — Commander PWA Ship + Capture (No-Think)
Tags: #SOP #PWA #ShipRule #Commander

## Ship (build → commit → push → deploy)
From repo root:
- Run: `.\wt-ship.ps1`
- Or: `npm run ship`

Definition of Done:
- Git push succeeds
- GitHub Actions deploy succeeds
- Site loads on phone (PWA homescreen)

## Capture (save ChatGPT blocks / logs)
1) Copy the block from ChatGPT (including LOG line)
2) From repo root, run: `.\wt-capture.ps1`
   - Or: `npm run capture`

Result:
- Saved to /logs as timestamped .md
- Auto-committed + pushed to GitHub
