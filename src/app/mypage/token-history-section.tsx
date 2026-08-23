"use client";

import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  TRANSACTION_TYPE_LABELS,
  formatTokenDeltaAmount,
} from "@/lib/user/token-log-labels";
import { formatUserDateTime } from "@/lib/user/format-date";
import { Pagination } from "@/components/user/pagination";
import {
  SectionEmptyState,
  SectionErrorState,
} from "@/components/user/section-states";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MyTokenLogItem, MyTokenLogsResult } from "@/types/api";

const SKELETON_ROWS = 3;

interface TokenHistorySectionProps {
  query: UseQueryResult<MyTokenLogsResult, unknown>;
  onPageChange: (page: number) => void;
}

// docs/user/user-ui.md "Page 4 — My Page" "Token History Table". Read-only
// history -- historical balances (`balanceAfter`) are always the
// backend-provided value, never recalculated client-side. The active page
// number comes from `query`'s own server-confirmed `pagination.page`.
export function TokenHistorySection({
  query,
  onPageChange,
}: TokenHistorySectionProps) {
  const { data, isPending, isError, refetch } = query;
  const logs = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isPending && !isError && logs.length === 0;

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <SectionErrorState
        message="토큰 내역을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    );
  }

  if (isEmpty) {
    return <SectionEmptyState message="아직 토큰 내역이 없습니다." />;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-surface border border-border">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-surface-muted">
              <Th>일시</Th>
              <Th>구분</Th>
              <Th>내역</Th>
              <Th>변동</Th>
              <Th>사유</Th>
              <Th>잔액</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <TokenLogRow key={log.tokenLogId} log={log} />
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          summary={`총 ${pagination.total}건의 토큰 내역`}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
      {children}
    </th>
  );
}

// docs/user/api-contract.md "Display Derivation": tokenEvent takes
// precedence over order; both may be null only for `reset` transactions.
function describeTokenLog(log: MyTokenLogItem): string {
  if (log.tokenEvent) return log.tokenEvent.eventName;
  if (log.order) return log.order.productName;
  return "—";
}

function splitTransactionLabel(label: string): [string, string | null] {
  const firstSpaceIndex = label.indexOf(" ");

  if (firstSpaceIndex === -1) {
    return [label, null];
  }

  return [label.slice(0, firstSpaceIndex), label.slice(firstSpaceIndex + 1)];
}

function TokenLogRow({ log }: { log: MyTokenLogItem }) {
  const [transactionLabelFirstLine, transactionLabelSecondLine] =
    splitTransactionLabel(TRANSACTION_TYPE_LABELS[log.transactionType]);

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 text-meta text-text-secondary">
        {formatUserDateTime(log.createdAt)}
      </td>
      <td className="px-4 py-3 text-body text-text-primary">
        <span className="block whitespace-nowrap">
          {transactionLabelFirstLine}
        </span>
        {transactionLabelSecondLine && (
          <span className="block whitespace-nowrap">
            {transactionLabelSecondLine}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-body text-text-primary">
        {describeTokenLog(log)}
      </td>
      <td
        className={cn(
          "px-4 py-3 text-body font-medium",
          log.delta > 0
            ? "text-success"
            : log.delta < 0
              ? "text-destructive"
              : "text-text-secondary",
        )}
      >
        <span className="block whitespace-nowrap">
          {formatTokenDeltaAmount(log.delta)}
        </span>
        <span className="block whitespace-nowrap">Tokens</span>
      </td>
      <td className="px-4 py-3 text-meta text-text-secondary">
        {log.reason || "—"}
      </td>
      <td className="px-4 py-3 text-body text-text-primary">
        <span className="block whitespace-nowrap">{log.balanceAfter}</span>
        <span className="block whitespace-nowrap">Tokens</span>
      </td>
    </tr>
  );
}
