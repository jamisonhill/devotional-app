import { NextRequest } from "next/server";
import { getDevotional } from "../../../../lib/db";
import { buildRssFeed } from "../../../../lib/rss";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const devotional = getDevotional(id);

  if (!devotional) {
    return Response.json({ error: "Devotional not found" }, { status: 404 });
  }

  // Build the base URL from the request
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const rssXml = buildRssFeed(devotional, baseUrl);

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
