import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDevotional } from "../../../lib/db";
import { VOICE_LABELS } from "../../../lib/types";
import DevotionalViewer from "../../../components/DevotionalViewer";

// Per-devotional metadata so links shared in iMessage/Slack/etc. show the
// sermon title and voice instead of the generic site name. Returns the
// default metadata when the ID is unknown — the page itself will 404.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const devotional = getDevotional(id);
  if (!devotional) return {};

  const voiceLabel = VOICE_LABELS[devotional.voice];
  const title = `${devotional.sermonTitle} — ${devotional.dayCount}-Day Devotional`;
  const description = `A ${devotional.dayCount}-day devotional series in the voice of ${voiceLabel}, based on "${devotional.sermonTitle}."`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function DevotionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const devotional = getDevotional(id);

  if (!devotional) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <DevotionalViewer devotional={devotional} />
    </div>
  );
}
