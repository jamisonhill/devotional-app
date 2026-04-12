// Server-side verification of Cloudflare Turnstile tokens

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If no secret key is configured, skip verification (dev mode)
    console.warn("TURNSTILE_SECRET_KEY not set — skipping verification");
    return true;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    }
  );

  const data = (await response.json()) as TurnstileVerifyResponse;
  return data.success;
}
