import { apiFetch } from "@/lib/api/client";
import type { AdminProfile } from "@/types/api";

// GET /api/v1/admin/me -- verifies administrator access and returns the
// current administrator profile. docs/admin/api-contract.md "Admin
// Authentication". This is the sole source of truth for KSA admin
// authorization; a valid Supabase session never substitutes for it.
export function getAdminMe(accessToken: string) {
  return apiFetch<AdminProfile>("/admin/me", { accessToken });
}
