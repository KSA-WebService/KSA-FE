"use client";

import { cn } from "@/lib/utils";
import { PRODUCT_TYPE_LABELS } from "./product-badges";
import type { ProductType } from "@/types/api";

interface ProductTypeToggleProps {
  value: ProductType | null;
  onChange: (value: ProductType) => void;
  disabled?: boolean;
}

const OPTIONS: ProductType[] = ["ticket", "merchandise"];

// docs/admin/admin-ui.md §15 "two-option segmented control", deliberately
// not preselected -- Product Type is immutable after creation.
export function ProductTypeToggle({ value, onChange, disabled }: ProductTypeToggleProps) {
  return (
    <div className="inline-flex rounded-control border border-border p-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          disabled={disabled}
          className={cn(
            "rounded-control px-4 py-1.5 text-button font-semibold transition-colors duration-150 disabled:opacity-50",
            value === option ? "bg-brand-800 text-white" : "text-text-secondary hover:text-text-primary",
          )}
        >
          {PRODUCT_TYPE_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
