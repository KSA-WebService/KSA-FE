import { apiFetch } from "@/lib/api/client";
import type {
  CreateTokenEventPayload,
  CreateTokenEventResponse,
  DeleteTokenEventResponse,
  ListResponse,
  RenameTokenEventPayload,
  RenameTokenEventResponse,
  SaveGrantsPayload,
  SaveGrantsResponse,
  TokenEventDetail,
  TokenEventDetailParams,
  TokenEventSummary,
  TokenEventsListParams,
} from "@/types/api";

function buildQueryString(params: TokenEventsListParams | TokenEventDetailParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /admin/token-events -- "Admin Token Events List"
export function getTokenEvents(params: TokenEventsListParams, accessToken: string) {
  return apiFetch<ListResponse<TokenEventSummary>>(`/admin/token-events${buildQueryString(params)}`, {
    accessToken,
  });
}

// POST /admin/token-events -- "Admin Token Event Create"
export function createTokenEvent(payload: CreateTokenEventPayload, accessToken: string) {
  return apiFetch<CreateTokenEventResponse>("/admin/token-events", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

// GET /admin/token-events/{id} -- "Admin Token Event Detail"
export function getTokenEventDetail(
  tokenEventId: string,
  params: TokenEventDetailParams,
  accessToken: string,
) {
  return apiFetch<TokenEventDetail>(
    `/admin/token-events/${tokenEventId}${buildQueryString(params)}`,
    { accessToken },
  );
}

// PATCH /admin/token-events/{id}/grants -- "Token Event Grant Save". One
// request for one row or many -- never issue one request per student.
export function saveGrants(tokenEventId: string, payload: SaveGrantsPayload, accessToken: string) {
  return apiFetch<SaveGrantsResponse>(`/admin/token-events/${tokenEventId}/grants`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}

// PATCH /admin/token-events/{id} -- "Token Event Rename"
export function renameTokenEvent(
  tokenEventId: string,
  payload: RenameTokenEventPayload,
  accessToken: string,
) {
  return apiFetch<RenameTokenEventResponse>(`/admin/token-events/${tokenEventId}`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}

// DELETE /admin/token-events/{id} -- "Token Event Delete". Does not reverse
// balances already applied by its grants.
export function deleteTokenEvent(tokenEventId: string, accessToken: string) {
  return apiFetch<DeleteTokenEventResponse>(`/admin/token-events/${tokenEventId}`, {
    method: "DELETE",
    accessToken,
  });
}
