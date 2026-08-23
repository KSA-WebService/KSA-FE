import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { NewsPageContent } from "./news-page-content";

// Overrides the root layout's admin-console metadata, same as Home
// (src/app/page.tsx).
export const metadata: Metadata = {
  title: "News — HKUST Korean Students Association",
  description: "HKUST Korean Students Association의 최신 소식을 확인해보세요.",
};

// docs/user/user-ui.md "Page 5 — News List". Public -- authentication is
// not required. useSearchParams() inside NewsPageContent requires a
// Suspense boundary for this route to remain statically prerenderable
// (same pattern as the admin console's list pages, e.g.
// src/app/admin/(protected)/posts/page.tsx).
export default function NewsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-page-bg pt-16">
        <Suspense fallback={null}>
          <NewsPageContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
