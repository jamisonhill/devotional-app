import type { Devotional } from "./types";
import { VOICE_LABELS } from "./types";

// Generate a styled HTML document for the devotional that can be converted to PDF
// Uses the Mercy Hill brand styling from print-md
export function generateDevotionalHtml(devotional: Devotional): string {
  const voiceLabel = VOICE_LABELS[devotional.voice];

  const daysHtml = devotional.days
    .map(
      (day) => `
    <div class="day-section">
      <h2>Day ${day.dayNumber}: ${escapeHtml(day.title)}</h2>

      <h3>Scripture Reading</h3>
      <blockquote>${escapeHtml(day.scriptureReading)}</blockquote>

      <h3>Devotional</h3>
      ${day.body
        .split("\n\n")
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join("\n")}

      <h3>Reflection Questions</h3>
      <ol>
        ${day.reflectionQuestions.map((q) => `<li>${escapeHtml(q)}</li>`).join("\n        ")}
      </ol>

      <h3>Prayer</h3>
      <p class="prayer"><em>${escapeHtml(day.prayer)}</em></p>
    </div>
  `
    )
    .join('<div class="page-break"></div>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(devotional.sermonTitle)} — ${devotional.dayCount}-Day Devotional</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #113E30;
      --color-accent: #a6192e;
      --color-text: #404041;
      --color-gray: #777779;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Montserrat', sans-serif;
      font-weight: 400;
      color: var(--color-text);
      line-height: 1.7;
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    h1 {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--color-primary);
      margin-bottom: 0.25rem;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--color-gray);
      margin-bottom: 2rem;
      font-weight: 500;
    }

    h2 {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-primary);
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: 0.5rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 1rem;
    }

    blockquote {
      border-left: 4px solid var(--color-accent);
      background: rgba(166, 25, 46, 0.05);
      padding: 1rem 1.25rem;
      margin: 1rem 0;
      font-style: italic;
      line-height: 1.8;
    }

    ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }

    ol li {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }

    .prayer {
      background: rgba(17, 62, 48, 0.05);
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      border-left: 4px solid var(--color-primary);
    }

    .day-section {
      margin-bottom: 2rem;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      margin: 0;
      border: none;
    }

    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      @page {
        margin: 1in;
      }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(devotional.sermonTitle)}</h1>
  <p class="subtitle">A ${devotional.dayCount}-Day Devotional in the Voice of ${escapeHtml(voiceLabel)}</p>

  ${daysHtml}

  <script>
    // Open the print dialog as soon as fonts are ready so the user lands
    // on "Save as PDF" without having to hunt for File → Print.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => window.print());
    } else {
      window.addEventListener('load', () => window.print());
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
