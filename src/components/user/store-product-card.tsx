"use client";

import { useState } from "react";
import { ProductImage } from "@/components/user/product-image";
import { PRODUCT_TYPE_LABELS } from "@/lib/user/product-labels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicProductListItem } from "@/types/api";

// Approximate character-length heuristic for "would overflow ~2-3 lines" --
// avoids a DOM scrollHeight/ResizeObserver measurement for a requirement
// the spec itself only calls "approximately 2-3 lines".
const DESCRIPTION_EXPAND_THRESHOLD = 100;

interface StoreProductCardProps {
  product: PublicProductListItem;
  onOrder: (product: PublicProductListItem) => void;
}

// docs/user/user-ui.md "Page 7 — Store List" "Product Cards". Deliberately
// NOT shared with Home's ProductCard (store-preview.tsx) -- Home's card is
// intentionally non-interactive (no order action, no description, no type
// label), and forcing them into one component would either regress Home or
// require Home to opt out of half the props. Only the image treatment
// (ProductImage) is shared between the two, since that policy is genuinely
// identical everywhere it appears.
export function StoreProductCard({ product, onOrder }: StoreProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isUnavailable = product.availabilityStatus === "unavailable";
  const description = product.description ?? "";
  const isLong = description.length > DESCRIPTION_EXPAND_THRESHOLD;

  return (
    <div className={cn("flex flex-col", isUnavailable && "opacity-70")}>
      <ProductImage image={product.image} alt={product.productName} />

      <p className="mt-4 text-meta font-medium text-brand-800">{PRODUCT_TYPE_LABELS[product.productType]}</p>
      <h3 className="mt-1 text-body font-semibold text-text-primary">{product.productName}</h3>
      <p className="mt-1 text-body text-text-primary">🪙 {product.tokenPrice} Tokens</p>

      {description && (
        <div className="mt-2">
          <p
            className={cn(
              "whitespace-pre-wrap text-meta text-text-secondary",
              !expanded && "line-clamp-3",
            )}
          >
            {description}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-1 text-meta font-medium text-brand-800 transition-colors hover:text-brand-500"
            >
              {expanded ? "접기" : "더보기"}
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        {isUnavailable ? (
          <p className="text-meta font-medium text-text-muted">현재 주문 불가</p>
        ) : (
          <Button className="w-full" onClick={() => onOrder(product)}>
            주문하기
          </Button>
        )}
      </div>
    </div>
  );
}
