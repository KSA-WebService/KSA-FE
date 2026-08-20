"use client";

import Image from "next/image";
import Link from "next/link";
import { usePublicPostsQuery } from "@/hooks/use-public-posts-query";
import { NEWS_CATEGORY_LABELS } from "@/lib/user/category-labels";
import { formatUserDate } from "@/lib/user/format-date";
import { ImagePlaceholder } from "@/components/user/image-placeholder";
import { SectionHeading } from "@/components/user/section-heading";
import { SectionEmptyState, SectionErrorState } from "@/components/user/section-states";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicPostListItem } from "@/types/api";

// Home "News Section" (docs/user/product.md / user-ui.md): latest 3
// published posts from GET /posts?page=1&limit=3, fetched and failing
// independently of the Store preview below it.
export function NewsPreview() {
  const { data, isPending, isError, refetch } = usePublicPostsQuery({ page: 1, limit: 3 });

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

function NewsCard({ post }: { post: PublicPostListItem }) {
  const date = post.eventStartAt ?? post.publishedAt;

  return (
    <Link href={`/news/${post.postId}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-surface">
        {post.representativeImage ? (
          <Image
            src={post.representativeImage.fileUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {post.categories.slice(0, 2).map((category) => (
          <Badge key={category} tone="neutral">
            {NEWS_CATEGORY_LABELS[category]}
          </Badge>
        ))}
        {post.membersOnly && <Badge tone="brand">Members Only</Badge>}
      </div>

      <h3 className="mt-2 line-clamp-2 text-body font-semibold text-text-primary transition-colors group-hover:text-brand-800">
        {post.title}
      </h3>
      <p className="mt-1 text-meta text-text-secondary">{formatUserDate(date)}</p>
    </Link>
  );
}
