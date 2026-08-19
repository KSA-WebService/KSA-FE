import { PostDetailContent } from "./post-detail-content";

export default async function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return <PostDetailContent postId={postId} />;
}
