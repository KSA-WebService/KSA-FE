import { apiFetch } from "@/lib/api/client";
import type {
  CreateWhitelistPayload,
  DeleteWhitelistResponse,
  ImportWhitelistPayload,
  ImportWhitelistResult,
  ListResponse,
  ResendInvitationResponse,
  SendInvitationResponse,
  WhitelistDetail,
  WhitelistListParams,
  WhitelistSummary,
} from "@/types/api";

function buildQueryString(params: WhitelistListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /admin/auth/whitelist-users -- "Admin Whitelist List"
export function getWhitelist(params: WhitelistListParams, accessToken: string) {
  return apiFetch<ListResponse<WhitelistSummary>>(
    `/admin/auth/whitelist-users${buildQueryString(params)}`,
    { accessToken },
  );
}

// GET /admin/auth/whitelist-users/{id} -- "Admin Whitelist Detail"
export function getWhitelistDetail(whitelistUserId: string, accessToken: string) {
  return apiFetch<WhitelistDetail>(`/admin/auth/whitelist-users/${whitelistUserId}`, {
    accessToken,
  });
}

// POST /admin/auth/whitelist-users -- "Admin Whitelist Create"
export function createWhitelistEntry(payload: CreateWhitelistPayload, accessToken: string) {
  return apiFetch<WhitelistDetail>("/admin/auth/whitelist-users", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

// POST /admin/auth/whitelist-users/import -- "Admin Whitelist Bulk Import"
export function importWhitelistEntries(payload: ImportWhitelistPayload, accessToken: string) {
  return apiFetch<ImportWhitelistResult>("/admin/auth/whitelist-users/import", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

// POST /admin/auth/invitations/send -- "Admin Invitation Send". Omits
// expiresInHours so the backend default 72-hour lifetime applies.
export function sendInvitations(whitelistUserIds: string[], accessToken: string) {
  return apiFetch<SendInvitationResponse>("/admin/auth/invitations/send", {
    method: "POST",
    body: { whitelistUserIds },
    accessToken,
  });
}

// POST /admin/auth/invitations/resend -- "Admin Invitation Resend"
export function resendInvitations(whitelistUserIds: string[], accessToken: string) {
  return apiFetch<ResendInvitationResponse>("/admin/auth/invitations/resend", {
    method: "POST",
    body: { whitelistUserIds },
    accessToken,
  });
}

// DELETE /admin/auth/whitelist-users/{id} -- "Admin Whitelist Delete"
export function deleteWhitelistEntry(whitelistUserId: string, accessToken: string) {
  return apiFetch<DeleteWhitelistResponse>(`/admin/auth/whitelist-users/${whitelistUserId}`, {
    method: "DELETE",
    accessToken,
  });
}
