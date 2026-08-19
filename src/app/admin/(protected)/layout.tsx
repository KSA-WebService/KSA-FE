import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminMe } from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/api/client";
import { AdminAuthProvider } from "@/providers/admin-auth-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProtectedAreaError } from "./protected-area-error";

// Route group only -- does not affect the URL. Wraps every authenticated
// /admin/* page (Dashboard, Users, User Detail, ...) except /admin/login.
//
// The proxy (src/proxy.ts) already guarantees a valid, refreshed Supabase
// session reaches this layout for any matched route. That is NOT KSA admin
// authorization. This layout performs the second, separate check -- calling
// GET /api/v1/admin/me -- and awaits it before returning any JSX, so no
// protected content (not even AdminShell) ever renders until authorization
// is confirmed.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Defense in depth: the proxy should already have redirected here, but
  // this layout does not assume that. getSession()'s user object is not
  // used for authorization -- only to read the raw access token below.
  if (!session) {
    redirect("/admin/login");
  }

  let profile;
  try {
    profile = await getAdminMe(session.access_token);
  } catch (error) {
    // A Server Component render can't sign out of Supabase (can't mutate
    // cookies), so genuine auth/authorization rejections hand off to the
    // login page via `reason`, which performs the client-side sign-out.
    // See src/app/admin/login/login-form.tsx.
    //
    // Branch on HTTP status, not errorCode -- status is reliable even when
    // the response body isn't the expected envelope (see ApiRequestError).
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        // Invalid/expired Supabase authentication.
        redirect("/admin/login?reason=session_expired");
      }
      if (error.status === 403) {
        // Authenticated, but not permitted into the KSA admin.
        redirect("/admin/login?reason=not_admin");
      }
    }

    // Network failure, HTTP 5xx, a malformed response, or any other
    // unexpected failure: this is NOT an authorization rejection. Do not
    // classify the user as non-admin and do not sign them out -- the
    // Supabase session may still be perfectly valid. Surface a
    // protected-area service error instead.
    return <ProtectedAreaError />;
  }

  return (
    <AdminAuthProvider initialProfile={profile}>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
