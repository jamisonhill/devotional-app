# Resume: Devotional App

**Paused:** 2026-04-21
**Reason:** Session complete — Phase 5 polish shipped + pushed, remaining
items need a browser/device (or are judgment-level scope decisions).
**Phase:** Phase 5 (Testing & Polish) — shell portion COMPLETE
**Status:** Clean working tree, HEAD pushed to origin/main

## What shipped this session

**Verification work:**
- 1e82c61 (pdfjs worker) confirmed deployed: container image revision
  `fbbad93` with worker file physically present at
  `/app/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs`.
- URL "fetch failed" blocker resolved — was transient overnight. From
  inside the container: wget → 200, Node fetch → 200 against three
  sample sermon-site URLs. Two return 403 (desiringgod.org,
  monergism.com bot-block our UA — app correctly handles with the
  "paste the sermon text directly" 403 branch), one returns 200
  (thegospelcoalition.org).

**Shell-level Phase 5 verification (all green):**
- RSS endpoint: content-type, cache-control, CDATA, #day-N anchors,
  Claude-output escaping via CDATA + escapeHtml, respects Host +
  X-Forwarded-Proto headers (prod URL generation correct).
- PDF download endpoint: content-disposition inline, @media print,
  fonts.ready auto-print with load fallback, now with Cache-Control.
- 404s on all three ID-based routes (/devotional/[id],
  /api/download/[id], /api/rss/[id]).
- /api/generate field validation rejects BEFORE rate-limit check
  (missing fields, bad dayCount, bad inputMode) — safe to curl without
  burning the 10/day/IP quota.

**Commit 29136f9 `feat(phase5): polish pass across layout, URL parser,
and ID routes`** (5 files, +63/-18, pushed):
- src/app/layout.tsx: `viewport` export (`width: "device-width",
  initialScale: 1`) — Next 15+ no longer auto-injects, iOS Safari was
  rendering at synthetic ~980px and scaling down.
- src/app/layout.tsx + globals.css: Google Fonts `<link>` → next/font
  /google self-hosted Montserrat with `--font-montserrat` CSS variable.
  Clears `@next/next/no-page-custom-font` warning, removes the runtime
  request to fonts.googleapis.com.
- src/app/layout.tsx: `<a href="/">` → `<Link>` for the logo. Clears
  `@next/next/no-html-link-for-pages` error, avoids a full page reload.
- src/lib/parser.ts: `console.error("URL fetch failed:", url, "cause:",
  err.cause)` in the extractFromUrl catch block. So the next transient
  URL failure surfaces the real cause (ENOTFOUND, UND_ERR_SOCKET, TLS,
  etc.) instead of just "fetch failed".
- src/app/api/download/[id]/route.ts: `Cache-Control: public,
  max-age=3600`. Devotionals are immutable by UUID, same policy as RSS.
- src/app/devotional/[id]/page.tsx: `generateMetadata` returning title,
  description, openGraph (article), twitter (summary card). Shared
  devotional links now render with sermon title + voice instead of the
  generic site name in iMessage/Slack/etc.

## Quality gates (post-commit)

- `next build` ✅ clean
- `tsc --noEmit` ✅ clean
- `eslint src/**` ✅ clean (was 1 error + 1 warning before 29136f9)

## Current state

- HEAD: `29136f9 feat(phase5): polish pass across layout, URL parser,
  and ID routes` (pushed to origin/main).
- Working tree clean (`samples/` still untracked — unrelated project
  files).
- Container on NAS will be at `29136f9` within ~5 min of push (GitHub
  Actions build → GHCR → Watchtower pull).
- DB has 2 devotionals (both paste-text, pre-URL-blocker).

## Outstanding — browser / device tests

1. **PDF upload** runtime test. Worker fix deployed, just needs a real
   PDF uploaded through the UI to confirm the
   `Cannot find module .../pdf.worker.mjs` crash is resolved.
2. **URL input** end-to-end via the UI. Use
   https://www.thegospelcoalition.org/... for the happy path.
   desiringgod.org + monergism.com will correctly hit the 403 branch
   with "paste the sermon text directly" — that's the right message.
3. **Word + TXT upload** (never tested post-Phase-4).
4. **PDF download button** — confirm auto-print dialog fires on new-tab
   open (fonts.ready path).
5. **RSS feed** via a real feed reader + #day-N hash navigation.
6. **Mobile responsiveness** on a real iPhone (post-viewport fix in
   29136f9 this is the biggest unknown — viewport meta should fix the
   main iOS Safari issue).

## Outstanding — live API tests (each burns 1 rate-limit slot + API cost)

- Word-count 400 (paste <100 words, expect "too short" message)
- Word-count 400 (paste >30k words, expect "too long" message)
- Haiku pre-screen rejection (paste obvious non-sermon content, expect
  "does not appear to be a sermon" 400)
- Prompt injection sanitization (paste sermon text containing literal
  `</sermon_manuscript>` closing tag + instructions to ignore system
  prompt; confirm output is still a devotional series)

## Outstanding — judgment calls / separate scope

1. **Sonnet 4 → 4.6 upgrade** (src/lib/claude.ts:168 currently uses
   `claude-sonnet-4-20250514`). Voice prompts were tuned with Sonnet
   4 output — new model may behave slightly differently. Not a bug,
   needs output-quality review before switching.
2. **File upload size limit** — /api/generate's upload branch reads
   the full file into memory (`Buffer.from(await file.arrayBuffer())`)
   and feeds it to pdf-parse / mammoth BEFORE the word-count gate.
   A 500MB PDF would OOM the container. Needs an early byte-count
   check in the upload branch. Separate commit.
3. **DB connection consolidation** — src/lib/db.ts and
   src/lib/rate-limit.ts each open a `new Database(DB_PATH)`.
   Harmless in WAL mode but tidy-up opportunity.

## Outstanding — Phase 4 tail

- Real Turnstile key configuration (Cloudflare dashboard site + secret,
  NAS env `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`). Still in
  bypass mode. Full walkthrough already written:
  docs/turnstile-setup.md.

## Handy commands for next session

Check container revision (confirm Watchtower picked up 29136f9):
```
ssh nas-home 'echo "$NAS_SUDO_PW" | sudo -S -p "" /usr/local/bin/docker inspect devotional-app --format "{{.Config.Labels}}"' | grep revision
```

Tail container logs during live URL tests (will now capture err.cause):
```
ssh nas-home 'echo "$NAS_SUDO_PW" | sudo -S -p "" /usr/local/bin/docker logs devotional-app -f --tail 50'
```

Query DB for devotionals:
```
ssh nas-home 'cat /tmp/devo.db' > /tmp/devo.db
ssh nas-home 'cat /tmp/devo.db-wal' > /tmp/devo.db-wal
sqlite3 /tmp/devo.db "SELECT id, sermon_title, voice, day_count, created_at FROM devotionals ORDER BY created_at DESC"
```
(NB: scp subsystem is disabled on nas-home; `ssh ... 'cat file' > local`
is the working workaround.)

Minor annoyance observed: `git push` on this repo prints
`'credential-!gh' is not a git command` — unrelated git config quirk,
push succeeds regardless.

## To resume

1. Wait for / confirm Watchtower has redeployed `29136f9` on the NAS.
2. Start the browser test matrix above in order; pick a compliant URL
   (gospelcoalition) for the URL-input path.
3. After browser tests, decide on the deferred items: Sonnet upgrade,
   file size limit, Turnstile production keys.
