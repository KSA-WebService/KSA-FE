import { LogDetailContent } from "./log-detail-content";

export default async function AdminLogDetailPage({
  params,
}: {
  params: Promise<{ logId: string }>;
}) {
  const { logId } = await params;

  return <LogDetailContent logId={logId} />;
}
