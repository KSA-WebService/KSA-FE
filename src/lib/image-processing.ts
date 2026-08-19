// docs/admin/admin-ui.md "Image Upload Guidance": compress before upload
// when useful, prefer WebP when it reduces size without unacceptable
// quality loss, aim for ~1MB, enforce the backend's real 5MB hard maximum.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const RECOMMENDED_UPLOAD_BYTES = 1024 * 1024;

const WEBP_QUALITY = 0.82;

export interface ProcessedImage {
  blob: Blob;
  fileName: string;
  contentType: string;
}

// Single-pass canvas re-encode to WebP. Falls back to the original file
// untouched if the browser can't produce a smaller WebP blob for any
// reason -- this is a "when useful" recommendation, not a requirement.
export async function processImageForUpload(file: File): Promise<ProcessedImage> {
  const original: ProcessedImage = { blob: file, fileName: file.name, contentType: file.type };

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) return original;
    context.drawImage(bitmap, 0, 0);

    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", WEBP_QUALITY);
    });

    if (webpBlob && webpBlob.size > 0 && webpBlob.size < file.size) {
      const baseName = file.name.replace(/\.[^./]+$/, "");
      return { blob: webpBlob, fileName: `${baseName}.webp`, contentType: "image/webp" };
    }
  } catch {
    // Canvas re-encoding unavailable or failed -- use the original file.
  }

  return original;
}

export function exceedsUploadLimit(sizeInBytes: number): boolean {
  return sizeInBytes > MAX_UPLOAD_BYTES;
}
