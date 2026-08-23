import type { ProductType } from "@/types/api";

// docs/user/product.md / user-ui.md product-type label mappings.
// Deliberately separate from the admin console's PRODUCT_TYPE_LABELS
// (components/products/product-badges.tsx) -- the admin labels are English
// ("Ticket", "Merchandise") while the public site uses Korean, matching the
// same pattern as NEWS_CATEGORY_LABELS (lib/user/category-labels.ts).
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ticket: "이용권",
  merchandise: "상품",
};
