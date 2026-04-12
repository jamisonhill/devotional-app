// Types for the devotional generation app

export interface DevotionalDay {
  dayNumber: number;
  title: string;
  scriptureReading: string; // ESV scripture text with references
  body: string; // The devotional content (~500-700 words)
  reflectionQuestions: string[]; // 2-3 questions
  prayer: string;
}

export interface Devotional {
  id: string;
  sermonTitle: string;
  voice: VoiceStyle;
  dayCount: number;
  days: DevotionalDay[];
  createdAt: string; // ISO date string
}

// Row shape from SQLite (days stored as JSON string)
export interface DevotionalRow {
  id: string;
  sermon_title: string;
  voice: string;
  day_count: number;
  days_json: string;
  created_at: string;
}

export type VoiceStyle =
  | "john-piper"
  | "cs-lewis"
  | "tim-keller"
  | "mark-driscoll"
  | "jd-greear"
  | "neutral";

export const VOICE_LABELS: Record<VoiceStyle, string> = {
  "john-piper": "John Piper",
  "cs-lewis": "C.S. Lewis",
  "tim-keller": "Tim Keller",
  "mark-driscoll": "Mark Driscoll",
  "jd-greear": "J.D. Greear",
  neutral: "Neutral / Generic",
};

export type InputMode = "url" | "paste" | "upload";
