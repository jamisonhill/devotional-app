# Resume: Devotional App

**Paused:** 2026-04-13 ~12:30am
**Reason:** Phase 3 complete — app is working in production. Next phase is input validation.
**Phase:** 3 complete, Phase 4 next — Input Validation & Security
**Task:** Design and implement content validation for the input form

## What's Working
- Full generation flow works end-to-end at https://devotional.duski.org
- Paste text mode confirmed working in production
- GitHub Actions CI/CD → GHCR → Watchtower auto-deploy pipeline functional
- GHCR package is public (Watchtower can pull without auth)
- Container running with explicit DNS (--dns 1.1.1.1 --dns 8.8.8.8)
- Cloudflare tunnel routing traffic to NAS port 3100

## What Was Fixed This Session
1. **DOMMatrix crash** — `pdf-parse` → `pdfjs-dist` uses browser-only APIs (DOMMatrix, Path2D, ImageData) at module evaluation time. Fixed with `instrumentation.ts` that polyfills these before any route modules load.
2. **DNS resolution failure** — Container couldn't resolve `api.anthropic.com` (EAI_AGAIN). Fixed by adding `--dns 1.1.1.1 --dns 8.8.8.8` to docker run.
3. **Watchtower pull failure** — GHCR package was private with no docker login on NAS. Fixed by making package public.
4. **SSH access** — NAS SSH was down, required reboot. Now working on port 22.

## Key Decisions Made
- GHCR package set to public (no secrets in image, source stays private)
- `instrumentation.ts` pattern for server-side polyfills (runs before route module evaluation)
- Container managed via `docker run` with explicit flags (not Portainer stack compose, since compose file lives inside Portainer's volume)
- Cloudflare tunnel has 100s timeout — generation must complete within that window

## Known Limitations
- **No input validation** — form accepts any text, no check that it's actually sermon content. Vulnerable to prompt injection and abuse.
- **Turnstile not configured** — bypass mode active (no site key or secret key set)
- **Cloudflare 524 timeout** — long generations (7-day, verbose sermons) may exceed Cloudflare's 100s timeout
- **No rate limiting** — any user can generate unlimited devotionals

## Code State
- All source: `/Users/jamisonhill/Ai/Devotions/devotional-app/`
- GitHub: `jamisonhill/devotional-app` (private repo, public GHCR package)
- Latest commit: `fix: use instrumentation.ts to polyfill DOMMatrix before module load`
- No uncommitted changes
- Branch: `main`

## What to Do Next (Phase 4: Input Validation & Security)
1. **Content validation** — before sending to Claude, verify input is sermon-like content:
   - Minimum word count check (~100 words)
   - Lightweight Claude pre-screen: "Is this a sermon, Bible study, or religious teaching?"
   - Reject clearly off-topic content with helpful error message
2. **Prompt injection protection** — sanitize input to prevent system prompt override:
   - Strip common injection patterns ("ignore previous instructions", "you are now...")
   - Add guardrails in the system prompt to resist manipulation
3. **Rate limiting** — per-IP throttle to prevent abuse
4. **Turnstile setup** — configure Cloudflare Turnstile site key + secret key

## NAS Connection
- SSH: `ssh nas-home` (192.168.0.9:22, key auth)
- Docker commands require: `echo '$NAS_SUDO_PW' | sudo -S -p "" ...`
- Container: `devotional-app` on port 3100→3000
- Portainer: port 9000

## To Resume
1. `cd /Users/jamisonhill/Ai/Devotions/devotional-app`
2. Read `.planning/PROGRESS.md` and `.planning/RESUME.md`
3. Start Phase 4 — input validation work
4. For local dev: `npm run dev` (needs `.env.local` with ANTHROPIC_API_KEY)
