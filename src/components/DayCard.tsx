"use client";

import type { DevotionalDay } from "../lib/types";

interface DayCardProps {
  day: DevotionalDay;
}

export default function DayCard({ day }: DayCardProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
      <h2
        className="text-xl font-bold mb-6 pb-3 border-b-2"
        style={{ color: "#113E30", borderColor: "#113E30" }}
      >
        Day {day.dayNumber}: {day.title}
      </h2>

      {/* Scripture Reading */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#113E30" }}>
          Scripture Reading
        </h3>
        <blockquote
          className="rounded-lg px-5 py-4 italic leading-relaxed"
          style={{
            borderLeft: "4px solid #a6192e",
            backgroundColor: "rgba(166, 25, 46, 0.04)",
            color: "#404041",
          }}
        >
          {day.scriptureReading}
        </blockquote>
      </div>

      {/* Devotional Body */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#113E30" }}>
          Devotional
        </h3>
        <div className="prose prose-stone max-w-none leading-relaxed" style={{ color: "#404041" }}>
          {day.body.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Reflection Questions */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#113E30" }}>
          Reflection Questions
        </h3>
        <ol className="list-decimal list-inside space-y-3" style={{ color: "#404041" }}>
          {day.reflectionQuestions.map((question, i) => (
            <li key={i} className="leading-relaxed pl-1">
              {question}
            </li>
          ))}
        </ol>
      </div>

      {/* Prayer */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#113E30" }}>
          Prayer
        </h3>
        <div
          className="rounded-lg px-5 py-4 italic leading-relaxed"
          style={{
            borderLeft: "4px solid #113E30",
            backgroundColor: "rgba(17, 62, 48, 0.04)",
            color: "#404041",
          }}
        >
          {day.prayer}
        </div>
      </div>
    </div>
  );
}
