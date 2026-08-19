"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { usePostsQuery } from "@/hooks/use-posts-query";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import { DateTime } from "@/components/admin/date-time";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { AccessBadge, CategoryBadge, PostStatusBadge } from "@/components/posts/post-badges";
import { POST_CATEGORY_OPTIONS } from "@/lib/post-form";
import type { PostStatus, PostsListParams } from "@/types/api";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

export function PostsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";

  const queryParams: PostsListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      category: (category as PostsListParams["category"]) || undefined,
      status: (status as PostsListParams["status"]) || undefined,
    }),
    [page, keyword, category, status],
  );

  const { data, isLoading, isError, refetch } = usePostsQuery(queryParams);

  function updateParams(next: Record<string, string | number | undefined>, resetPage = true) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") {
        nextSearchParams.delete(key);
      } else {
        nextSearchParams.set(key, String(value));
      }
    }
    if (resetPage) nextSearchParams.set("page", "1");
    router.push(`/admin/posts?${nextSearchParams.toString()}`);
  }

  const hasActiveFilters = Boolean(keyword || category || status);
  const posts = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && posts.length === 0;

  return (
    <div className="px-8 pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={keyword}
          onChange={(value) => updateParams({ keyword: value })}
          placeholder="Search by title"
        />
        <FilterSelect
          label="Category"
          value={category}
          onChange={(value) => updateParams({ category: value })}
          allLabel="All Categories"
          options={POST_CATEGORY_OPTIONS}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => updateParams({ status: value })}
          allLabel="All Statuses"
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-surface border border-border bg-surface">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Post
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Categories
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Access
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Status
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Author
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                Updated At
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="border-t border-border">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              !isError &&
              posts.map((post) => (
                <tr
                  key={post.postId}
                  className="border-t border-border transition-colors duration-150 hover:bg-surface-muted"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-muted">
                        {post.representativeImage ? (
                          <Image
                            src={post.representativeImage.fileUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-text-muted" />
                        )}
                      </div>
                      <span className="text-body text-text-primary">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {post.categories.map((cat) => (
                        <CategoryBadge key={cat} category={cat} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AccessBadge membersOnly={post.membersOnly} />
                  </td>
                  <td className="px-4 py-3">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-body text-text-secondary">{post.author.name}</td>
                  <td className="px-4 py-3 text-body text-text-secondary">
                    <DateTime value={post.updatedAt} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${post.postId}`} className={buttonVariants("secondary")}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {isEmpty && (
          <EmptyState
            message={hasActiveFilters ? "조건에 맞는 게시글이 없습니다." : "등록된 게시글이 없습니다."}
          />
        )}

        {isError && (
          <ErrorState
            message="게시글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            onRetry={() => refetch()}
          />
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="posts"
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}
    </div>
  );
}
