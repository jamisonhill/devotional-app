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
- [x] Make GHCR package public
- [x] Deploy Portainer stack (port 3100)
- [x] Verify app loads on NAS

## Phase 3: Bug Fixes & Polish [IN PROGRESS]
- [x] Fix: disable browser form validation (noValidate) — pushed, awaiting Watchtower
- [ ] Test full generation flow on NAS ← PAUSED HERE
- [ ] Set up Cloudflare Turnstile (site key + secret key)
- [ ] Test URL input mode
- [ ] Test file upload mode
- [ ] Test PDF download
- [ ] Test RSS feed

## Phase 4: Email Delivery (Future)
- [ ] Choose email provider (Resend or SendGrid)
- [ ] Add email collection on devotional page
- [ ] Build scheduled email sender (one day per email per day)

## Static Devotional Files (Pre-App)
- [x] 7 hand-crafted devotionals from "The Sifting of Simon Peter" (day-1.md through day-7.md)
