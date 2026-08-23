import { apiFetch } from "@/lib/api/client";
import type { CurrentUser } from "@/types/api";

// GET /users/me -- the authenticated member's own profile
// (docs/user/api-contract.md "Page 4 — My Page"). Also the only source for
// the KSA member's display `name` -- the Supabase session itself never
// carries it.
export function getCurrentUser(accessToken: string) {
  return apiFetch<CurrentUser>("/users/me", { accessToken });
}
