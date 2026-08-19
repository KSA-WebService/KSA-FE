import { apiFetch } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/api";

interface CountOnlyResponse {
  pagination: PaginationMeta;
}

// The current MVP has no dedicated dashboard endpoint -- summary counts
// reuse the existing admin list endpoints and read pagination.total.
// docs/admin/api-contract.md "Admin Dashboard Data".

export async function getNewOrdersCount(accessToken: string): Promise<number> {
  const response = await apiFetch<CountOnlyResponse>(
    "/admin/orders?page=1&limit=1&orderStatus=ordered",
    { accessToken },
  );
  return response.pagination.total;
}

export async function getTotalPostsCount(accessToken: string): Promise<number> {
  const response = await apiFetch<CountOnlyResponse>("/admin/posts?page=1&limit=1", {
    accessToken,
  });
  return response.pagination.total;
}

export async function getTotalUsersCount(accessToken: string): Promise<number> {
  const response = await apiFetch<CountOnlyResponse>("/admin/users?page=1&limit=1", {
    accessToken,
  });
  return response.pagination.total;
}
