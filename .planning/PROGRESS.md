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
- [x] Code review pass — cataloged 8 findings
- [x] Bundle fix deployed: URL content-type check, friendlier errors, 30s
      timeout, auto-print on PDF endpoint, RSS #day-N hash nav, RSS escaping — e3d31b4
- [x] Fix: pdfjs-dist worker missing from standalone build — 1e82c61 ← DEPLOYED, needs verification
- [ ] Verify paste-text flow still works (regression check after Phase 4/5 changes)
- [ ] Verify upload mode works (PDF + Word + TXT) ← PAUSED HERE: needs 1e82c61 verification
- [ ] Verify URL input mode ← BLOCKED: "fetch failed" on all URLs, need NAS logs to diagnose
- [ ] Verify PDF download button (auto-print dialog)
- [ ] Verify RSS feed + #day-N hash navigation
- [ ] Mobile responsiveness check (real device)
- [ ] (Deferred, optional) Per-devotional generateMetadata for social previews
- [ ] (Deferred, optional) Cache-Control on PDF download endpoint

## Phase 6: Email Delivery (Future)
- [ ] Choose email provider (Resend or SendGrid)
- [ ] Add email collection on devotional page
- [ ] Build scheduled email sender (one day per email per day)

## Static Devotional Files (Pre-App)
- [x] 7 hand-crafted devotionals from "The Sifting of Simon Peter"
