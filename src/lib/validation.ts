// Shared validation for sermon text input.
// Applied after extraction for every input mode (paste, URL, upload) so
// all three paths enforce the same floor and ceiling on content length.

// Typical lengths for reference:
// - 5-minute sermon manuscript: ~500-750 words
// - 30-minute sermon manuscript: ~3,000-5,000 words
// - Very long conference talk transcript: up to ~10,000 words
// - 30,000 words is generous headroom; beyond that is almost certainly
//   multi-sermon content, boilerplate, or abuse.
export const MIN_WORDS = 100;
export const MAX_WORDS = 30_000;

// Count whitespace-delimited tokens. Good enough for enforcement — we're not
// tokenizing for linguistic accuracy, just measuring bulk content.
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export type ValidationResult =
  | { ok: true; wordCount: number }
  | { ok: false; error: string };

// Validate extracted sermon text. `sourceLabel` tailors the error message so
// a paste failure mentions pasting, a URL failure mentions the URL, etc.
export function validateSermonText(
  text: string,
  sourceLabel: "paste" | "url" | "upload"
): ValidationResult {
  const wordCount = countWords(text);

  if (wordCount === 0) {
    const sourceMsg =
      sourceLabel === "url"
        ? "No readable text was found at that URL. Try pasting the sermon text directly instead."
        : sourceLabel === "upload"
        ? "No readable text was found in that file. Try a different file or paste the sermon text directly."
        : "Please paste the sermon text before submitting.";
    return { ok: false, error: sourceMsg };
  }

  if (wordCount < MIN_WORDS) {
    return {
      ok: false,
      error: `Sermon text is too short (${wordCount} words). Please provide at least ${MIN_WORDS} words of sermon content so Claude has enough to work with.`,
    };
  }

  if (wordCount > MAX_WORDS) {
    return {
      ok: false,
      error: `Sermon text is too long (${wordCount.toLocaleString()} words, limit is ${MAX_WORDS.toLocaleString()}). Please trim to a single sermon manuscript.`,
    };
  }

  return { ok: true, wordCount };
}
