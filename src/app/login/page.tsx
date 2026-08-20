import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

// Public route. docs/user/user-ui.md "Existing Session": if a valid
// authenticated user already exists, skip the Login form entirely (checked
// server-side, before any HTML is sent) rather than flashing it while
// client-side session resolution catches up.
//
// Uses getUser() rather than getSession() -- getSession() only reads
// whatever session cookie is present without revalidating it, so a
// stale/tampered cookie could trigger this redirect. getUser() asks
// Supabase Auth to verify the user is still genuinely authenticated. This
// is only this page's existing-user redirect decision, not KSA admin
// authorization (Admin's own check in src/app/admin/login/page.tsx is
// unrelated and unchanged).
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
