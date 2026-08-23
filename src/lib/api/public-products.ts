import { apiFetch } from "@/lib/api/client";
import type { ListResponse, PublicProductListItem, PublicProductsListParams } from "@/types/api";

function buildQueryString(params: PublicProductsListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /products -- public "Store List" / "Home Store Preview"
// (docs/user/api-contract.md). No Authorization header -- browsing is
// public. Never send `keyword` here -- the backend rejects it with HTTP 400
// for this endpoint (confirmed in the contract).
export function getPublicProducts(params: PublicProductsListParams) {
  return apiFetch<ListResponse<PublicProductListItem>>(`/products${buildQueryString(params)}`);
}
