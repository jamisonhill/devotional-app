"use client";

import { useState } from "react";
import type { Devotional } from "../lib/types";
import { VOICE_LABELS } from "../lib/types";
import DayCard from "./DayCard";

interface DevotionalViewerProps {
  devotional: Devotional;
}

export default function DevotionalViewer({ devotional }: DevotionalViewerProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [rssLinkCopied, setRssLinkCopied] = useState(false);

  const voiceLabel = VOICE_LABELS[devotional.voice];
  const rssUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/rss/${devotional.id}`;

  function copyRssLink() {
    navigator.clipboard.writeText(rssUrl);
    setRssLinkCopied(true);
    setTimeout(() => setRssLinkCopied(false), 2000);
  }

  return (
    <div>
      {/* Header with title and actions */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#113E30" }}>
          {devotional.sermonTitle}
        </h1>
        <p className="text-sm mb-4" style={{ color: "#777779" }}>
          {devotional.dayCount}-Day Devotional &middot; Voice of {voiceLabel}
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/download/${devotional.id}`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#a6192e" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>

          <button
            onClick={copyRssLink}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-stone-50"
            style={{ borderColor: "#113E30", color: "#113E30" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            {rssLinkCopied ? "Copied!" : "Copy RSS Link"}
          </button>
        </div>
      </div>

      {/* Day navigation tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {devotional.days.map((day, index) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveDay(index)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeDay === index
                ? "text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
            style={activeDay === index ? { backgroundColor: "#113E30" } : {}}
          >
            Day {day.dayNumber}
          </button>
        ))}
      </div>

      {/* Active day content */}
      <DayCard day={devotional.days[activeDay]} />
    </div>
  );
}
