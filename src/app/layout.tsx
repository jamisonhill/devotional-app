import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sermon to Devotional",
  description:
    "Transform any sermon manuscript into a personal daily devotional series powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold" style={{ color: "#113E30" }}>
              Sermon to Devotional
            </a>
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
