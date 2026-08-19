"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { createProduct, getProduct, updateProduct } from "@/lib/api/products";
import type { ProductCreatePayload, ProductUpdatePayload } from "@/types/api";

function detailKey(productId: string) {
  return ["products", "detail", productId] as const;
}

export function useProductDetailQuery(productId: string) {
  return useQuery({
    queryKey: detailKey(productId),
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getProduct(productId, accessToken);
    },
  });
}

// PATCH returns the full updated Product directly (confirmed in
// api-contract.md, unlike Posts' summary-only response) -- no separate
// refetch is required for the mutation itself, but the list still needs
// invalidating so Token Price/Stock/Publication/Availability stay in sync
// there too.
export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProductUpdatePayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return updateProduct(productId, payload, accessToken);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(detailKey(productId), updated);
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProductCreatePayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return createProduct(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}
