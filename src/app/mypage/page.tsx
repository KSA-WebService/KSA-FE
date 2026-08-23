import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { MyPageContent } from "./my-page-content";

export const metadata: Metadata = {
  title: "My Page — HKUST Korean Students Association",
};

// docs/user/user-ui.md "Page 4 — My Page". Authenticated-only: if there is
// no valid authenticated user, redirect to /login before any authenticated
// KSA application-data endpoint is ever called. Checked server-side, before
// any HTML is sent -- same getUser() pattern (verifies against Supabase
// Auth, not just a locally-stored session cookie) as /login's own
// existing-session check (src/app/login/page.tsx).
export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-page-bg pt-16">
        <Suspense fallback={null}>
          <MyPageContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
