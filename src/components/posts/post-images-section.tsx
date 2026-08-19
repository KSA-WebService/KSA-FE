"use client";

import { useRef } from "react";
import { ImagePlus, RotateCcw, X } from "lucide-react";
import { MAX_POST_IMAGES, type UsePostImagesResult } from "@/hooks/use-post-images";

interface PostImagesSectionProps {
  images: UsePostImagesResult;
}

// docs/admin/admin-ui.md §8 "Images" / "Image Upload Guidance". Uses plain
// <img> rather than next/image: this grid mixes local blob: preview URLs
// (in-flight uploads) with real Supabase Storage URLs, and these are small
// admin-tool thumbnails where next/image's optimization isn't worth the
// added complexity of handling both URL kinds.
export function PostImagesSection({ images }: PostImagesSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h2 className="text-section-heading font-semibold text-text-primary">Images</h2>
      <p className="mt-1 text-meta text-text-secondary">
        더 빠른 업로드를 위해 1MB 이하의 이미지를 권장합니다.
      </p>
      <p className="mt-0.5 text-meta text-text-secondary">권장 이미지 크기: 1080 × 1350 px (4:5)</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.items.map((item, index) => (
          <div
            key={item.localId}
            className="relative aspect-[4/5] overflow-hidden rounded-control border border-border bg-surface-muted"
          >
            {item.fileUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.fileUrl} alt="" className="h-full w-full object-contain" />
            )}

            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-text-primary/70 px-2 py-0.5 text-meta text-white">
                Representative
              </span>
            )}

            {(item.status === "preparing" || item.status === "uploading" || item.status === "completing") && (
              <div className="absolute inset-0 flex items-center justify-center bg-text-primary/50 text-meta text-white">
                {item.status === "preparing"
                  ? "Preparing..."
                  : item.status === "uploading"
                    ? "Uploading..."
                    : "Completing..."}
              </div>
            )}

            {item.status === "failed" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/85 p-2 text-center text-meta text-white">
                <span>업로드 실패</span>
                <button
                  type="button"
                  onClick={() => images.retryImage(item.localId)}
                  className="inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => images.removeImage(item.localId)}
              aria-label="Remove image"
              className="absolute top-1.5 right-1.5 rounded-full bg-text-primary/70 p-1 text-white transition-colors duration-150 hover:bg-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.items.length < MAX_POST_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-control border border-dashed border-border text-text-muted transition-colors duration-150 hover:border-brand-500 hover:text-brand-500"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-meta">Add Image</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            images.addFiles(event.target.files);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}
