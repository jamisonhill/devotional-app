import InputForm from "../components/InputForm";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-3" style={{ color: "#113E30" }}>
          Transform Any Sermon Into a Daily Devotional
        </h1>
        <p className="text-base" style={{ color: "#777779" }}>
          Paste a link, upload a manuscript, or paste text from any sermon.
          Choose a voice and length, and we&apos;ll generate a personal
          devotional series you can read, download, or subscribe to via RSS.
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <InputForm />
      </div>
    </div>
  );
}
