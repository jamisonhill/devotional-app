import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { verifyTurnstile } from "../../../lib/turnstile";
import { extractFromUrl, extractFromFile } from "../../../lib/parser";
import { generateDevotional, ContentRejectedError } from "../../../lib/claude";
import { saveDevotional } from "../../../lib/db";
import { validateSermonText } from "../../../lib/validation";
import type { VoiceStyle, InputMode } from "../../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const inputMode = formData.get("inputMode") as InputMode;
    const voice = formData.get("voice") as VoiceStyle;
    const dayCount = Number(formData.get("dayCount"));
    const turnstileToken = formData.get("turnstileToken") as string;

    // Validate required fields
    if (!inputMode || !voice || !dayCount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (![3, 5, 7].includes(dayCount)) {
      return Response.json({ error: "Day count must be 3, 5, or 7" }, { status: 400 });
    }

    // Verify Turnstile token (bot protection)
    const isHuman = await verifyTurnstile(turnstileToken || "");
    if (!isHuman) {
      return Response.json({ error: "Bot verification failed. Please try again." }, { status: 403 });
    }

    // Extract sermon text based on input mode. Each branch produces `sermonText`
    // and a `sourceLabel` that the validator uses to tailor error messages.
    let sermonText: string;
    let sourceLabel: "paste" | "url" | "upload";

    if (inputMode === "url") {
      const url = formData.get("url") as string;
      if (!url) {
        return Response.json({ error: "Please provide a URL" }, { status: 400 });
      }
      sermonText = await extractFromUrl(url);
      sourceLabel = "url";
    } else if (inputMode === "paste") {
      const text = formData.get("text") as string;
      sermonText = (text || "").trim();
      sourceLabel = "paste";
    } else if (inputMode === "upload") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "Please upload a file" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      sermonText = await extractFromFile(buffer, file.name);
      sourceLabel = "upload";
    } else {
      return Response.json({ error: "Invalid input mode" }, { status: 400 });
    }

    // Uniform word-count validation for all three input modes. See
    // src/lib/validation.ts for the MIN_WORDS / MAX_WORDS limits.
    const validation = validateSermonText(sermonText, sourceLabel);
    if (!validation.ok) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Generate the devotional via Claude
    const result = await generateDevotional(sermonText, voice, dayCount);

    // Save to database
    const devotional = {
      id: uuidv4(),
      sermonTitle: result.sermonTitle,
      voice,
      dayCount,
      days: result.days,
      createdAt: new Date().toISOString(),
    };

    saveDevotional(devotional);

    return Response.json({ id: devotional.id });
  } catch (err) {
    // Content rejection is a user-facing 400, not a server error.
    if (err instanceof ContentRejectedError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    console.error("Generation error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
