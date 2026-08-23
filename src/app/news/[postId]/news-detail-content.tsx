"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePublicPostQuery } from "@/hooks/use-public-post-query";
import { ApiRequestError } from "@/lib/api/client";
import { NEWS_CATEGORY_LABELS } from "@/lib/user/category-labels";
import { formatUserDate, formatUserDateTime } from "@/lib/user/format-date";
import { linkifyText } from "@/lib/user/linkify";
import { SectionErrorState } from "@/components/user/section-states";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import type { PublicPostDetail } from "@/types/api";

// docs/user/user-ui.md "Page 6 — News Detail". Content area only -- Header
// and Footer are rendered unconditionally by page.tsx so they stay visible
// through every state (loading/error/not-found/success).
export function NewsDetailContent({ postId }: { postId: string }) {
  const { data: post, isPending, isError, error, refetch } = usePublicPostQuery(postId);

  const isNotFound = error instanceof ApiRequestError && error.status === 404;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-body text-text-secondary transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News
      </Link>

      {isPending && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 aspect-[4/3] w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {isError && !isNotFound && (
        <div className="mt-8">
          <SectionErrorState message="소식을 불러오지 못했습니다." onRetry={() => refetch()} />
        </div>
      )}

      {isError && isNotFound && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-surface border border-dashed border-border py-16 text-center">
          <p className="text-body text-text-secondary">존재하지 않는 소식입니다.</p>
          <Link href="/news" className={buttonVariants("secondary")}>
            News 목록으로 돌아가기
          </Link>
        </div>
      )}

      {!isPending && !isError && post && <PostArticle post={post} />}
    </div>
  );
}

function PostArticle({ post }: { post: PublicPostDetail }) {
  // Detail shows all categories (unlike the compact card's 2-badge cap --
  // docs/user/user-ui.md: "the entire max-2 restriction applies to compact
  // cards, not the detail article").
  const sortedImages = useMemo(
    () => [...post.images].sort((a, b) => a.sortOrder - b.sortOrder),
    [post.images],
  );

  return (
    <article className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        {post.categories.map((category) => (
          <Badge key={category} tone="neutral">
            {NEWS_CATEGORY_LABELS[category]}
          </Badge>
        ))}
        {post.membersOnly && <Badge tone="brand">Members Only</Badge>}
      </div>

      <h1 className="mt-4 text-page-title font-semibold text-text-primary">{post.title}</h1>
      <p className="mt-2 text-meta text-text-secondary">{formatUserDate(post.publishedAt)}</p>

      {post.eventStartAt && (
        <div className="mt-6 rounded-control bg-surface-muted px-4 py-3 text-body text-text-primary">
          <p>행사 시작: {formatUserDateTime(post.eventStartAt)}</p>
          {post.eventEndAt && <p className="mt-1">행사 종료: {formatUserDateTime(post.eventEndAt)}</p>}
        </div>
      )}

      {sortedImages.length > 0 && (
        <div className="mt-8 space-y-6">
          {sortedImages.map((image) => (
            // The API doesn't return width/height, so the real aspect ratio
            // is unknown ahead of time. This content must never be cropped
            // or stretched (docs/user/user-ui.md "Image Gallery": full
            // image, preserved aspect ratio, readable poster text/QR
            // codes) -- a plain <img> sized only by w-full/h-auto renders
            // at its true aspect ratio and full source resolution, which
            // next/image can't do without either a hard-coded (possibly
            // wrong) ratio or pre-known dimensions.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.fileId} src={image.fileUrl} alt="" className="h-auto w-full rounded-surface" />
          ))}
        </div>
      )}

      {/* content is plain text (docs/user/api-contract.md "Content Rendering
          Contract") -- never dangerouslySetInnerHTML. whitespace-pre-wrap
          preserves authored line breaks/paragraph spacing; linkifyText only
          turns explicit http(s) URLs into real <a> nodes.
          `content` is confirmed nullable (a published post can legitimately
          have no body) -- the section is omitted entirely rather than
          rendering nothing/"null"/a placeholder, and linkifyText is only
          ever called once this guard has confirmed a real, non-empty
          string. Everything else on the page (categories, Members Only,
          title, date, event info, images) renders regardless. */}
      {post.content && (
        <div className="mt-8 whitespace-pre-wrap text-body text-text-primary">
          {linkifyText(post.content)}
        </div>
      )}
    </article>
  );
}
