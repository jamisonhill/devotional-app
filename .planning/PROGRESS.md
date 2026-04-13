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
- [x] Fix: DOMMatrix crash — pdf-parse/pdfjs-dist uses browser-only APIs at module load
  - Added `instrumentation.ts` to polyfill DOMMatrix/Path2D/ImageData before route modules load
- [x] Fix: DNS resolution failure in Docker container (EAI_AGAIN api.anthropic.com)
  - Container restarted with `--dns 1.1.1.1 --dns 8.8.8.8` for reliable DNS
- [x] Fix: Watchtower couldn't pull from GHCR (package was private, no docker login)
  - Made GHCR package public
- [x] Test full generation flow on NAS — working end-to-end (paste text mode)

## Phase 4: Input Validation & Security [NOT STARTED]
- [ ] Validate input is actually sermon/devotional content before sending to Claude
  - Reject off-topic, harmful, or nonsensical input
  - Catch prompt injection attempts (users trying to override the system prompt)
- [ ] Add content-type heuristics (minimum word count, religious/theological keyword check)
- [ ] Add Claude-based pre-screening pass (lightweight check: "is this sermon content?")
- [ ] Rate limiting per IP to prevent abuse
- [ ] Set up Cloudflare Turnstile (site key + secret key) for bot protection
- [ ] Add input length limits with clear user feedback

## Phase 5: Testing & Polish [NOT STARTED]
- [ ] Test URL input mode (try real sermon URLs from desiringgod.org, etc.)
- [ ] Test file upload mode (PDF, Word, TXT)
- [ ] Test PDF download button
- [ ] Test RSS feed (copy link, open in browser or reader)
- [ ] Mobile responsiveness check
- [ ] Error messaging improvements

## Phase 6: Email Delivery (Future)
- [ ] Choose email provider (Resend or SendGrid)
- [ ] Add email collection on devotional page
- [ ] Build scheduled email sender (one day per email per day)

## Static Devotional Files (Pre-App)
- [x] 7 hand-crafted devotionals from "The Sifting of Simon Peter" (day-1.md through day-7.md)
