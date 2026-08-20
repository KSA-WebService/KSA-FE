"use client";

import { usePublicPostsQuery } from "@/hooks/use-public-posts-query";
import { NewsCard } from "@/components/user/news-card";
import { SectionHeading } from "@/components/user/section-heading";
import { SectionEmptyState, SectionErrorState } from "@/components/user/section-states";
import { Skeleton } from "@/components/ui/skeleton";

// Home "News Section" (docs/user/product.md / user-ui.md): latest 3
// published posts from GET /posts?page=1&limit=3&sort=latest, fetched and
// failing independently of the Store preview below it. `sort=latest` is
// explicit rather than relied on as a default -- newest-published-first is
// a confirmed product decision, not just whatever the backend happens to
// default to.
export function NewsPreview() {
  const { data, isPending, isError, refetch } = usePublicPostsQuery({ page: 1, limit: 3, sort: "latest" });

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading title="News" viewAllHref="/news" />

      {isPending && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {isError && <SectionErrorState message="소식을 불러오지 못했습니다." onRetry={() => refetch()} />}

      {!isPending && !isError && data && data.items.length === 0 && (
        <SectionEmptyState message="아직 등록된 소식이 없습니다." />
      )}

      {!isPending && !isError && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((post) => (
            <NewsCard key={post.postId} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
