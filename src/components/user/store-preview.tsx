"use client";

import Image from "next/image";
import { usePublicProductsQuery } from "@/hooks/use-public-products-query";
import { ImagePlaceholder } from "@/components/user/image-placeholder";
import { SectionHeading } from "@/components/user/section-heading";
import { SectionEmptyState, SectionErrorState } from "@/components/user/section-states";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PublicProductListItem } from "@/types/api";

// Home "Store Section" (docs/user/product.md / user-ui.md): latest 3
// products from GET /products?page=1&limit=3, fetched and failing
// independently of the News preview above it. No product-detail navigation
// and no order action on Home -- both are out of scope for the preview.
export function StorePreview() {
  const { data, isPending, isError, refetch } = usePublicProductsQuery({ page: 1, limit: 3 });

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading title="Store" viewAllHref="/store" />

      {isPending && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {isError && <SectionErrorState message="상품을 불러오지 못했습니다." onRetry={() => refetch()} />}

      {!isPending && !isError && data && data.items.length === 0 && (
        <SectionEmptyState message="현재 등록된 상품이 없습니다." />
      )}

      {!isPending && !isError && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: PublicProductListItem }) {
  const isUnavailable = product.availabilityStatus === "unavailable";

  return (
    <div className={cn(isUnavailable && "opacity-70")}>
      {/* Store images may contain coupons/QR codes/text, so unlike News
          thumbnails they must never be cropped: object-contain on a 4:5
          area (same proportion as News, appropriate for portrait/poster
          product assets) preserves the full image and its aspect ratio,
          with a quiet neutral backdrop filling any resulting empty space.
          This is the intended Store image policy for the future /store
          page too, not just this Home preview. */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-surface bg-surface-muted">
        {product.image ? (
          <Image
            src={product.image.fileUrl}
            alt={product.productName}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>

      <h3 className="mt-4 text-body font-semibold text-text-primary">{product.productName}</h3>
      <p className="mt-1 text-body text-brand-800">🪙 {product.tokenPrice} Tokens</p>
      {isUnavailable && <p className="mt-1 text-meta text-text-muted">현재 주문 불가</p>}
    </div>
  );
}
