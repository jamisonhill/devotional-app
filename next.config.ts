import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Native-binding or big-binary packages we want kept out of the server
  // bundle. pdfjs-dist is listed explicitly because pdf-parse pulls it in
  // and it loads its worker via dynamic import at runtime.
  serverExternalPackages: [
    "better-sqlite3",
    "pdf-parse",
    "pdfjs-dist",
    "mammoth",
    "cheerio",
    "@anthropic-ai/sdk",
  ],
  // The standalone build's file tracer misses pdfjs-dist's worker because
  // it's loaded via dynamic import from inside pdf-parse at runtime. Force
  // the legacy build directory (where pdf.worker.mjs lives) to be copied
  // for the /api/generate route.
  outputFileTracingIncludes: {
    "/api/generate": ["./node_modules/pdfjs-dist/legacy/build/**/*"],
  },
};

export default nextConfig;
