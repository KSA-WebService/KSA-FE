import { apiFetch } from "@/lib/api/client";
import type { TokenResetPayload, TokenResetPreview, TokenResetResponse } from "@/types/api";

// GET /admin/token-balances/reset-preview -- "Admin Token Balance Reset
// Preview". Called both when the reset dialog opens and again immediately
// before submitting the reset (frontend-only stale-preview check).
export function getTokenResetPreview(accessToken: string) {
  return apiFetch<TokenResetPreview>("/admin/token-balances/reset-preview", { accessToken });
}

// POST /admin/token-balances/reset -- "Admin Token Balance Reset"
export function resetTokenBalances(payload: TokenResetPayload, accessToken: string) {
  return apiFetch<TokenResetResponse>("/admin/token-balances/reset", {
    method: "POST",
    body: payload,
    accessToken,
  });
}
