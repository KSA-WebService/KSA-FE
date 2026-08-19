"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { ProductFormFields } from "@/components/products/product-form-fields";
import { ProductTypeToggle } from "@/components/products/product-type-toggle";
import { Button } from "@/components/ui/button";
import { useCreateProductMutation } from "@/hooks/use-product-detail-query";
import { useProductImage } from "@/hooks/use-product-image";
import { EMPTY_PRODUCT_FORM_VALUES, validateProductForm, type ProductFormValues } from "@/lib/product-form";
import { ApiError } from "@/lib/api/client";
import { GENERIC_PRODUCT_CREATE_ERROR, PRODUCT_ERROR_MESSAGES } from "@/lib/product-errors";
import type { ProductCreatePayload, ProductType } from "@/types/api";

// docs/admin/admin-ui.md §15 "New Product". Reuses ProductFormFields
// (shared with Product Edit) and useProductImage; Product Type is
// create-only so it's rendered here directly rather than in the shared
// fields component.
export default function NewProductPage() {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM_VALUES);
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validateProductForm>>({});
  const [productTypeError, setProductTypeError] = useState<string | undefined>();
  const image = useProductImage();
  const createProduct = useCreateProductMutation();

  function handleChange(patch: Partial<ProductFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function buildPayload(publicationStatus: "draft" | "published"): ProductCreatePayload | null {
    const validationErrors = validateProductForm(values, { nameAndPriceEditable: true });
    setErrors(validationErrors);

    const hasProductType = productType !== null;
    setProductTypeError(hasProductType ? undefined : "상품 유형을 선택해주세요.");

    if (Object.keys(validationErrors).length > 0 || !hasProductType) return null;

    return {
      productName: values.productName.trim(),
      productType: productType as ProductType,
      tokenPrice: Number(values.tokenPrice),
      stockQuantity: Number(values.stockQuantity),
      isOrderable: values.isOrderable,
      publicationStatus,
      description: values.description.trim() || undefined,
      imageFileId: image.imageFileId ?? undefined,
    };
  }

  function handleSubmit(publicationStatus: "draft" | "published") {
    if (image.isBusy || createProduct.isPending) return;

    const payload = buildPayload(publicationStatus);
    if (!payload) return;

    createProduct.mutate(payload, {
      onSuccess: (created) => {
        toast.success(
          publicationStatus === "draft" ? "상품이 임시 저장되었습니다." : "상품이 게시되었습니다.",
        );
        router.replace(`/admin/products/${created.productId}`);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? (PRODUCT_ERROR_MESSAGES[error.errorCode] ?? GENERIC_PRODUCT_CREATE_ERROR)
            : GENERIC_PRODUCT_CREATE_ERROR;
        toast.error(message);
      },
    });
  }

  function handleCancel() {
    image.cleanupUnattachedNewImage();
    router.push("/admin/products");
  }

  const isSubmitting = createProduct.isPending;

  return (
    <div>
      <div className="px-8 pt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
        >
          ← Back to Products
        </button>
      </div>
      <PageHeader title="New Product" />

      <div className="px-8 pb-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-section-heading font-semibold text-text-primary">Product Type</h2>
            <div className="mt-2">
              <ProductTypeToggle value={productType} onChange={setProductType} disabled={isSubmitting} />
            </div>
            {productTypeError && <p className="mt-1 text-meta text-destructive">{productTypeError}</p>}
          </section>

          <ProductFormFields
            values={values}
            onChange={handleChange}
            errors={errors}
            nameAndPriceEditable
            image={image}
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting || image.isBusy}
          >
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={isSubmitting || image.isBusy}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
