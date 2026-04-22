import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// Self-hosted Montserrat via next/font — replaces the previous
// <link rel="stylesheet"> to fonts.googleapis.com so we ship zero
// font requests to Google at runtime and avoid the page-level perf
// penalty Next's lint rule flagged.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Sermon to Devotional",
  description:
    "Transform any sermon manuscript into a personal daily devotional series powered by AI.",
};

// iOS Safari and other mobile browsers render at a synthetic desktop width
// (~980px) and scale down unless told otherwise, which makes text unreadable
// on phones. Next 15+ no longer auto-injects this — has to be explicit.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold" style={{ color: "#113E30" }}>
              Sermon to Devotional
            </Link>
            <span className="text-sm" style={{ color: "#777779" }}>
              AI-Powered Daily Devotionals
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 bg-white mt-auto">
          <div className="mx-auto max-w-4xl px-6 py-4 text-center text-sm" style={{ color: "#777779" }}>
            Scripture quotations are from the ESV&reg; Bible. Devotional content is AI-generated.
          </div>
        </footer>
      </body>
    </html>
  );
}
