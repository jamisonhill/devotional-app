import * as cheerio from "cheerio";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

// Extract text from a URL by fetching and parsing the HTML
export async function extractFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      // Use a browser-like user agent to avoid 403s from some sites
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return extractTextFromHtml(html);
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
