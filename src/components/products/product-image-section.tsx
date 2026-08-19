"use client";

import { useRef } from "react";
import { ImagePlus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UseProductImageResult } from "@/hooks/use-product-image";

interface ProductImageSectionProps {
  image: UseProductImageResult;
  disabled?: boolean;
}

// docs/admin/admin-ui.md §14 "Product Image": one image, no gallery. Plain
// <img> (not next/image) for the same reason as Posts' editable image
// grid -- this mixes local blob: preview URLs with real Supabase Storage
// URLs. object-contain: the administrator must be able to verify the
// complete uploaded image, never a misleading crop.
export function ProductImageSection({ image, disabled }: ProductImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h2 className="text-section-heading font-semibold text-text-primary">Product Image</h2>
      <p className="mt-1 text-meta text-text-secondary">
        더 빠른 업로드를 위해 1MB 이하의 이미지를 권장합니다.
      </p>

      <div className="mt-4 w-full max-w-[220px]">
        {image.image ? (
          <div className="relative aspect-square overflow-hidden rounded-control border border-border bg-surface-muted">
            {image.image.fileUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.image.fileUrl} alt="" className="h-full w-full object-contain" />
            )}

            {(image.image.status === "preparing" ||
              image.image.status === "uploading" ||
              image.image.status === "completing") && (
              <div className="absolute inset-0 flex items-center justify-center bg-text-primary/50 text-meta text-white">
                {image.image.status === "preparing"
                  ? "Preparing..."
                  : image.image.status === "uploading"
                    ? "Uploading..."
                    : "Completing..."}
              </div>
            )}

            {image.image.status === "failed" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/85 p-2 text-center text-meta text-white">
                <span>업로드 실패</span>
                <button
                  type="button"
                  onClick={image.retryImage}
                  className="inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              </div>
            )}

            {/* An existing (already-saved) product image can only be
                replaced, never removed -- the backend rejects
                imageFileId: null once a product has an image. This button
                only ever clears a not-yet-saved selection. */}
            {!image.image.isOriginal && (
              <button
                type="button"
                onClick={image.removeImage}
                aria-label="Remove image"
                disabled={disabled}
                className="absolute top-1.5 right-1.5 rounded-full bg-text-primary/70 p-1 text-white transition-colors duration-150 hover:bg-text-primary disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-control border border-dashed border-border text-text-muted transition-colors duration-150 hover:border-brand-500 hover:text-brand-500 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-meta">Add Image</span>
          </button>
        )}

        {image.image && (
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            Replace Image
          </Button>
        )}

        {image.image?.isOriginal && (
          <p className="mt-2 text-meta text-text-secondary">
            기존 상품 이미지는 제거할 수 없으며 다른 이미지로 교체할 수 있습니다.
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) image.addFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
