import type { Metadata } from "next";
import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { NewsDetailContent } from "./news-detail-content";

// Overrides the root layout's admin-console metadata, same as Home/News
// List. Per-post dynamic titles (generateMetadata) were deliberately not
// added -- the post itself is only fetched client-side (public data, no
// auth), and a separate server-side title fetch would duplicate that
// request for no functionality required by Phase 3.
export const metadata: Metadata = {
  title: "News — HKUST Korean Students Association",
};

// docs/user/user-ui.md "Page 6 — News Detail". Public -- authentication is
// not required, including for membersOnly posts.
export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-page-bg pt-16">
        <NewsDetailContent postId={postId} />
      </main>
      <SiteFooter />
    </>
  );
}
