"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TurnstileWidget from "./TurnstileWidget";
import type { InputMode, VoiceStyle } from "../lib/types";
import { VOICE_LABELS } from "../lib/types";

const ACCEPTED_FILE_TYPES = ".pdf,.txt,.doc,.docx,.html,.htm";

export default function InputForm() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [voice, setVoice] = useState<VoiceStyle>("john-piper");
  const [dayCount, setDayCount] = useState<number>(7);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs: { mode: InputMode; label: string }[] = [
    { mode: "url", label: "Paste URL" },
    { mode: "paste", label: "Paste Text" },
    { mode: "upload", label: "Upload File" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("inputMode", inputMode);
      formData.append("voice", voice);
      formData.append("dayCount", String(dayCount));
      formData.append("turnstileToken", turnstileToken);

      if (inputMode === "url") {
        if (!url.trim()) throw new Error("Please enter a URL");
        formData.append("url", url.trim());
      } else if (inputMode === "paste") {
        if (!pastedText.trim()) throw new Error("Please paste sermon text");
        formData.append("text", pastedText.trim());
      } else if (inputMode === "upload") {
        if (!file) throw new Error("Please select a file");
        formData.append("file", file);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      // Read response body as text first, then try to parse as JSON
      const responseText = await response.text();
      let data: { id?: string; error?: string };
      try {
        data = JSON.parse(responseText);
      } catch {
        // Server returned non-JSON (e.g. HTML error page)
        throw new Error(`Server error (${response.status}): ${responseText.slice(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Generation failed (${response.status})`);
      }

      router.push(`/devotional/${data.id}`);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Input Mode Tabs */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: "#113E30" }}>
          Sermon Source
        </label>
        <div className="flex rounded-lg border border-stone-300 overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              onClick={() => setInputMode(tab.mode)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                inputMode === tab.mode
                  ? "text-white"
                  : "bg-white text-stone-600 hover:bg-stone-50"
              }`}
              style={inputMode === tab.mode ? { backgroundColor: "#113E30" } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area — changes based on selected tab */}
      <div>
        {inputMode === "url" && (
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.desiringgod.org/messages/..."
            className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#113E30" } as React.CSSProperties}
          />
        )}
        {inputMode === "paste" && (
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the full sermon manuscript here..."
            rows={8}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-y"
            style={{ "--tw-ring-color": "#113E30" } as React.CSSProperties}
          />
        )}
        {inputMode === "upload" && (
          <div className="rounded-lg border-2 border-dashed border-stone-300 p-6 text-center">
            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block mx-auto text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer"
              style={{ "--file-bg": "#113E30" } as React.CSSProperties}
            />
            <p className="mt-2 text-xs text-stone-500">
              Accepts PDF, TXT, DOC, DOCX, and HTML files
            </p>
            {file && (
              <p className="mt-2 text-sm font-medium" style={{ color: "#113E30" }}>
                Selected: {file.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Voice and Day Count selectors side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#113E30" }}>
            Voice / Style
          </label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as VoiceStyle)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#113E30" } as React.CSSProperties}
          >
            {Object.entries(VOICE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#113E30" }}>
            Devotional Length
          </label>
          <div className="flex rounded-lg border border-stone-300 overflow-hidden">
            {[3, 5, 7].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setDayCount(count)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  dayCount === count
                    ? "text-white"
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}
                style={dayCount === count ? { backgroundColor: "#113E30" } : {}}
              >
                {count} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Turnstile bot protection */}
      <div className="flex justify-center">
        <TurnstileWidget onVerify={setTurnstileToken} />
      </div>

      {/* Error message */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: "rgba(166, 25, 46, 0.08)", color: "#a6192e" }}
        >
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg px-6 py-3.5 text-white font-semibold text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#a6192e" }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating Devotional...
          </span>
        ) : (
          "Generate Devotional"
        )}
      </button>
    </form>
  );
}
