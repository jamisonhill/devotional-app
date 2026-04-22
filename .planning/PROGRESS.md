# Devotional App — Progress

## Phase 1: Core App Build [COMPLETE]
- [x] Scaffold Next.js project with dependencies
- [x] Build database layer and types (SQLite + better-sqlite3)
- [x] Build text extraction service (URL, PDF, Word, HTML, TXT)
- [x] Build Claude integration with 6 voice prompts
- [x] Build input form UI (tabbed: URL/paste/upload + voice + day selector)
- [x] Build /api/generate endpoint
- [x] Build devotional viewer page (day-by-day reader)
- [x] Build PDF download endpoint (Mercy Hill branded HTML)
- [x] Build RSS feed endpoint
- [x] Docker setup (Dockerfile, docker-compose, GitHub Actions)

## Phase 2: Deploy to NAS-Home [COMPLETE]
- [x] Create GitHub repo (jamisonhill/devotional-app, private)
- [x] Push to main, GitHub Actions build succeeded
- [x] Add GHCR registry to Portainer
- [x] Make GHCR package public (required for Watchtower pulls)
- [x] Deploy Portainer stack (port 3100)
- [x] Verify app loads on NAS

## Phase 3: Bug Fixes & Production Stability [COMPLETE]
- [x] Fix: disable browser form validation (noValidate, formNoValidate)
- [x] Fix: improve error handling to surface actual server errors
- [x] Fix: add missing server packages to standalone build
- [x] Fix: DOMMatrix crash via instrumentation.ts polyfill
- [x] Fix: DNS resolution failure in Docker container (--dns 1.1.1.1 --dns 8.8.8.8)
- [x] Fix: Watchtower GHCR pull (made package public)
- [x] Test paste-text flow on NAS end-to-end

## Phase 4: Input Validation & Security [COMPLETE]
- [x] Word-count validation on all 3 input modes (min 100, max 30k) — 81dc5c9
- [x] Prompt injection hardening (<sermon_manuscript> wrapper + guardrails) — 204d5f0
- [x] Per-IP rate limiting (SQLite-backed, 10/day default, 429 w/ Retry-After) — d1e8fdd
- [x] Haiku 4.5 pre-screen to reject non-sermon content — 456d7cc
- [x] Turnstile production setup doc (docs/turnstile-setup.md) — 82d0c5e
- [ ] (Deferred) Actually configure Turnstile site/secret keys in Cloudflare + NAS env

## Phase 5: Testing & Polish [IN PROGRESS]
- [x] Code review pass — 8 findings shipped in e3d31b4
- [x] Bundle fix: URL content-type check, friendlier errors, 30s timeout,
      auto-print on PDF endpoint, RSS #day-N hash nav, RSS escaping — e3d31b4
- [x] Fix: pdfjs-dist worker missing from standalone build — 1e82c61
      (container redeploy verified: revision `fbbad93`, worker file physically
      present at /app/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs)
- [x] URL blocker diagnosed — was transient (Node fetch + wget both 200 now).
      Follow-up: err.cause now logged server-side so next recurrence has the
      real reason, not just "fetch failed".
- [x] Polish pass — 29136f9:
      - viewport meta export (fixes iOS Safari mobile render)
      - next/font/google self-hosted Montserrat (clears lint warning,
        removes runtime Google Fonts request)
      - `<Link>` for logo (clears lint error, avoids full page reload)
      - Cache-Control public max-age=3600 on PDF HTML
      - generateMetadata for Open Graph + Twitter card previews
      - err.cause logging on URL fetch failures
- [x] RSS endpoint shell-verified: content-type, cache-control, CDATA,
      forwarded Host/X-Forwarded-Proto, #day-N anchors, Claude-output escaping
- [x] PDF download endpoint shell-verified: inline disposition, @media print,
      fonts.ready auto-print with load fallback
- [x] 404 handling shell-verified on all three ID routes
- [x] /api/generate shell-verified: missing-fields / bad-day-count /
      bad-input-mode all 400 BEFORE rate limit (safe to curl without quota burn)
- [ ] Verify paste-text flow end-to-end (browser)
- [ ] Verify upload mode (PDF + Word + TXT) (browser — pdfjs worker fix
      deployed, needs runtime PDF upload to confirm crash is gone)
- [ ] Verify URL input mode end-to-end via UI (browser). Known:
      thegospelcoalition.org returns 200; desiringgod.org + monergism.com
      bot-block our UA — app correctly shows "paste the sermon text directly"
- [ ] Verify PDF download button triggers auto-print dialog (browser)
- [ ] Verify RSS feed + #day-N hash navigation via real feed reader
- [ ] Mobile responsiveness check on real device (post-viewport fix)
- [ ] Live API tests: word-count 400s, Haiku pre-screen rejection, prompt
      injection sanitization (each burns a rate-limit slot + API cost)

## Phase 5 — Deferred / Open Decisions
- [ ] Sonnet 4 → 4.6 upgrade (src/lib/claude.ts:168). Not a bug — voice
      prompts may need re-tuning for new model.
- [ ] File upload size limit (DoS vector — no byte cap today, word-count
      only checked AFTER extraction; a 500MB PDF would be read into memory
      and fed to pdf-parse before the word-count gate rejects).
- [ ] DB connection consolidation (src/lib/db.ts and src/lib/rate-limit.ts
      each open their own better-sqlite3 connection to the same file;
      harmless in WAL mode but a refactor opportunity).

## Phase 6: Email Delivery (Future)
- [ ] Choose email provider (Resend or SendGrid)
- [ ] Add email collection on devotional page
- [ ] Build scheduled email sender (one day per email per day)

## Static Devotional Files (Pre-App)
- [x] 7 hand-crafted devotionals from "The Sifting of Simon Peter"
