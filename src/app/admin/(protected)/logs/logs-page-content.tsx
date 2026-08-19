"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, toTitleCase } from "@/lib/utils";
import { useActionLogsQuery } from "@/hooks/use-action-logs-query";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import { DateTime } from "@/components/admin/date-time";
import { CopyButton } from "@/components/admin/copy-button";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import type { ActionLogsListParams } from "@/types/api";

const PAGE_SIZE = 20;

// Complete current AdminActionType enum.
const ACTION_TYPE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "whitelist", label: "Whitelist" },
  { value: "invitation", label: "Invitation" },
  { value: "content", label: "Content" },
  { value: "product", label: "Product" },
  { value: "order", label: "Order" },
  { value: "token", label: "Token" },
  { value: "file", label: "File" },
  { value: "memo", label: "Memo" },
];

const COLUMN_COUNT = 6;

export function LogsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const actionType = searchParams.get("actionType") ?? "";

  const queryParams: ActionLogsListParams = useMemo(
    () => ({ page, limit: PAGE_SIZE, actionType: actionType || undefined }),
    [page, actionType],
  );

  const { data, isLoading, isFetching, isError, refetch } = useActionLogsQuery(queryParams);

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
    router.push(`/admin/logs?${nextSearchParams.toString()}`);
  }

  const logs = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && logs.length === 0;

  return (
    <div className="px-8 pb-8">
      <div className="mb-4">
        <FilterSelect
          label="Type"
          value={actionType}
          onChange={(value) => updateParams({ actionType: value })}
          allLabel="All Types"
          options={ACTION_TYPE_OPTIONS}
        />
      </div>

      <div
        className={cn(
          "max-h-[calc(100vh-260px)] overflow-auto rounded-surface border border-border bg-surface transition-opacity duration-150",
          isFetching && !isLoading && "opacity-60",
        )}
      >
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                Date
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Admin
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Type
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Action
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Target
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
                  {Array.from({ length: COLUMN_COUNT }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              !isError &&
              logs.map((log) => (
                <tr
                  key={log.logId}
                  className="border-t border-border transition-colors duration-150 hover:bg-surface-muted"
                >
                  <td className="px-4 py-3 text-body text-text-secondary">
                    <DateTime value={log.createdAt} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-body text-text-primary">{log.admin.name}</div>
                    <div className="text-meta text-text-secondary">{log.admin.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{toTitleCase(log.actionType)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-body text-text-primary">{toTitleCase(log.action)}</td>
                  <td className="px-4 py-3">
                    {log.targetId ? (
                      <div className="flex items-center gap-1 text-meta text-text-secondary">
                        {log.targetId.slice(0, 8)}…
                        <CopyButton value={log.targetId} label="Copy target ID" />
                      </div>
                    ) : (
                      <span className="text-body text-text-secondary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/logs/${log.logId}`} className={buttonVariants("secondary")}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {isEmpty && (
          <EmptyState
            message={
              actionType ? "선택한 유형의 작업 기록이 없습니다." : "관리자 작업 기록이 없습니다."
            }
          />
        )}

        {isError && (
          <ErrorState
            message="작업 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            onRetry={() => refetch()}
          />
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="log entries"
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}
    </div>
  );
}
