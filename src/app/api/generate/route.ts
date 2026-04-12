import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { verifyTurnstile } from "../../../lib/turnstile";
import { extractFromUrl, extractFromFile } from "../../../lib/parser";
import { generateDevotional } from "../../../lib/claude";
import { saveDevotional } from "../../../lib/db";
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

    // Extract sermon text based on input mode
    let sermonText: string;

    if (inputMode === "url") {
      const url = formData.get("url") as string;
      if (!url) {
        return Response.json({ error: "Please provide a URL" }, { status: 400 });
      }
      sermonText = await extractFromUrl(url);
    } else if (inputMode === "paste") {
      const text = formData.get("text") as string;
      if (!text || text.trim().length < 100) {
        return Response.json(
          { error: "Please paste at least 100 characters of sermon text" },
          { status: 400 }
        );
      }
      sermonText = text.trim();
    } else if (inputMode === "upload") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "Please upload a file" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      sermonText = await extractFromFile(buffer, file.name);
    } else {
      return Response.json({ error: "Invalid input mode" }, { status: 400 });
    }

    // Truncate very long texts to avoid token limits
    // ~100k characters is roughly 25k tokens — plenty of context
    if (sermonText.length > 100000) {
      sermonText = sermonText.slice(0, 100000);
    }

    if (sermonText.length < 50) {
      return Response.json(
        { error: "Could not extract enough text from the source. Please try a different input method." },
        { status: 400 }
      );
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
    console.error("Generation error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
