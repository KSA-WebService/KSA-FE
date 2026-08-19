"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductImageSection } from "./product-image-section";
import type { UseProductImageResult } from "@/hooks/use-product-image";
import type { ProductFormErrors, ProductFormValues } from "@/lib/product-form";

interface ProductFormFieldsProps {
  values: ProductFormValues;
  onChange: (patch: Partial<ProductFormValues>) => void;
  errors: ProductFormErrors;
  /** false when coreFieldsLocked -- always true for New Product. */
  nameAndPriceEditable: boolean;
  image: UseProductImageResult;
  disabled?: boolean;
}

// Shared between New Product and Product Edit -- docs/admin/admin-ui.md
// §14/§15 "reuse the same shared Product form structure". Form order:
// Basic Information, Description, Sales Settings, Product Image. Product
// Type is deliberately NOT here -- it's create-only and immutable, so New
// Product renders its own ProductTypeToggle instead.
export function ProductFormFields({
  values,
  onChange,
  errors,
  nameAndPriceEditable,
  image,
  disabled,
}: ProductFormFieldsProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-section-heading font-semibold text-text-primary">Basic Information</h2>

        <div>
          <label htmlFor="product-name" className="text-meta font-medium text-text-secondary">
            Product Name
          </label>
          {nameAndPriceEditable ? (
            <Input
              id="product-name"
              value={values.productName}
              onChange={(event) => onChange({ productName: event.target.value })}
              disabled={disabled}
              className="mt-1"
            />
          ) : (
            <p className="mt-1 text-body text-text-primary">{values.productName}</p>
          )}
          {errors.productName && <p className="mt-1 text-meta text-destructive">{errors.productName}</p>}
        </div>

        <div>
          <label htmlFor="product-token-price" className="text-meta font-medium text-text-secondary">
            Token Price
          </label>
          {nameAndPriceEditable ? (
            <Input
              id="product-token-price"
              type="number"
              min={0}
              step={1}
              value={values.tokenPrice}
              onChange={(event) => onChange({ tokenPrice: event.target.value })}
              disabled={disabled}
              className="mt-1 w-40"
            />
          ) : (
            <p className="mt-1 text-body text-text-primary">{values.tokenPrice} Tokens</p>
          )}
          {errors.tokenPrice && <p className="mt-1 text-meta text-destructive">{errors.tokenPrice}</p>}
        </div>

        {!nameAndPriceEditable && (
          <p className="text-meta text-text-secondary">
            주문이 생성된 상품의 이름과 Token Price는 변경할 수 없습니다.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-section-heading font-semibold text-text-primary">Description</h2>
        <Textarea
          value={values.description}
          onChange={(event) => onChange({ description: event.target.value })}
          disabled={disabled}
          rows={6}
          className="mt-2"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-section-heading font-semibold text-text-primary">Sales Settings</h2>

        <div>
          <label htmlFor="product-stock" className="text-meta font-medium text-text-secondary">
            Stock Quantity
          </label>
          <Input
            id="product-stock"
            type="number"
            min={0}
            step={1}
            value={values.stockQuantity}
            onChange={(event) => onChange({ stockQuantity: event.target.value })}
            disabled={disabled}
            className="mt-1 w-40"
          />
          {errors.stockQuantity && <p className="mt-1 text-meta text-destructive">{errors.stockQuantity}</p>}
        </div>

        <div className="flex items-center justify-between rounded-control border border-border px-3 py-2">
          <div>
            <label htmlFor="product-orderable" className="text-body text-text-primary">
              Ordering Enabled
            </label>
            <p className="text-meta text-text-secondary">
              OFF로 설정하면 재고가 남아 있어도 사용자가 주문할 수 없습니다.
            </p>
          </div>
          <Switch
            id="product-orderable"
            checked={values.isOrderable}
            onCheckedChange={(checked) => onChange({ isOrderable: checked })}
            disabled={disabled}
          />
        </div>
      </section>

      <section>
        <ProductImageSection image={image} disabled={disabled} />
      </section>
    </div>
  );
}
