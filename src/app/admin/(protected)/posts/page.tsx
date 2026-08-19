import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { PostsPageContent } from "./posts-page-content";

export default function AdminPostsPage() {
  return (
    <>
      <PageHeader
        title="Posts"
        actions={
          <Link href="/admin/posts/new" className={buttonVariants("primary")}>
            New Post
          </Link>
        }
      />
      <Suspense fallback={null}>
        <PostsPageContent />
      </Suspense>
    </>
  );
}
