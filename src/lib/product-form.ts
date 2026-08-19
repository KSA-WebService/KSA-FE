import type { ProductDetail } from "@/types/api";

export interface ProductFormValues {
  productName: string;
  tokenPrice: string;
  stockQuantity: string;
  isOrderable: boolean;
  description: string;
}

export const EMPTY_PRODUCT_FORM_VALUES: ProductFormValues = {
  productName: "",
  tokenPrice: "",
  stockQuantity: "",
  isOrderable: true,
  description: "",
};

export function productDetailToFormValues(detail: ProductDetail): ProductFormValues {
  return {
    productName: detail.productName,
    tokenPrice: String(detail.tokenPrice),
    stockQuantity: String(detail.stockQuantity),
    isOrderable: detail.isOrderable,
    description: detail.description ?? "",
  };
}

export interface ProductFormErrors {
  productName?: string;
  tokenPrice?: string;
  stockQuantity?: string;
}

function isNonNegativeInteger(value: string): boolean {
  if (value.trim() === "") return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0;
}

// docs/admin/admin-ui.md §14/§15 require Product Name/Token Price/Stock
// Quantity but never give exact Korean validation strings (only "Required")
// -- these follow the same "~을 입력해주세요." pattern used everywhere else
// in the doc, same treatment as Post's Title validation in Phase 2.
export function validateProductForm(
  values: ProductFormValues,
  { nameAndPriceEditable }: { nameAndPriceEditable: boolean },
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (nameAndPriceEditable) {
    if (!values.productName.trim()) {
      errors.productName = "상품 이름을 입력해주세요.";
    }
    if (!isNonNegativeInteger(values.tokenPrice)) {
      errors.tokenPrice = "올바른 Token Price를 입력해주세요.";
    }
  }

  if (!isNonNegativeInteger(values.stockQuantity)) {
    errors.stockQuantity = "올바른 재고 수량을 입력해주세요.";
  }

  return errors;
}
