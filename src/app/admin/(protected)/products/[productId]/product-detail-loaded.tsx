"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { ProductFormFields } from "@/components/products/product-form-fields";
import {
  AvailabilityBadge,
  ProductTypeBadge,
  PublicationBadge,
} from "@/components/products/product-badges";
import { DateTime } from "@/components/admin/date-time";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useUpdateProductMutation } from "@/hooks/use-product-detail-query";
import { useProductImage } from "@/hooks/use-product-image";
import { productDetailToFormValues, validateProductForm, type ProductFormValues } from "@/lib/product-form";
import { ApiError } from "@/lib/api/client";
import { GENERIC_PRODUCT_SAVE_ERROR, PRODUCT_ERROR_MESSAGES } from "@/lib/product-errors";
import type { ProductDetail, ProductUpdatePayload, PublicationStatus } from "@/types/api";

interface ProductDetailLoadedProps {
  productId: string;
  detail: ProductDetail;
}

// docs/admin/admin-ui.md §14. View Mode first, same-page Edit Mode.
// Remounted by the parent (key={detail.updatedAt}) after every successful
// save, so local state below is safe to initialize once from `detail`.
export function ProductDetailLoaded({ productId, detail }: ProductDetailLoadedProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [initialValues] = useState<ProductFormValues>(() => productDetailToFormValues(detail));
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ReturnType<typeof validateProductForm>>({});
  const [hideProductOpen, setHideProductOpen] = useState(false);
  const image = useProductImage(detail.image);
  const updateProduct = useUpdateProductMutation(productId);

  const nameAndPriceEditable = !detail.coreFieldsLocked;
  const isSubmitting = updateProduct.isPending;

  function handleChange(patch: Partial<ProductFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function buildDiffPayload(targetStatus?: PublicationStatus): ProductUpdatePayload {
    const payload: ProductUpdatePayload = {};

    if (nameAndPriceEditable) {
      if (values.productName !== initialValues.productName) payload.productName = values.productName.trim();
      if (values.tokenPrice !== initialValues.tokenPrice) payload.tokenPrice = Number(values.tokenPrice);
    }
    if (values.stockQuantity !== initialValues.stockQuantity) {
      payload.stockQuantity = Number(values.stockQuantity);
    }
    if (values.isOrderable !== initialValues.isOrderable) payload.isOrderable = values.isOrderable;
    if (values.description !== initialValues.description) {
      payload.description = values.description.trim() || null;
    }
    if (image.imageChanged) payload.imageFileId = image.imageFileId;
    if (targetStatus) payload.publicationStatus = targetStatus;

    return payload;
  }

  function submitUpdate(payload: ProductUpdatePayload, successMessage: string) {
    updateProduct.mutate(payload, {
      onSuccess: () => {
        // Safe now that the PATCH (which detaches it) has succeeded.
        image.cleanupRemovedOriginalImage();
        setHideProductOpen(false);
        setIsEditing(false);
        toast.success(successMessage);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? (PRODUCT_ERROR_MESSAGES[error.errorCode] ?? GENERIC_PRODUCT_SAVE_ERROR)
            : GENERIC_PRODUCT_SAVE_ERROR;
        toast.error(message);
      },
    });
  }

  function handleSave(targetStatus?: PublicationStatus) {
    const validationErrors = validateProductForm(values, { nameAndPriceEditable });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || image.isBusy || isSubmitting) return;

    submitUpdate(buildDiffPayload(targetStatus), "상품이 저장되었습니다.");
  }

  function handleHideProduct() {
    submitUpdate({ publicationStatus: "hidden" }, "상품이 저장되었습니다.");
  }

  function handleCancelEdit() {
    image.cleanupUnattachedNewImage();
    setValues(initialValues);
    setErrors({});
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="px-8 pt-8 pb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
        >
          ← Back to Products
        </button>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-page-title font-bold text-text-primary">{detail.productName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ProductTypeBadge type={detail.productType} />
              <PublicationBadge status={detail.publicationStatus} />
              <AvailabilityBadge status={detail.availabilityStatus} />
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>Edit Product</Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-control border border-border bg-surface-muted">
            {detail.image ? (
              <Image src={detail.image.fileUrl} alt="" fill unoptimized className="object-contain" />
            ) : null}
          </div>

          <section className="rounded-surface border border-border bg-surface p-6">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Token Price" value={`${detail.tokenPrice} Tokens`} />
              <Field label="Stock" value={String(detail.stockQuantity)} />
              <Field label="Ordering" value={detail.isOrderable ? "Enabled" : "Disabled"} />
              <Field label="Product Type" value={<ProductTypeBadge type={detail.productType} />} />
            </dl>
          </section>
        </div>

        <section className="mt-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-body text-text-primary">{detail.description || "—"}</p>
        </section>

        <section className="mt-6 rounded-surface border border-border bg-surface p-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Record Information</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Published At" value={<DateTime value={detail.publishedAt} />} />
            <Field label="Created At" value={<DateTime value={detail.createdAt} />} />
            <Field label="Updated At" value={<DateTime value={detail.updatedAt} />} />
          </dl>
        </section>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-8">
      <button
        type="button"
        onClick={handleCancelEdit}
        className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
      >
        ← Back to Products
      </button>

      <PageHeader title="Edit Product" />

      <div className="mb-6">
        <span className="text-meta font-medium text-text-secondary">Product Type</span>
        <p className="mt-1 text-body text-text-primary">
          <ProductTypeBadge type={detail.productType} />
        </p>
        <p className="mt-1 text-meta text-text-secondary">상품 유형은 생성 후 변경할 수 없습니다.</p>
      </div>

      <ProductFormFields
        values={values}
        onChange={handleChange}
        errors={errors}
        nameAndPriceEditable={nameAndPriceEditable}
        image={image}
        disabled={isSubmitting}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          {detail.publicationStatus === "published" && (
            <Button variant="destructive" onClick={() => setHideProductOpen(true)} disabled={isSubmitting}>
              Hide Product
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleCancelEdit} disabled={isSubmitting}>
            Cancel
          </Button>
          {detail.publicationStatus === "draft" && (
            <>
              <Button variant="secondary" onClick={() => handleSave()} disabled={isSubmitting || image.isBusy}>
                Save Draft
              </Button>
              <Button onClick={() => handleSave("published")} disabled={isSubmitting || image.isBusy}>
                Publish
              </Button>
            </>
          )}
          {detail.publicationStatus === "published" && (
            <Button onClick={() => handleSave()} disabled={isSubmitting || image.isBusy}>
              Save Changes
            </Button>
          )}
          {detail.publicationStatus === "hidden" && (
            <>
              <Button variant="secondary" onClick={() => handleSave()} disabled={isSubmitting || image.isBusy}>
                Save Changes
              </Button>
              <Button onClick={() => handleSave("published")} disabled={isSubmitting || image.isBusy}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={hideProductOpen}
        onOpenChange={setHideProductOpen}
        title="Hide Product"
        description="이 상품을 숨기시겠습니까? 숨긴 상품은 사용자에게 표시되지 않습니다."
        confirmLabel="Hide Product"
        variant="destructive"
        onConfirm={handleHideProduct}
        isConfirming={isSubmitting}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-meta font-medium text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-body text-text-primary">{value}</dd>
    </div>
  );
}
