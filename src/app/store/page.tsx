import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { StorePageContent } from "./store-page-content";

// Overrides the root layout's admin-console metadata, same as Home/News.
export const metadata: Metadata = {
  title: "Store — HKUST Korean Students Association",
  description: "KSA Token Shop에서 상품을 확인해보세요.",
};

// docs/user/user-ui.md "Page 7 — Store List". Public -- browsing does not
// require authentication. useSearchParams() inside StorePageContent
// requires a Suspense boundary for this route to remain statically
// prerenderable (same pattern as /news -- src/app/news/page.tsx).
export default function StorePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-page-bg pt-16">
        <Suspense fallback={null}>
          <StorePageContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
