"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePublicPostsQuery } from "@/hooks/use-public-posts-query";
import { NEWS_CATEGORY_LABELS } from "@/lib/user/category-labels";
import { NewsCard } from "@/components/user/news-card";
import { SearchInput } from "@/components/user/search-input";
import { Pagination } from "@/components/user/pagination";
import { SectionEmptyState, SectionErrorState } from "@/components/user/section-states";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PostCategory, PostPeriod, PublicPostsListParams } from "@/types/api";

const PAGE_SIZE = 12;
const SKELETON_COUNT = 6;

// Object key order matches insertion order for string keys, and
// NEWS_CATEGORY_LABELS is declared in exactly the order docs/user/user-ui.md
// lists the category chips in (행사, 공지, 커리어, 제휴, 공동구매, Alumni) --
// reusing it here avoids a second, easily-drifting hardcoded category list.
const CATEGORY_OPTIONS = Object.keys(NEWS_CATEGORY_LABELS) as PostCategory[];
const VALID_CATEGORIES = new Set<string>(CATEGORY_OPTIONS);

const PERIOD_LABELS: Record<PostPeriod, string> = {
  upcoming: "예정",
  past: "지난 일정",
  undated: "일정 없음",
};
const PERIOD_OPTIONS: PostPeriod[] = ["upcoming", "past", "undated"];
const VALID_PERIODS = new Set<string>(PERIOD_OPTIONS);
// Radix Select can't take an empty-string item value, so "전체" (no
// `period` param, per the backend contract) is represented internally by
// this sentinel and translated back to `undefined` for the caller --
// same technique as the admin console's FilterSelect.
const PERIOD_ALL_VALUE = "all";

// A manually-edited/shared URL can carry anything in `page`/`category`/
// `period` -- this is the only thing standing between that and an
// unsupported/invalid value reaching the backend (which would 400 on a bad
// category/period, or send a nonsensical page). Only a positive integer
// page is accepted; anything else (missing, 0, negative, fractional,
// non-numeric) falls back to 1.
function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

// Only one of the 6 confirmed categories is accepted; anything else
// (missing, typo'd, invented) behaves as "전체" (no `category` param sent).
function parseCategory(raw: string | null): PostCategory | undefined {
  if (raw && VALID_CATEGORIES.has(raw)) return raw as PostCategory;
  return undefined;
}

// Same defensive approach as parseCategory: only "upcoming"/"past"/
// "undated" are accepted; anything else behaves as "전체" (no `period`
// param sent) rather than being forwarded to the backend.
function parsePeriod(raw: string | null): PostPeriod | undefined {
  if (raw && VALID_PERIODS.has(raw)) return raw as PostPeriod;
  return undefined;
}

// docs/user/user-ui.md "Page 5 — News List". Reuses the Phase 1
// usePublicPostsQuery/getPublicPosts infrastructure as-is (it already
// accepts keyword/category, and now period/sort) -- no parallel News API
// was created.
export function NewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // `updateParams` below reads directly from `searchParams`/URLSearchParams
  // when merging, so an already-invalid value sitting in the URL is never
  // rewritten just because it's invalid -- only these sanitized values
  // (used for the query, the chip row, and the period select's active
  // state) are affected.
  const page = parsePage(searchParams.get("page"));
  const keyword = searchParams.get("keyword") ?? "";
  const category = parseCategory(searchParams.get("category"));
  const period = parsePeriod(searchParams.get("period"));

  const queryParams: PublicPostsListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      category,
      period,
      // Newest-published-first is a confirmed product decision, not left
      // to the backend's default -- no user-facing sort control exists,
      // and backend ordering is otherwise authoritative (no client-side
      // re-sorting of the paginated result).
      sort: "latest",
    }),
    [page, keyword, category, period],
  );

  const { data, isPending, isError, refetch } = usePublicPostsQuery(queryParams);

  // Mirrors the admin console's list-page URL-sync pattern
  // (posts-page-content.tsx's updateParams): merge into the current URL
  // search params and push, so refresh/back-forward stay predictable.
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
    const query = nextSearchParams.toString();
    router.push(query ? `/news?${query}` : "/news");
  }

  const hasActiveFilters = Boolean(keyword || category || period);
  const posts = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isPending && !isError && posts.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-page-title font-semibold text-text-primary">News</h1>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={keyword}
            onChange={(value) => updateParams({ keyword: value })}
            placeholder="소식 검색"
          />

          <div className="flex items-center gap-2">
            <span className="text-meta font-medium text-text-secondary">일정</span>
            <Select
              value={period ?? PERIOD_ALL_VALUE}
              onValueChange={(next) => updateParams({ period: next === PERIOD_ALL_VALUE ? undefined : next })}
            >
              <SelectTrigger aria-label="일정" className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PERIOD_ALL_VALUE}>전체</SelectItem>
                {PERIOD_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PERIOD_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="전체"
            active={category === undefined}
            onClick={() => updateParams({ category: undefined })}
          />
          {CATEGORY_OPTIONS.map((value) => (
            <CategoryChip
              key={value}
              label={NEWS_CATEGORY_LABELS[value]}
              active={category === value}
              onClick={() => updateParams({ category: value })}
            />
          ))}
        </div>
      </div>

      <div className="mt-10">
        {isPending && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <SectionErrorState message="소식을 불러오지 못했습니다." onRetry={() => refetch()} />
        )}

        {isEmpty && (
          <SectionEmptyState
            message={hasActiveFilters ? "조건에 맞는 소식이 없습니다." : "아직 등록된 소식이 없습니다."}
          />
        )}

        {!isPending && !isError && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <NewsCard key={post.postId} post={post} />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          summary={`총 ${pagination.total}개의 소식`}
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-meta font-medium transition-colors",
        active ? "bg-brand-800 text-white" : "bg-surface-muted text-text-secondary hover:bg-brand-100/60",
      )}
    >
      {label}
    </button>
  );
}
