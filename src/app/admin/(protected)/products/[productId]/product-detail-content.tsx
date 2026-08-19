"use client";

import { useProductDetailQuery } from "@/hooks/use-product-detail-query";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetailLoaded } from "./product-detail-loaded";
import { GENERIC_PRODUCT_LOAD_ERROR } from "@/lib/product-errors";

export function ProductDetailContent({ productId }: { productId: string }) {
  const { data: detail, isLoading, isError, refetch } = useProductDetailQuery(productId);

  if (isLoading) {
    return (
      <div className="px-8 pt-8 pb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-9 w-80" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="px-8 pt-8 pb-8">
        <ErrorState message={GENERIC_PRODUCT_LOAD_ERROR} onRetry={() => refetch()} />
      </div>
    );
  }

  return <ProductDetailLoaded key={detail.updatedAt} productId={productId} detail={detail} />;
}
