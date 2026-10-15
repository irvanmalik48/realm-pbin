import { redirect } from "next/navigation";
import { Suspense } from "react";

interface ShortSlugPageProps {
  params: Promise<{ slug: string }>;
}

async function ShortSlugRedirect({ params }: ShortSlugPageProps) {
  const { slug } = await params;
  redirect(`/p/${encodeURIComponent(slug)}`);
  return null;
}

export default function ShortSlugPage({ params }: ShortSlugPageProps) {
  return (
    <Suspense fallback={null}>
      <ShortSlugRedirect params={params} />
    </Suspense>
  );
}
