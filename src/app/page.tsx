import type { Metadata } from "next";
import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { HeroVideo } from "@/components/user/hero-video";
import { NewsPreview } from "@/components/user/news-preview";
import { StorePreview } from "@/components/user/store-preview";

// Overrides the root layout's admin-console metadata (title: "KSA Admin")
// for the public Home route only -- other, still-unbuilt user routes will
// need their own equivalent override when they're implemented.
export const metadata: Metadata = {
  title: "HKUST Korean Students Association",
  description: "HKUST Korean Students Association 공식 웹사이트 — News와 Store를 확인해보세요.",
};

// Home (docs/user/product.md / user-ui.md "Page 1 — Home"). Public for both
// logged-out and logged-in visitors -- never redirects to Login.
export default function Home() {
  return (
    <>
      <SiteHeader overHero />
      <main>
        <HeroVideo />
        <div className="bg-page-bg">
          <NewsPreview />
          <StorePreview />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
