"use client";

import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

export default function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // In dev mode without a site key, render a placeholder
  if (!siteKey) {
    return (
      <div className="rounded border border-dashed border-stone-300 p-3 text-center text-sm text-stone-500">
        Turnstile disabled (no site key configured)
        <button
          type="button"
          className="ml-2 underline"
          onClick={() => onVerify("dev-bypass-token")}
        >
          Bypass
        </button>
      </div>
    );
  }

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onVerify}
      options={{
        theme: "light",
        size: "normal",
      }}
    />
  );
}
