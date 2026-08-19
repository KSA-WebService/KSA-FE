import { apiFetch } from "@/lib/api/client";
import type { CompletedFileResponse, PresignedFileRequest, PresignedFileResponse } from "@/types/api";

// POST /admin/files/presigned-url -- Stage 1 of the post-image upload flow.
export function getPresignedUploadUrl(payload: PresignedFileRequest, accessToken: string) {
  return apiFetch<PresignedFileResponse>("/admin/files/presigned-url", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

// POST /admin/files/complete -- Stage 3, after the direct Storage PUT.
export function completeFileUpload(fileId: string, accessToken: string) {
  return apiFetch<CompletedFileResponse>("/admin/files/complete", {
    method: "POST",
    body: { fileId },
    accessToken,
  });
}

// DELETE /admin/files/{fileId} -- best-effort cleanup only (removed images,
// or completed-but-never-attached uploads). Callers must never surface this
// failing as a post-save failure.
export function deleteFile(fileId: string, accessToken: string) {
  return apiFetch<unknown>(`/admin/files/${fileId}`, {
    method: "DELETE",
    accessToken,
  });
}

// Stage 2 -- uploads directly to the signed Supabase Storage URL. This
// bypasses the NestJS API entirely: never attach the KSA Bearer token here,
// and the binary never passes through our backend.
export async function uploadFileToStorage(uploadUrl: string, blob: Blob): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": blob.type },
  });

  if (!response.ok) {
    throw new Error(`Storage upload failed with status ${response.status}`);
  }
}
