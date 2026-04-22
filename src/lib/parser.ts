import * as cheerio from "cheerio";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

// Thrown for any user-fixable problem fetching or decoding a URL. The route
// handler maps this to a 400 with the message shown directly to the user,
// so keep messages actionable ("try pasting text instead", etc.).
export class UrlFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlFetchError";
  }
}

// Fetch cap for URL extraction. Cloudflare's tunnel timeout is 100s and the
// Claude call eats ~15-60s of that, so we can't afford a slow origin.
const URL_FETCH_TIMEOUT_MS = 30_000;

// Extract text from a URL. Branches on Content-Type so a PDF URL is parsed
// as a PDF instead of being fed to cheerio (which would happily return
// binary garbage as "text" and Claude would reject it later).
export async function extractFromUrl(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        // Browser-like UA — some sermon sites 403 unknown agents.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(URL_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    // AbortError fires when the timeout trips; any other exception is
    // a network-level failure (DNS, connection refused, TLS, etc.).
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new UrlFetchError(
        `That URL took longer than ${URL_FETCH_TIMEOUT_MS / 1000}s to respond. Try a different URL or paste the sermon text directly.`
      );
    }
    // Node's fetch wraps the real network error in `err.cause` (e.g.
    // ENOTFOUND, ECONNREFUSED, UND_ERR_SOCKET, TLS issues). Log it
    // server-side so failures like the 2026-04-13 incident aren't
    // reduced to the generic "fetch failed" string.
    const cause = (err as Error & { cause?: unknown }).cause;
    console.error("URL fetch failed:", url, "cause:", cause);
    const reason = err instanceof Error ? err.message : String(err);
    throw new UrlFetchError(
      `Could not reach that URL (${reason}). Check the URL or paste the sermon text directly.`
    );
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new UrlFetchError(
        `That site blocked our request (HTTP ${response.status}). Paste the sermon text directly instead.`
      );
    }
    if (response.status === 404) {
      throw new UrlFetchError(
        "That URL returned 404 (not found). Double-check the link."
      );
    }
    throw new UrlFetchError(
      `That URL returned HTTP ${response.status}. Try a different URL or paste the sermon text directly.`
    );
  }

  // Route by Content-Type so PDF URLs go to the PDF extractor, not cheerio.
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/pdf")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    return extractFromPdf(buffer);
  }

  if (
    contentType.includes("text/html") ||
    contentType.includes("application/xhtml") ||
    contentType.includes("text/plain") ||
    contentType === ""
  ) {
    const text = await response.text();
    return contentType.includes("text/plain")
      ? cleanText(text)
      : extractTextFromHtml(text);
  }

  throw new UrlFetchError(
    `Unsupported content type at that URL (${contentType}). Paste the sermon text directly instead.`
  );
}

// Extract readable text from HTML, stripping nav/footer/scripts
export function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove elements that aren't sermon content
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  // Try to find the main content area
  // Common selectors for sermon/article content
  const contentSelectors = [
    "article",
    '[role="main"]',
    "main",
    ".sermon-content",
    ".message-content",
    ".entry-content",
    ".post-content",
    ".article-content",
    ".content-body",
  ];

  for (const selector of contentSelectors) {
    const content = $(selector);
    if (content.length && content.text().trim().length > 200) {
      return cleanText(content.text());
    }
  }

  // Fallback: use the body text
  return cleanText($("body").text());
}

// Extract text from an uploaded file based on its type
export async function extractFromFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  switch (ext) {
    case "txt":
      return buffer.toString("utf-8");

    case "html":
    case "htm":
      return extractTextFromHtml(buffer.toString("utf-8"));

    case "pdf":
      return extractFromPdf(buffer);

    case "doc":
    case "docx":
      return extractFromWord(buffer);

    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

// Extract text from a PDF buffer using pdf-parse v2 class-based API
async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return cleanText(result.text);
}

// Extract text from a Word document buffer
async function extractFromWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return cleanText(result.value);
}

// Clean up extracted text: collapse whitespace, trim
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // collapse all whitespace to single spaces
    .replace(/\n{3,}/g, "\n\n") // max two newlines in a row
    .trim();
}
