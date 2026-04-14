// Per-IP rate limiting backed by the existing SQLite database.
// Shares the same DB file as devotionals so we get one mount point to
// back up and no extra infra. See src/lib/db.ts for the path logic.

import Database from "better-sqlite3";
import path from "path";
import type { NextRequest } from "next/server";

// Default quota: 10 generations per IP per rolling 24h window.
// Each generation costs real Anthropic tokens, so this is the primary
// abuse control once Turnstile is bypassable (headless browsers, etc.).
const DEFAULT_LIMIT_PER_DAY = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000;

const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "data", "devotionals.db");

let rateDb: Database.Database | null = null;

function getDb(): Database.Database {
  if (!rateDb) {
    rateDb = new Database(DB_PATH);
    rateDb.pragma("journal_mode = WAL");
    // One row per generate attempt. Events older than WINDOW_MS are pruned
    // lazily on each check, so the table stays small without a cron job.
    rateDb.exec(`
      CREATE TABLE IF NOT EXISTS rate_limit_events (
        ip TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_created
        ON rate_limit_events (ip, created_at);
    `);
  }
  return rateDb;
}

// Extract the client IP, preferring Cloudflare's trusted header since the
// app sits behind a Cloudflare tunnel. Falls back to x-forwarded-for
// (first hop) and x-real-ip for local dev / non-Cloudflare paths.
export function getClientIp(request: NextRequest): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // xff can be "client, proxy1, proxy2" — the leftmost is the original client.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();

  return "unknown";
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number; limit: number };

// Check whether this IP is under quota AND, if so, record a new event.
// We do both in one call so it's atomic from the route's perspective —
// check + consume together, no TOCTOU gap.
export function checkAndRecord(
  ip: string,
  limit: number = limitFromEnv()
): RateLimitResult {
  const db = getDb();
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const tx = db.transaction((clientIp: string) => {
    // Prune stale events for this IP so the count reflects only the current window.
    db.prepare(
      "DELETE FROM rate_limit_events WHERE ip = ? AND created_at < ?"
    ).run(clientIp, windowStart);

    const row = db
      .prepare(
        "SELECT COUNT(*) AS count, MIN(created_at) AS oldest FROM rate_limit_events WHERE ip = ?"
      )
      .get(clientIp) as { count: number; oldest: number | null };

    if (row.count >= limit) {
      // retry-after = time until the oldest event in the window expires.
      const oldest = row.oldest ?? now;
      const retryAfterMs = Math.max(1000, oldest + WINDOW_MS - now);
      return {
        allowed: false as const,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        limit,
      };
    }

    db.prepare(
      "INSERT INTO rate_limit_events (ip, created_at) VALUES (?, ?)"
    ).run(clientIp, now);

    return {
      allowed: true as const,
      remaining: limit - row.count - 1,
    };
  });

  return tx(ip);
}

function limitFromEnv(): number {
  const raw = process.env.RATE_LIMIT_PER_DAY;
  if (!raw) return DEFAULT_LIMIT_PER_DAY;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT_PER_DAY;
}
