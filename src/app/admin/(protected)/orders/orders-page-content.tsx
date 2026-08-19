"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOrdersQuery } from "@/hooks/use-orders-query";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderRow } from "./order-row";
import type { OrderStatus, OrdersListParams } from "@/types/api";

const PAGE_SIZE = 20;

const STATUS_TABS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "ordered", label: "Ordered" },
  { value: "accepted", label: "Accepted" },
  { value: "delivered", label: "Delivered" },
  { value: "canceled", label: "Canceled" },
];

const COLUMN_COUNT = 7;

export function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";
  const orderStatus = searchParams.get("orderStatus") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const queryParams: OrdersListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      orderStatus: (orderStatus as OrdersListParams["orderStatus"]) || undefined,
      sort: sort === "oldest" ? "oldest" : undefined,
    }),
    [page, keyword, orderStatus, sort],
  );

  const { data, isLoading, isFetching, isError, refetch } = useOrdersQuery(queryParams);

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
    router.push(`/admin/orders?${nextSearchParams.toString()}`);
  }

  const hasActiveFilters = Boolean(keyword || orderStatus);
  const orders = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && orders.length === 0;

  return (
    <div className="px-8 pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ orderStatus: tab.value })}
            className={cn(
              "rounded-t-control border-b-2 px-3 py-2 text-button font-semibold transition-colors duration-150",
              orderStatus === tab.value
                ? "border-brand-800 text-brand-800"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={keyword}
          onChange={(value) => updateParams({ keyword: value })}
          placeholder="Search by order ID, product, customer, Student ID, or email"
        />
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={(value) => updateParams({ sort: value }, false)}
          allLabel="Newest"
          options={[{ value: "oldest", label: "Oldest" }]}
        />
      </div>

      <div
        className={cn(
          "max-h-[calc(100vh-320px)] overflow-auto rounded-surface border border-border bg-surface transition-opacity duration-150",
          isFetching && !isLoading && "opacity-60",
        )}
      >
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr>
              <th scope="col" className="border-b border-border px-2 py-3" />
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Order
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Customer
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Amount
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Status
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                Ordered At
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

            {!isLoading && !isError && orders.map((order) => <OrderRow key={order.orderId} order={order} />)}
          </tbody>
        </table>

        {isEmpty && (
          <EmptyState
            message={hasActiveFilters ? "조건에 맞는 주문이 없습니다." : "주문 내역이 없습니다."}
          />
        )}

        {isError && (
          <ErrorState
            message="주문 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            onRetry={() => refetch()}
          />
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="orders"
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}
    </div>
  );
}
