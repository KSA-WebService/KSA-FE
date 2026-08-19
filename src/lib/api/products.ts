import { apiFetch } from "@/lib/api/client";
import type {
  ListResponse,
  ProductCreatePayload,
  ProductDetail,
  ProductListItem,
  ProductUpdatePayload,
  ProductsListParams,
} from "@/types/api";

function buildQueryString(params: ProductsListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /admin/products -- "Admin Products List"
export function getProducts(params: ProductsListParams, accessToken: string) {
  return apiFetch<ListResponse<ProductListItem>>(`/admin/products${buildQueryString(params)}`, {
    accessToken,
  });
}

// GET /admin/products/{id} -- "Admin Product Detail"
export function getProduct(productId: string, accessToken: string) {
  return apiFetch<ProductDetail>(`/admin/products/${productId}`, { accessToken });
}

// POST /admin/products -- "Admin Product Create"
export function createProduct(payload: ProductCreatePayload, accessToken: string) {
  return apiFetch<ProductDetail>("/admin/products", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

// PATCH /admin/products/{id} -- "Admin Product Update". Confirmed to
// return the full updated Product detail (not a summary), unlike Posts.
export function updateProduct(productId: string, payload: ProductUpdatePayload, accessToken: string) {
  return apiFetch<ProductDetail>(`/admin/products/${productId}`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}
