"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePublicProductsQuery } from "@/hooks/use-public-products-query";
import { useUserSession } from "@/providers/user-session-provider";
import { StoreProductCard } from "@/components/user/store-product-card";
import { OrderConfirmationModal } from "@/components/user/order-confirmation-modal";
import { Pagination } from "@/components/user/pagination";
import { SectionEmptyState, SectionErrorState } from "@/components/user/section-states";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProductType, PublicProductListItem, PublicProductsListParams } from "@/types/api";

const PAGE_SIZE = 12;
const SKELETON_COUNT = 6;

const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: "ticket", label: "이용권" },
  { value: "merchandise", label: "상품" },
];
const VALID_PRODUCT_TYPES = new Set<string>(PRODUCT_TYPE_OPTIONS.map((option) => option.value));

// Same defensive approach as the News page's parsePage/parseCategory: a
// manually-edited/shared URL can carry anything, and the public Products
// API 400s on an unsupported `productType` -- so only a positive integer
// page and one of the two confirmed types are ever forwarded.
function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function parseProductType(raw: string | null): ProductType | undefined {
  if (raw && VALID_PRODUCT_TYPES.has(raw)) return raw as ProductType;
  return undefined;
}

// docs/user/user-ui.md "Page 7 — Store List". Reuses the Phase 1
// usePublicProductsQuery/getPublicProducts infrastructure as-is (it already
// accepts productType) -- no parallel Store API was created. No keyword
// search field exists -- the public Products API rejects `keyword` with
// HTTP 400.
export function StorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading: isSessionLoading } = useUserSession();

  const page = parsePage(searchParams.get("page"));
  const productType = parseProductType(searchParams.get("productType"));

  const queryParams: PublicProductsListParams = useMemo(
    () => ({ page, limit: PAGE_SIZE, productType }),
    [page, productType],
  );

  const { data, isPending, isError, refetch } = usePublicProductsQuery(queryParams);

  const [selectedProduct, setSelectedProduct] = useState<PublicProductListItem | null>(null);

  // Mirrors the News page's URL-sync pattern (news-page-content.tsx's
  // updateParams): merge into the current URL search params and push, so
  // refresh/back-forward stay predictable.
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
    router.push(query ? `/store?${query}` : "/store");
  }

  // docs/user/user-ui.md "Authentication Boundary for Ordering": a
  // logged-out click never opens the modal or creates an order -- straight
  // to /login. No return-to-Store mechanism exists yet in Login, and
  // adding one is out of scope here.
  function handleOrder(product: PublicProductListItem) {
    if (isSessionLoading) return;
    if (!session) {
      router.push("/login");
      return;
    }
    setSelectedProduct(product);
  }

  const hasActiveFilters = Boolean(productType);
  const products = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isPending && !isError && products.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-page-title font-semibold text-text-primary">Store</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <ProductTypeChip
          label="전체"
          active={productType === undefined}
          onClick={() => updateParams({ productType: undefined })}
        />
        {PRODUCT_TYPE_OPTIONS.map((option) => (
          <ProductTypeChip
            key={option.value}
            label={option.label}
            active={productType === option.value}
            onClick={() => updateParams({ productType: option.value })}
          />
        ))}
      </div>

      <div className="mt-10">
        {isPending && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        )}

        {isError && <SectionErrorState message="상품을 불러오지 못했습니다." onRetry={() => refetch()} />}

        {isEmpty && (
          <SectionEmptyState
            message={hasActiveFilters ? "해당 유형의 상품이 없습니다." : "현재 등록된 상품이 없습니다."}
          />
        )}

        {!isPending && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <StoreProductCard key={product.productId} product={product} onOrder={handleOrder} />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          summary={`총 ${pagination.total}개의 상품`}
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}

      {selectedProduct && (
        <OrderConfirmationModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

function ProductTypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
