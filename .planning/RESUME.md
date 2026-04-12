# Resume: Devotional App

**Paused:** 2026-04-12 2:30am
**Reason:** Done for tonight, more testing tomorrow
**Phase:** 3/4 — Bug Fixes & Polish
**Task:** Test full generation flow on NAS

## What's Working
- App is deployed and loading on NAS at http://192.168.0.9:3100
- Paste text mode works locally (tested with sermon text, generated devotional successfully)
- GitHub Actions CI/CD pipeline working (GHCR + Watchtower auto-deploy)
- Portainer stack deployed with env vars (ANTHROPIC_API_KEY set, Turnstile keys blank)

## What Was Just Fixed
- Browser form validation error ("The string did not match the expected pattern") when submitting on Paste Text tab
- Fix: added `noValidate` to form element — committed and pushed, Watchtower should pick up within ~5 min
- Also fixed earlier: ANTHROPIC_API_KEY not loading (was missing `ANTHROPIC_API_KEY=` prefix in .env.local, plus lazy-init client)

## Key Decisions Made
- Using GHCR + Watchtower deploy pattern (not the static-site skill directly, but same pattern adapted for dynamic Next.js app)
- PDF "download" serves styled HTML that user prints to PDF from browser (avoids puppeteer dependency in container)
- Turnstile bypassed for now (no keys configured) — needs setup in Cloudflare dashboard
- Port 3100 on NAS
- SQLite stored in Docker named volume `devotional-data`

## Code State
- All source in `/Users/jamisonhill/Ai/Devotions/devotional-app/`
- GitHub: `jamisonhill/devotional-app` (private)
- Latest commit: `fix: disable browser form validation to prevent URL field error`
- No uncommitted changes

## What to Test Next
1. Generate a devotional on the NAS (paste text mode) — verify the noValidate fix deployed
2. Test URL input mode (try a sermon URL)
3. Test file upload mode (PDF, Word, TXT)
4. Test the devotional viewer (day navigation, styling)
5. Test PDF download button
6. Test RSS feed (copy link, open in browser or reader)
7. Set up Cloudflare Turnstile keys

## NAS Connection Note
- SSH to nas-home was refused during this session (port 22 connection refused)
- All NAS work done through Portainer web UI at portainer.duski.org

## To Resume
1. Open http://192.168.0.9:3100 and test generation
2. If issues, check Portainer container logs
3. For local dev: `cd /Users/jamisonhill/Ai/Devotions/devotional-app && npm run dev`
4. Need `.env.local` with `ANTHROPIC_API_KEY=sk-ant-...` for local dev
