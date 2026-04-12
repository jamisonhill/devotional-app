import { getDevotional } from "../../../../lib/db";
import { generateDevotionalHtml } from "../../../../lib/pdf-generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const devotional = getDevotional(id);

  if (!devotional) {
    return Response.json({ error: "Devotional not found" }, { status: 404 });
  }

  // Generate styled HTML that the user can print/save as PDF from their browser
  // This avoids needing puppeteer or heavy PDF libraries in the container
  const html = generateDevotionalHtml(devotional);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${devotional.sermonTitle.replace(/[^a-zA-Z0-9 ]/g, "")}-devotional.html"`,
    },
  });
}
