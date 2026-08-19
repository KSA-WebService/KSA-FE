import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminMe } from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/api/client";
import { LoginForm } from "./login-form";

// Public route -- deliberately outside the (protected) route group and the
// proxy's redirect-if-unauthenticated logic.
//
// Implements docs/admin/admin-ui.md §1 "Existing Session Behavior": if a
// valid Supabase session already exists AND it verifies as an administrator
// via GET /api/v1/admin/me, skip the login form entirely. A Supabase
// session alone is never treated as proof of admin access.
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  // Already carrying an explicit reason -- either redirected here from the
  // protected layout, or from our own check below via the identical
  // redirect below. Skip re-running the existing-session check: LoginForm
  // performs the client-side sign-out/message for that reason directly,
  // and re-checking would just repeat the same failed call (and risk a
  // redirect loop, since a still-invalid session would fail the same way
  // again).
  if (reason) {
    return <LoginForm reason={reason} />;
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <LoginForm reason={null} />;
  }

  try {
    await getAdminMe(session.access_token);
  } catch (error) {
    // Branch on HTTP status, not errorCode -- see ApiRequestError.
    if (error instanceof ApiRequestError && error.status === 403) {
      // Authenticated, but not permitted into the KSA admin.
      redirect("/admin/login?reason=not_admin");
    }
    if (error instanceof ApiRequestError && error.status === 401) {
      // Invalid/expired Supabase authentication.
      redirect("/admin/login?reason=session_expired");
    }

    // Network failure, HTTP 5xx, or a malformed response: this is NOT an
    // authorization rejection. Don't classify the account as non-admin and
    // don't discard the session -- just show a temporary
    // service-unavailable message and let the administrator retry.
    return <LoginForm reason={null} serviceError />;
  }

  redirect("/admin");
}
