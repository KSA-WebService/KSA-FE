import { apiFetch } from "@/lib/api/client";
import type { CompleteOnboardingPayload, OnboardingCompleteResult, VerifiedInvitation, VerifyInvitationPayload } from "@/types/api";

// POST /auth/invitations/verify -- public, no Authorization header
// (docs/user/api-contract.md "Page 3 — Account Activation").
export function verifyInvitation(payload: VerifyInvitationPayload) {
  return apiFetch<VerifiedInvitation>("/auth/invitations/verify", {
    method: "POST",
    body: payload,
  });
}

// POST /auth/onboarding/complete -- public, no Authorization header. The
// resulting Supabase sign-in is a separate step performed by the caller.
export function completeOnboarding(payload: CompleteOnboardingPayload) {
  return apiFetch<OnboardingCompleteResult>("/auth/onboarding/complete", {
    method: "POST",
    body: payload,
  });
}
