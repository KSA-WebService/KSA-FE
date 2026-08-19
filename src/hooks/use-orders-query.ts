"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getOrders, updateOrderStatus } from "@/lib/api/orders";
import type { OrdersListParams, UpdateOrderStatusPayload } from "@/types/api";

const ORDERS_LIST_KEY = ["orders", "list"] as const;

export function useOrdersQuery(params: OrdersListParams) {
  return useQuery({
    queryKey: [...ORDERS_LIST_KEY, params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getOrders(params, accessToken);
    },
    placeholderData: keepPreviousData,
  });
}

// One instance per row (called from OrderRow) so each order's pending
// state is independent -- docs/admin/admin-ui.md §16 "Per-Row Pending
// State": "do not disable the entire table for one order mutation."
export function useUpdateOrderStatusMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateOrderStatusPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return updateOrderStatus(orderId, payload, accessToken);
    },
    onSuccess: () => {
      // Refetch using the currently active filters -- an order may no
      // longer belong in the active status tab after this mutation.
      queryClient.invalidateQueries({ queryKey: ORDERS_LIST_KEY });
    },
  });
}
