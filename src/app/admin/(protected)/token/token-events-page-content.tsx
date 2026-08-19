"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTokenEventsQuery } from "@/hooks/use-token-events-query";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { Pagination } from "@/components/admin/pagination";
import { DateTime } from "@/components/admin/date-time";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { NewTokenEventDialog } from "./new-token-event-dialog";
import { ResetTokensDialog } from "./reset-tokens-dialog";
import type { TokenEventsListParams } from "@/types/api";

const PAGE_SIZE = 20;

export function TokenEventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";

  const queryParams: TokenEventsListParams = useMemo(
    () => ({ page, limit: PAGE_SIZE, keyword: keyword || undefined }),
    [page, keyword],
  );

  const { data, isLoading, isError, refetch } = useTokenEventsQuery(queryParams);

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
    router.push(`/admin/token?${nextSearchParams.toString()}`);
  }

  const events = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && events.length === 0;

  return (
    <>
      {/* Reset Student Tokens is visually secondary/destructive and
          separated from New Token Event, the primary action -- per
          docs/admin/admin-ui.md §10 it must never carry the same emphasis
          as routine event creation. */}
      <PageHeader
        title="Token Events"
        actions={
          <>
            <Button variant="destructive" onClick={() => setIsResetOpen(true)}>
              Reset Student Tokens
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>New Token Event</Button>
          </>
        }
      />

      <div className="px-8 pb-8">
        <div className="mb-4">
          <SearchInput
            value={keyword}
            onChange={(value) => updateParams({ keyword: value })}
            placeholder="Search by event name"
          />
        </div>

        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-surface border border-border bg-surface">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-surface-muted">
              <tr>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Event Name
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Granted Members
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                  Last Grant At
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Created By
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                  Created At
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
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                !isError &&
                events.map((event) => (
                  <tr
                    key={event.tokenEventId}
                    className="border-t border-border transition-colors duration-150 hover:bg-surface-muted"
                  >
                    <td className="px-4 py-3 text-body text-text-primary">{event.eventName}</td>
                    <td className="px-4 py-3 text-body text-text-primary">{event.grantedMemberCount}</td>
                    <td className="px-4 py-3 text-body text-text-secondary">
                      <DateTime value={event.lastGrantUpdatedAt} />
                    </td>
                    <td className="px-4 py-3 text-body text-text-secondary">{event.createdBy.name}</td>
                    <td className="px-4 py-3 text-body text-text-secondary">
                      <DateTime value={event.createdAt} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/token/${event.tokenEventId}`} className={buttonVariants("secondary")}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {isEmpty && (
            <EmptyState
              message={keyword ? "조건에 맞는 토큰 이벤트가 없습니다." : "등록된 토큰 이벤트가 없습니다."}
            />
          )}

          {isError && (
            <ErrorState
              message="토큰 이벤트 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
              onRetry={() => refetch()}
            />
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemLabel="token events"
            onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
          />
        )}
      </div>

      <NewTokenEventDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <ResetTokensDialog open={isResetOpen} onOpenChange={setIsResetOpen} />
    </>
  );
}
