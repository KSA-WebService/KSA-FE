import { Suspense } from "react";
import { TokenEventDetailContent } from "./token-event-detail-content";

// Suspense: TokenEventDetailContent reads useSearchParams (URL is the
// source of truth for page/keyword/grantStatus), which Next.js requires a
// boundary for.
export default async function AdminTokenEventDetailPage({
  params,
}: {
  params: Promise<{ tokenEventId: string }>;
}) {
  const { tokenEventId } = await params;

  return (
    <Suspense fallback={null}>
      <TokenEventDetailContent tokenEventId={tokenEventId} />
    </Suspense>
  );
}
