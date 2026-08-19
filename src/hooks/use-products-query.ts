"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getProducts } from "@/lib/api/products";
import type { ProductsListParams } from "@/types/api";

export function useProductsQuery(params: ProductsListParams) {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getProducts(params, accessToken);
    },
    placeholderData: keepPreviousData,
  });
}
