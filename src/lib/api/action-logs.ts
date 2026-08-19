import { apiFetch } from "@/lib/api/client";
import type { ActionLogDetail, ActionLogListItem, ActionLogsListParams, ListResponse } from "@/types/api";

function buildQueryString(params: ActionLogsListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /admin/action-logs -- "Admin Action Logs List". Only page/limit/
// actionType are accepted -- the backend rejects `keyword`/`action` with a
// 400, so those must never be sent (docs/admin/api-contract.md).
export function getActionLogs(params: ActionLogsListParams, accessToken: string) {
  return apiFetch<ListResponse<ActionLogListItem>>(`/admin/action-logs${buildQueryString(params)}`, {
    accessToken,
  });
}

// GET /admin/action-logs/{id} -- "Admin Action Log Detail". Read-only --
// there is no corresponding mutation endpoint.
export function getActionLog(logId: number | string, accessToken: string) {
  return apiFetch<ActionLogDetail>(`/admin/action-logs/${logId}`, { accessToken });
}
