import Database from "better-sqlite3";
import path from "path";
import type { Devotional, DevotionalDay, DevotionalRow, VoiceStyle } from "./types";

// Store the database in a persistent data directory
// In Docker on NAS, this will be a mounted volume
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "devotionals.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable WAL mode for better concurrent read performance
    db.pragma("journal_mode = WAL");
    // Create the table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS devotionals (
        id TEXT PRIMARY KEY,
        sermon_title TEXT NOT NULL,
        voice TEXT NOT NULL,
        day_count INTEGER NOT NULL,
        days_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }
  return db;
}

// Save a newly generated devotional
export function saveDevotional(devotional: Devotional): void {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO devotionals (id, sermon_title, voice, day_count, days_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    devotional.id,
    devotional.sermonTitle,
    devotional.voice,
    devotional.dayCount,
    JSON.stringify(devotional.days),
    devotional.createdAt
  );
}

// Retrieve a devotional by ID
export function getDevotional(id: string): Devotional | null {
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM devotionals WHERE id = ?")
    .get(id) as DevotionalRow | undefined;

  if (!row) return null;

  return {
    id: row.id,
    sermonTitle: row.sermon_title,
    voice: row.voice as VoiceStyle,
    dayCount: row.day_count,
    days: JSON.parse(row.days_json) as DevotionalDay[],
    createdAt: row.created_at,
  };
}
