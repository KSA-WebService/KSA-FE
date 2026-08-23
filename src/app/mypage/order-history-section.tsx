"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ORDER_STATUS_LABELS } from "@/lib/user/order-status-labels";
import { formatUserDate, formatUserDateTime } from "@/lib/user/format-date";
import { Pagination } from "@/components/user/pagination";
import { CopyButton } from "@/components/user/copy-button";
import { SectionEmptyState, SectionErrorState } from "@/components/user/section-states";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ListResponse, MyOrderItem, OrderStatus } from "@/types/api";

const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  ordered: "info",
  accepted: "brand",
  delivered: "success",
  canceled: "destructive",
};

const SKELETON_ROWS = 3;

interface OrderHistorySectionProps {
  query: UseQueryResult<ListResponse<MyOrderItem>, unknown>;
  onPageChange: (page: number) => void;
}

// docs/user/user-ui.md "Page 4 — My Page" "Order History Table". Read-only
// -- no user-side status actions, no Order Detail route (row expansion is
// inline, on the same row, not a navigation affordance). The active page
// number is read from `query`'s own server-confirmed `pagination.page`,
// not passed in separately -- the URL is the source of the request, the
// response is the source of what's actually being displayed.
export function OrderHistorySection({ query, onPageChange }: OrderHistorySectionProps) {
  const { data, isPending, isError, refetch } = query;
  const orders = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isPending && !isError && orders.length === 0;

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
    return <SectionErrorState message="주문 내역을 불러오지 못했습니다." onRetry={() => refetch()} />;
  }

  if (isEmpty) {
    return <SectionEmptyState message="아직 주문 내역이 없습니다." />;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-surface border border-border">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-surface-muted">
              <Th>주문번호</Th>
              <Th>상품</Th>
              <Th>수량</Th>
              <Th>결제 토큰</Th>
              <Th>주문일</Th>
              <Th>상태</Th>
              <th className="w-10 px-2 py-3" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.orderId} order={order} />
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          summary={`총 ${pagination.total}건의 주문`}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">{children}</th>;
}

function OrderRow({ order }: { order: MyOrderItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-t border-border">
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-body text-text-secondary">{order.orderId.slice(0, 8)}…</span>
            <CopyButton value={order.orderId} label="주문번호 복사" />
          </div>
        </td>
        <td className="px-4 py-3 text-body text-text-primary">{order.product.productName}</td>
        <td className="px-4 py-3 text-body text-text-primary">{order.quantity}</td>
        <td className="px-4 py-3 text-body text-text-primary">{order.totalAmount} Tokens</td>
        <td className="px-4 py-3 text-meta text-text-secondary">{formatUserDate(order.orderedAt)}</td>
        <td className="px-4 py-3">
          <Badge tone={ORDER_STATUS_TONES[order.orderStatus]}>{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
        </td>
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-label="주문 상세 정보"
            className="flex h-6 w-6 items-center justify-center rounded-control text-text-muted transition-colors hover:text-text-primary"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-150", expanded && "rotate-180")} />
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="border-t border-border bg-surface-muted">
          <td colSpan={7} className="px-4 py-4">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-meta sm:grid-cols-2">
              <Detail label="단가" value={`${order.unitPrice} Tokens`} />
              <Detail label="주문 확인 일시" value={formatUserDateTime(order.acceptedAt)} />
              <Detail label="전달 완료 일시" value={formatUserDateTime(order.deliveredAt)} />
              <Detail label="취소 일시" value={formatUserDateTime(order.canceledAt)} />
              {order.cancellationReason && (
                <div className="sm:col-span-2">
                  <dt className="text-text-secondary">취소 사유</dt>
                  <dd className="mt-0.5 text-text-primary">{order.cancellationReason}</dd>
                </div>
              )}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 sm:block">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary sm:mt-0.5">{value}</dd>
    </div>
  );
}
