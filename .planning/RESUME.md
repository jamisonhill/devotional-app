# Resume: Devotional App

**Paused:** 2026-04-13 bedtime
**Reason:** Bedtime. Phase 4 shipped. Phase 5 live testing is blocked on
a URL-fetch failure in the container that needs NAS logs to diagnose.
PDF worker fix pushed but not verified yet.
**Phase:** Phase 5 (Testing & Polish) — IN PROGRESS
**Status:** Mid-testing, one confirmed fix pushed, one blocker open

## What shipped this session

**Phase 4 — Input Validation & Security (complete, all 5 items):**
- 81dc5c9 — word-count validation (min 100, max 30k) for paste/url/upload
- 204d5f0 — prompt-injection hardening: `<sermon_manuscript>` wrapper +
  system-prompt guardrail + sanitize literal closing tags.
  New `ContentRejectedError` → 400.
- d1e8fdd — per-IP rate limiting backed by SQLite (same DB as
  devotionals), 10/day default via `RATE_LIMIT_PER_DAY`, check runs
  before Turnstile so abusive IPs don't burn siteverify. 429 + Retry-After.
- 456d7cc — Haiku 4.5 pre-screen rejects non-sermon input. "unclear"
  and errors fail open.
- 82d0c5e — `docs/turnstile-setup.md` walks through Cloudflare site+secret
  key setup (Turnstile keys are NOT yet configured in production — still
  in bypass mode).

**Phase 5 — Code review + first bundle (partial):**
- e3d31b4 — six testability fixes:
  - `extractFromUrl`: branches on Content-Type (PDFs → PDF extractor),
    wraps all failures in `UrlFetchError` with actionable messages,
    30s `AbortSignal.timeout`.
  - `/api/generate`: maps `UrlFetchError` → 400.
  - PDF endpoint: auto-opens `window.print()` on load after fonts ready.
  - Download button: "Print / Save as PDF", opens in new tab.
  - `DevotionalViewer`: honors `#day-N` hash from RSS, sets activeDay
    on mount and on hashchange.
  - RSS: HTML-escapes every Claude-generated field.
- 1e82c61 — fix pdfjs-dist worker missing from standalone build. Added
  `outputFileTracingIncludes: { "/api/generate": ["./node_modules/pdfjs-dist/legacy/build/**/*"] }`
  and added `pdfjs-dist` to `serverExternalPackages`. Pushed; Watchtower
  should have redeployed by morning.

## Live testing results so far

| Mode | Status |
|---|---|
| Paste text | ✅ Working end-to-end (pre-session) |
| Upload PDF | ❌ Was crashing: "Cannot find module .../pdfjs-dist/legacy/build/pdf.worker.mjs" — fix pushed (1e82c61), NOT YET VERIFIED |
| Upload Word/TXT | Not yet tested |
| URL input | ❌ BLOCKER: "Could not reach that URL (fetch failed)" on all URLs (desiringgod.org etc.). Screenshot confirmed. Underlying cause unknown — Node's `fetch failed` is generic and `err.cause` has the real reason but isn't logged. |
| PDF download | Not yet tested |
| RSS feed | Not yet tested |
| Mobile | Not yet tested |

## The URL blocker — what to do next

Node's `fetch failed` message hides the real cause. Likely suspects:
- DNS (container has `--dns 1.1.1.1 --dns 8.8.8.8`, should be fine, but worth confirming)
- IPv6 black hole (container has no v6 route; Node tries v6 first; happy-eyeballs sometimes doesn't fall back cleanly)
- Egress blocked by home network / Cloudflare WARP / Unifi rules
- TLS / cert chain problem

**Step 1 — pull the actual error cause from the container:**
```
ssh nas-home 'echo "$NAS_SUDO_PW" | sudo -S -p "" docker logs devotional-app --tail 200 2>&1 | grep -A 10 "Generation error\|UrlFetchError\|fetch"'
```

**Step 2 — test networking from inside the container (Node-specific vs total network):**
```
ssh nas-home 'echo "$NAS_SUDO_PW" | sudo -S -p "" docker exec devotional-app sh -c "wget -qO- --tries=1 https://www.desiringgod.org/ | head -5; echo EXIT=\$?"'
```

- wget works → it's Node's fetch (likely IPv6). Fix: add
  `dns.setDefaultResultOrder("ipv4first")` in `src/instrumentation.ts`.
- wget fails too → container egress problem. Investigate Cloudflare tunnel
  outbound, Unifi firewall, NAT rules.

**Step 3 — improve error logging so next time we have this info from the
start:** in `src/lib/parser.ts` `extractFromUrl`, when wrapping fetch errors,
include `err.cause` in the server log (not in the user-facing message):
```ts
console.error("URL fetch failed:", url, "cause:", (err as Error & { cause?: unknown }).cause);
```

## Known limitations still in production

- Turnstile in bypass mode (Phase 4 doc written, keys not configured)
- Cloudflare tunnel 100s timeout (long 7-day generations can still 524)
- No per-IP rate limit dashboard (DB has `rate_limit_events` table if
  you want to query it manually)

## Current commit on main

`1e82c61 fix: include pdfjs-dist worker in standalone build`

Clean working tree. Samples/ still untracked (unrelated — project root
contains sample sermons for testing).

## To resume

1. Verify Watchtower picked up 1e82c61 (check container image digest on NAS)
2. Retest PDF upload — should no longer crash on worker-missing
3. Run the two diagnostic commands above for the URL blocker, then patch
   based on result
4. Continue through the Phase 5 test matrix (RSS, PDF download, mobile)
5. Decide when to actually wire up Turnstile keys (requires Cloudflare
   dashboard access + NAS env var update — see docs/turnstile-setup.md)
