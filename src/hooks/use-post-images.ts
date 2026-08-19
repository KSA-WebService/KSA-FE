"use client";

import { useState } from "react";
import { getAccessToken } from "@/lib/supabase/client";
import { completeFileUpload, deleteFile, getPresignedUploadUrl, uploadFileToStorage } from "@/lib/api/files";
import { exceedsUploadLimit, processImageForUpload } from "@/lib/image-processing";
import type { PostDetailImage } from "@/types/api";

export type PostImageUploadStatus =
  | "existing"
  | "preparing"
  | "uploading"
  | "completing"
  | "completed"
  | "failed";

export interface PostImageItem {
  localId: string;
  fileId: string | null;
  fileUrl: string | null;
  status: PostImageUploadStatus;
  errorMessage?: string;
  /** Present only for newly added items during this session (kept for retry). */
  file?: File;
  /** True if this image belonged to the post when the form was opened. */
  isOriginal: boolean;
}

export const MAX_POST_IMAGES = 4;

let localIdCounter = 0;
function nextLocalId(): string {
  localIdCounter += 1;
  return `img-${Date.now()}-${localIdCounter}`;
}

// Fire-and-forget cleanup -- never surfaces failures to the UI.
// docs/admin/admin-ui.md: "a cleanup failure ... must not cause the
// frontend to report that the post save failed."
function cleanupFile(fileId: string) {
  getAccessToken().then((accessToken) => {
    if (!accessToken) return;
    deleteFile(fileId, accessToken).catch(() => undefined);
  });
}

// Manages up to MAX_POST_IMAGES images for the shared post form (New Post +
// Post Edit), including the signed-URL upload flow per image
// (docs/admin/admin-ui.md §8 "Image Upload Flow"). Drag-and-drop reordering
// is explicitly optional in the spec and not implemented here -- existing
// order is preserved and new images are appended to the end.
export function usePostImages(initialImages?: PostDetailImage[]) {
  const [originalFileIds] = useState(() => (initialImages ?? []).map((image) => image.fileId));

  const [items, setItems] = useState<PostImageItem[]>(() =>
    (initialImages ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        localId: image.fileId,
        fileId: image.fileId,
        fileUrl: image.fileUrl,
        status: "existing" as const,
        isOriginal: true,
      })),
  );

  function updateItem(localId: string, patch: Partial<PostImageItem>) {
    setItems((current) => current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
  }

  async function uploadOne(localId: string, file: File) {
    updateItem(localId, { status: "preparing" });

    try {
      const processed = await processImageForUpload(file);

      if (exceedsUploadLimit(processed.blob.size)) {
        updateItem(localId, { status: "failed", errorMessage: "이미지 용량이 5MB를 초과합니다." });
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        updateItem(localId, { status: "failed", errorMessage: "이미지를 업로드하지 못했습니다." });
        return;
      }

      updateItem(localId, { status: "uploading" });
      const presigned = await getPresignedUploadUrl(
        {
          originalName: processed.fileName,
          contentType: processed.contentType,
          fileSize: processed.blob.size,
          purpose: "post_image",
        },
        accessToken,
      );

      await uploadFileToStorage(presigned.uploadUrl, processed.blob);

      updateItem(localId, { status: "completing" });
      const completed = await completeFileUpload(presigned.fileId, accessToken);

      updateItem(localId, {
        status: "completed",
        fileId: completed.fileId,
        fileUrl: completed.fileUrl,
      });
    } catch {
      updateItem(localId, { status: "failed", errorMessage: "이미지를 업로드하지 못했습니다." });
    }
  }

  function addFiles(files: FileList | File[]) {
    const availableSlots = MAX_POST_IMAGES - items.length;
    if (availableSlots <= 0) return;

    const filesToAdd = Array.from(files).slice(0, availableSlots);
    const newItems: PostImageItem[] = filesToAdd.map((file) => ({
      localId: nextLocalId(),
      fileId: null,
      fileUrl: URL.createObjectURL(file),
      status: "preparing",
      file,
      isOriginal: false,
    }));

    setItems((current) => [...current, ...newItems]);
    for (const item of newItems) {
      void uploadOne(item.localId, item.file as File);
    }
  }

  function removeImage(localId: string) {
    const target = items.find((item) => item.localId === localId);
    if (target && !target.isOriginal && target.status === "completed" && target.fileId) {
      // Newly uploaded and completed, but never attached to the post --
      // safe to clean up immediately (admin-ui.md §8 "Removing Images").
      cleanupFile(target.fileId);
    }
    setItems((current) => current.filter((item) => item.localId !== localId));
  }

  function retryImage(localId: string) {
    const target = items.find((item) => item.localId === localId);
    if (target?.file) void uploadOne(localId, target.file);
  }

  // Call ONLY after a successful PATCH: deletes any image that belonged to
  // the original post but is no longer in the final array. Never call
  // before the PATCH succeeds -- "Do not delete the file first."
  function cleanupRemovedOriginalImages() {
    const currentFileIds = new Set(
      items.map((item) => item.fileId).filter((id): id is string => Boolean(id)),
    );
    for (const fileId of originalFileIds) {
      if (!currentFileIds.has(fileId)) cleanupFile(fileId);
    }
  }

  // Call on Cancel (New Post or Edit): cleans up completed uploads from
  // this session that were never attached to a post. Never touches images
  // that belonged to the original post.
  function cleanupUnattachedNewImages() {
    for (const item of items) {
      if (!item.isOriginal && item.status === "completed" && item.fileId) {
        cleanupFile(item.fileId);
      }
    }
  }

  const isBusy = items.some(
    (item) => item.status === "preparing" || item.status === "uploading" || item.status === "completing",
  );
  const imageFileIds = items
    .filter((item) => item.status === "existing" || item.status === "completed")
    .map((item) => item.fileId as string);

  return {
    items,
    addFiles,
    removeImage,
    retryImage,
    isBusy,
    imageFileIds,
    /** Ordered fileIds the post had when this hook was created -- for diffing. */
    originalFileIds,
    cleanupRemovedOriginalImages,
    cleanupUnattachedNewImages,
  };
}

export type UsePostImagesResult = ReturnType<typeof usePostImages>;
