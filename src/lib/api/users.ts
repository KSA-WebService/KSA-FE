import { apiFetch } from "@/lib/api/client";
import type { ListResponse, UserAccountStatus, UserDetail, UserRole, UserSummary, UsersListParams } from "@/types/api";

function buildQueryString(params: UsersListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /api/v1/admin/users -- docs/admin/api-contract.md "Admin Users List"
export function getUsers(params: UsersListParams, accessToken: string) {
  return apiFetch<ListResponse<UserSummary>>(`/admin/users${buildQueryString(params)}`, {
    accessToken,
  });
}

// GET /api/v1/admin/users/{userId} -- "Admin User Details"
export function getUser(userId: string, accessToken: string) {
  return apiFetch<UserDetail>(`/admin/users/${userId}`, { accessToken });
}

export interface UpdateUserPayload {
  role?: UserRole;
  status?: UserAccountStatus;
}

// PATCH /api/v1/admin/users/{userId} -- "Admin User Update". Only send
// fields that actually changed -- callers are responsible for that, not
// this function.
export function updateUser(userId: string, payload: UpdateUserPayload, accessToken: string) {
  return apiFetch<UserDetail>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}
