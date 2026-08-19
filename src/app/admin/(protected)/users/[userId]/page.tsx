import { UserDetailContent } from "./user-detail-content";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <UserDetailContent userId={userId} />;
}
