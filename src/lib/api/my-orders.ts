import { apiFetch } from "@/lib/api/client";
import type { ListResponse, MyOrderItem, MyOrdersParams } from "@/types/api";

function buildQueryString(params: MyOrdersParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /users/me/orders -- docs/user/api-contract.md "Page 4 — My Page".
// Authenticated (the member's own order history, read-only). Only `page`/
// `limit` are confirmed supported -- no orderStatus filter or sort exists
// for this endpoint (unlike the admin Orders List), so none is sent.
export function getMyOrders(params: MyOrdersParams, accessToken: string) {
  return apiFetch<ListResponse<MyOrderItem>>(`/users/me/orders${buildQueryString(params)}`, {
    accessToken,
  });
}
