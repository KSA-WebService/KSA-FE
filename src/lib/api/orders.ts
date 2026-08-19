import { apiFetch } from "@/lib/api/client";
import type { ListResponse, OrderListItem, OrdersListParams, UpdateOrderStatusPayload } from "@/types/api";

function buildQueryString(params: OrdersListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /admin/orders -- "Admin Orders List". There is no Order Detail
// endpoint/route -- this list is the entire Orders feature.
export function getOrders(params: OrdersListParams, accessToken: string) {
  return apiFetch<ListResponse<OrderListItem>>(`/admin/orders${buildQueryString(params)}`, {
    accessToken,
  });
}

// PATCH /admin/orders/{id}/status -- "Admin Order Status Update"
export function updateOrderStatus(
  orderId: string,
  payload: UpdateOrderStatusPayload,
  accessToken: string,
) {
  return apiFetch<OrderListItem>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}
