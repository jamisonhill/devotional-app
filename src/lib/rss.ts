import { Feed } from "feed";
import type { Devotional } from "./types";
import { VOICE_LABELS } from "./types";

// Build an RSS feed for a devotional series
export function buildRssFeed(devotional: Devotional, baseUrl: string): string {
  const voiceLabel = VOICE_LABELS[devotional.voice];
  const feedTitle = `${devotional.sermonTitle} — ${devotional.dayCount}-Day Devotional`;

  const feed = new Feed({
    title: feedTitle,
    description: `A ${devotional.dayCount}-day devotional series in the voice of ${voiceLabel}, based on "${devotional.sermonTitle}."`,
    id: `${baseUrl}/devotional/${devotional.id}`,
    link: `${baseUrl}/devotional/${devotional.id}`,
    language: "en",
    copyright: `Generated devotional content. Scripture quotations are from the ESV.`,
    updated: new Date(devotional.createdAt),
    generator: "Sermon to Devotional",
  });

  // Add each day as a feed item — all published immediately
  for (const day of devotional.days) {
    const itemContent = `
<h2>${day.title}</h2>

<h3>Scripture Reading</h3>
<blockquote>${day.scriptureReading}</blockquote>

<h3>Devotional</h3>
${day.body.split("\n\n").map((p) => `<p>${p}</p>`).join("\n")}

<h3>Reflection Questions</h3>
<ol>
${day.reflectionQuestions.map((q) => `<li>${q}</li>`).join("\n")}
</ol>

<h3>Prayer</h3>
<p><em>${day.prayer}</em></p>
    `.trim();

    feed.addItem({
      title: `Day ${day.dayNumber}: ${day.title}`,
      id: `${baseUrl}/devotional/${devotional.id}#day-${day.dayNumber}`,
      link: `${baseUrl}/devotional/${devotional.id}#day-${day.dayNumber}`,
      description: `Day ${day.dayNumber} of ${devotional.dayCount}: ${day.title}`,
      content: itemContent,
      date: new Date(devotional.createdAt),
    });
  }

  return feed.rss2();
}
