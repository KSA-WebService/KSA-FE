"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import { useProductsQuery } from "@/hooks/use-products-query";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import { DateTime } from "@/components/admin/date-time";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { AvailabilityBadge, PublicationBadge } from "@/components/products/product-badges";
import type { AvailabilityStatus, ProductsListParams, PublicationStatus } from "@/types/api";

const PAGE_SIZE = 20;

const PUBLICATION_OPTIONS: { value: PublicationStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "hidden", label: "Hidden" },
];

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";
  const publicationStatus = searchParams.get("publicationStatus") ?? "";
  const availabilityStatus = searchParams.get("availabilityStatus") ?? "";

  const queryParams: ProductsListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      publicationStatus: (publicationStatus as ProductsListParams["publicationStatus"]) || undefined,
      availabilityStatus: (availabilityStatus as ProductsListParams["availabilityStatus"]) || undefined,
    }),
    [page, keyword, publicationStatus, availabilityStatus],
  );

  const { data, isLoading, isError, refetch } = useProductsQuery(queryParams);

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
    router.push(`/admin/products?${nextSearchParams.toString()}`);
  }

  const hasActiveFilters = Boolean(keyword || publicationStatus || availabilityStatus);
  const products = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && products.length === 0;

  return (
    <div className="px-8 pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={keyword}
          onChange={(value) => updateParams({ keyword: value })}
          placeholder="Search by product name"
        />
        <FilterSelect
          label="Publication"
          value={publicationStatus}
          onChange={(value) => updateParams({ publicationStatus: value })}
          allLabel="All"
          options={PUBLICATION_OPTIONS}
        />
        <FilterSelect
          label="Availability"
          value={availabilityStatus}
          onChange={(value) => updateParams({ availabilityStatus: value })}
          allLabel="All"
          options={AVAILABILITY_OPTIONS}
        />
      </div>

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-surface border border-border bg-surface">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Product
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Token Price
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Stock
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Availability
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Publication
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
              products.map((product) => (
                <tr
                  key={product.productId}
                  className="border-t border-border transition-colors duration-150 hover:bg-surface-muted"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-muted">
                        {product.image ? (
                          <Image
                            src={product.image.fileUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-text-muted" />
                        )}
                      </div>
                      <span className="text-body text-text-primary">{product.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body text-text-primary">{product.tokenPrice} Tokens</td>
                  <td className="px-4 py-3 text-body text-text-primary">{product.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge status={product.availabilityStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <PublicationBadge status={product.publicationStatus} />
                  </td>
                  <td className="px-4 py-3 text-body text-text-secondary">
                    <DateTime value={product.updatedAt} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.productId}`} className={buttonVariants("secondary")}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {isEmpty && (
          <EmptyState
            message={hasActiveFilters ? "조건에 맞는 상품이 없습니다." : "등록된 상품이 없습니다."}
          />
        )}

        {isError && (
          <ErrorState
            message="상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            onRetry={() => refetch()}
          />
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="products"
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}
    </div>
  );
}
