import { notFound } from "next/navigation";
import { getDevotional } from "../../../lib/db";
import DevotionalViewer from "../../../components/DevotionalViewer";

export default async function DevotionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const devotional = getDevotional(id);

  if (!devotional) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <DevotionalViewer devotional={devotional} />
    </div>
  );
}
