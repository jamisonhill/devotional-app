# Cloudflare Turnstile Setup

Turnstile is Cloudflare's invisible/lightweight CAPTCHA. The app already
has the client widget (`src/components/TurnstileWidget.tsx`) and
server-side verification (`src/lib/turnstile.ts`) wired in. Without keys
configured, the widget renders a "Bypass" button and the server skips
verification — fine for local dev, not fine for production.

This doc walks through getting the app out of bypass mode.

## 1. Create a Turnstile site in Cloudflare

1. Log in to the Cloudflare dashboard → **Turnstile** (left nav).
2. Click **Add site**.
3. Name: `Devotional App` (or similar).
4. Domain: `devotional.duski.org`.
   - Add `localhost` too if you want to test the widget locally.
5. Widget type: **Managed** (recommended — Cloudflare decides between
   invisible, non-interactive, and managed challenge based on risk).
6. Save. Cloudflare shows two values:
   - **Site key** (public, goes in the browser)
   - **Secret key** (private, goes on the server)

## 2. Set environment variables on the NAS

The container reads two env vars:

| Variable | Where it's used | Public? |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Browser (Turnstile widget) | Yes — bundled into client JS |
| `TURNSTILE_SECRET_KEY` | Server (`/api/generate` verifies the token) | **No** — secret |

Because `NEXT_PUBLIC_*` vars are inlined at build time, the site key
must be present during the Docker build, not just at runtime. Two
options:

### Option A — Pass as build arg in GitHub Actions (recommended)

Add the site key to GitHub Actions secrets and pass it as a build arg.
This lets the CI/CD pipeline bake it into the image.

### Option B — Rebuild on the NAS

If you don't want the site key in CI, build the image locally on the
NAS with the env var set. Less convenient; not recommended.

For the **secret key**, always pass at runtime (never bake into image).
Set it on the container via Portainer stack env or `docker run -e`:

```
TURNSTILE_SECRET_KEY=<secret from Cloudflare>
```

## 3. Verify it's working

After deploy:

1. Load https://devotional.duski.org
2. The Turnstile widget should render (not the "Bypass" placeholder).
3. Submit a test generation. Check container logs — you should **not**
   see `TURNSTILE_SECRET_KEY not set — skipping verification`.
4. Try submitting with the token stripped (DevTools → remove the
   `turnstileToken` form field). Server should return
   `403 Bot verification failed`.

## 4. Testing keys (for local dev)

Cloudflare publishes always-pass and always-fail test keys:

- Always passes: site `1x00000000000000000000AA`, secret
  `1x0000000000000000000000000000000AA`
- Always fails: site `2x00000000000000000000AB`, secret
  `2x0000000000000000000000000000000AA`

Useful if you want to exercise the real widget/verification path
locally without the dev bypass button.

## Reference

- Cloudflare Turnstile docs: https://developers.cloudflare.com/turnstile/
- Client widget: `src/components/TurnstileWidget.tsx`
- Server verify: `src/lib/turnstile.ts`
- Usage: `src/app/api/generate/route.ts` (calls `verifyTurnstile()` on every POST)
