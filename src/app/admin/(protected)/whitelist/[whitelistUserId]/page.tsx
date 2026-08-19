import { WhitelistDetailContent } from "./whitelist-detail-content";

export default async function AdminWhitelistDetailPage({
  params,
}: {
  params: Promise<{ whitelistUserId: string }>;
}) {
  const { whitelistUserId } = await params;

  return <WhitelistDetailContent whitelistUserId={whitelistUserId} />;
}
