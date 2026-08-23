import { apiFetch } from "@/lib/api/client";
import type { MyTokenLogsParams, MyTokenLogsResult } from "@/types/api";

function buildQueryString(params: MyTokenLogsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /users/me/token-logs -- docs/user/api-contract.md "Page 4 — My
// Page". Authenticated. Only `page`/`limit` are confirmed supported.
export function getMyTokenLogs(params: MyTokenLogsParams, accessToken: string) {
  return apiFetch<MyTokenLogsResult>(`/users/me/token-logs${buildQueryString(params)}`, {
    accessToken,
  });
}
