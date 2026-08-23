"use client";

import { useQuery } from "@tanstack/react-query";
import { verifyInvitation } from "@/lib/api/auth";

// docs/user/api-contract.md "Page 3 — Account Activation" Step 1. `retry`
// is disabled -- an invalid/expired/already-used token is a conclusive
// rejection, not a transient failure worth retrying automatically (manual
// retry via `refetch()` is still available for genuine service errors --
// see AccountActivationForm).
//
// `token` (the raw invitation credential) is only ever used inside
// queryFn, to build the actual request body -- it must never end up in the
// query key. `tokenFingerprint` (a SHA-256 hash computed server-side in
// page.tsx) is the query's identity instead: non-secret, but still unique
// per invitation.
export function useVerifyInvitationQuery(token: string | null, tokenFingerprint: string | null) {
  return useQuery({
    queryKey: ["invitation", "verify", tokenFingerprint],
    queryFn: () => verifyInvitation({ token: token! }),
    enabled: Boolean(token && tokenFingerprint),
    retry: false,
  });
}
