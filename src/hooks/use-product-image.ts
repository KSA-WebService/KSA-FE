"use client";

import { useState } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { completeFileUpload, deleteFile, getPresignedUploadUrl, uploadFileToStorage } from "@/lib/api/files";
import { exceedsUploadLimit, processImageForUpload } from "@/lib/image-processing";
import type { ProductImage } from "@/types/api";

export type ProductImageStatus = "preparing" | "uploading" | "completing" | "completed" | "failed";

export interface ProductImageState {
  status: ProductImageStatus;
  fileId: string | null;
  fileUrl: string | null;
  errorMessage?: string;
  /** Present only for a newly selected file this session (kept for retry). */
  file?: File;
  isOriginal: boolean;
}

function cleanupFile(fileId: string) {
  getAccessToken().then((accessToken) => {
    if (!accessToken) return;
    deleteFile(fileId, accessToken).catch(() => undefined);
  });
}

// Manages the single product image slot (docs/admin/admin-ui.md §14: "A
// product has one image ... Do not use a multi-image gallery").
//
// Manual QA confirmed the backend rejects imageFileId: null when a product
// already has an image -- an existing image can only be REPLACED, never
// removed. So there is deliberately no way to end up with `image === null`
// once `originalImage` is non-null: cancelling an in-progress replacement
// reverts to the original rather than clearing the slot, and the
// imageFileId/imageChanged derivation below never reports a "removal"
// unless a replacement has actually finished uploading.
export function useProductImage(initialImage?: ProductImage | null) {
  const [originalImage] = useState<ProductImage | null>(initialImage ?? null);
  const [image, setImage] = useState<ProductImageState | null>(() =>
    originalImage
      ? { status: "completed", fileId: originalImage.fileId, fileUrl: originalImage.fileUrl, isOriginal: true }
      : null,
  );

  async function uploadFile(file: File) {
    setImage({
      status: "preparing",
      fileId: null,
      fileUrl: URL.createObjectURL(file),
      file,
      isOriginal: false,
    });

    try {
      const processed = await processImageForUpload(file);

      if (exceedsUploadLimit(processed.blob.size)) {
        setImage((current) =>
          current ? { ...current, status: "failed", errorMessage: "이미지 용량이 5MB를 초과합니다." } : current,
        );
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setImage((current) =>
          current ? { ...current, status: "failed", errorMessage: "이미지를 업로드하지 못했습니다." } : current,
        );
        return;
      }

      setImage((current) => (current ? { ...current, status: "uploading" } : current));
      const presigned = await getPresignedUploadUrl(
        {
          originalName: processed.fileName,
          contentType: processed.contentType,
          fileSize: processed.blob.size,
          purpose: "product_image",
        },
        accessToken,
      );

      await uploadFileToStorage(presigned.uploadUrl, processed.blob);

      setImage((current) => (current ? { ...current, status: "completing" } : current));
      const completed = await completeFileUpload(presigned.fileId, accessToken);

      setImage((current) =>
        current
          ? { ...current, status: "completed", fileId: completed.fileId, fileUrl: completed.fileUrl }
          : current,
      );
    } catch {
      setImage((current) =>
        current ? { ...current, status: "failed", errorMessage: "이미지를 업로드하지 못했습니다." } : current,
      );
    }
  }

  function addFile(file: File) {
    // Selecting a new file always replaces whatever was previously
    // selected/attached in this slot.
    void uploadFile(file);
  }

  // Only clears/cancels a NOT-YET-SAVED selection -- never removes an
  // already-saved original image (the backend doesn't support that). If a
  // replacement was in progress, this reverts to showing the original
  // again rather than leaving the slot empty, since "empty" would look
  // like an unsupported removal.
  function removeImage() {
    if (!image || image.isOriginal) return;

    if (image.status === "completed" && image.fileId) {
      cleanupFile(image.fileId);
    }

    setImage(
      originalImage
        ? { status: "completed", fileId: originalImage.fileId, fileUrl: originalImage.fileUrl, isOriginal: true }
        : null,
    );
  }

  function retryImage() {
    if (image?.file) void uploadFile(image.file);
  }

  // Call ONLY after a successful PATCH -- safe cleanup of the old file
  // once it's been replaced by a new one.
  function cleanupRemovedOriginalImage() {
    if (originalImage && image?.fileId !== originalImage.fileId) {
      cleanupFile(originalImage.fileId);
    }
  }

  // Call on Cancel: cleans up a completed upload from this session that
  // was never attached. Never touches the original image.
  function cleanupUnattachedNewImage() {
    if (image && !image.isOriginal && image.status === "completed" && image.fileId) {
      cleanupFile(image.fileId);
    }
  }

  const isBusy =
    image?.status === "preparing" || image?.status === "uploading" || image?.status === "completing";

  // A replacement only counts once it has actually finished uploading --
  // an in-progress or failed replacement attempt must never be reported as
  // a committed change (which could otherwise be misread as a removal
  // request when combined with imageChanged below).
  const originalFileId = originalImage?.fileId ?? null;
  const imageFileId = image?.status === "completed" ? image.fileId : originalFileId;
  const imageChanged = imageFileId !== originalFileId;

  return {
    image,
    addFile,
    removeImage,
    retryImage,
    isBusy,
    imageFileId,
    imageChanged,
    cleanupRemovedOriginalImage,
    cleanupUnattachedNewImage,
  };
}

export type UseProductImageResult = ReturnType<typeof useProductImage>;
