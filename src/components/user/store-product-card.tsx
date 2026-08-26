"use client";

import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/user/product-image";
import { PRODUCT_TYPE_LABELS } from "@/lib/user/product-labels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicProductListItem } from "@/types/api";

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
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const isUnavailable = product.availabilityStatus === "unavailable";

  // Ignore meaningless trailing spaces / empty lines while preserving
  // authored line breaks inside the actual description.
  const description = (product.description ?? "").trimEnd();

  useEffect(() => {
    const element = descriptionRef.current;

    if (!element || !description || expanded) {
      return;
    }

    const checkOverflow = () => {
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [description, expanded]);

  return (
    <div className={cn("flex flex-col", isUnavailable && "opacity-70")}>
      <ProductImage image={product.image} alt={product.productName} />

      <p className="mt-4 text-meta font-medium text-brand-800">
        {PRODUCT_TYPE_LABELS[product.productType]}
      </p>

      <h3 className="mt-1 text-body font-semibold text-text-primary">
        {product.productName}
      </h3>

      <p className="mt-1 text-body text-text-primary">
        🪙 {product.tokenPrice} Tokens
      </p>

      {description && (
        <div className="mt-2">
          <p
            ref={descriptionRef}
            className={cn(
              "whitespace-pre-wrap text-meta text-text-secondary",
              !expanded && "line-clamp-3",
            )}
          >
            {description}
          </p>

          {isOverflowing && (
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
          <p className="text-meta font-medium text-text-muted">
            현재 주문 불가
          </p>
        ) : (
          <Button className="w-full" onClick={() => onOrder(product)}>
            주문하기
          </Button>
        )}
      </div>
    </div>
  );
}
