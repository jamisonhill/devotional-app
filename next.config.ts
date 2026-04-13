import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow external packages that use native bindings (better-sqlite3)
  serverExternalPackages: ["better-sqlite3", "pdf-parse", "mammoth", "cheerio", "@anthropic-ai/sdk"],
};

export default nextConfig;
