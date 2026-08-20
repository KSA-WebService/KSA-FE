"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPublicProducts } from "@/lib/api/public-products";
import type { PublicProductsListParams } from "@/types/api";

// Public endpoint -- no Supabase access token needed, unlike the admin
// posts/products query hooks this mirrors.
export function usePublicProductsQuery(params: PublicProductsListParams) {
  return useQuery({
    queryKey: ["public-products", "list", params],
    queryFn: () => getPublicProducts(params),
    placeholderData: keepPreviousData,
  });
}
