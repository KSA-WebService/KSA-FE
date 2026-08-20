import { createHash } from "node:crypto";
import { AccountActivationForm } from "./account-activation-form";

// Public route: /signup/invitation?token={invitationToken}
// (docs/user/user-ui.md "Page 3 — Account Activation"). No public
// registration entry point exists to this page -- it's only reachable via
// the invitation link KSA administration sends.
export default async function AccountActivationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // The raw token is a credential -- it's still sent in the verify/complete
  // request bodies (the backend requires it), but it must never end up in
  // the TanStack Query cache key. A SHA-256 fingerprint gives the query a
  // stable, non-secret identity that still differs per invitation.
  const tokenFingerprint = token ? createHash("sha256").update(token).digest("hex") : null;

  return <AccountActivationForm token={token ?? null} tokenFingerprint={tokenFingerprint} />;
}
