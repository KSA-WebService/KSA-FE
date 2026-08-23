import Image from "next/image";
import { ImagePlaceholder } from "@/components/user/image-placeholder";
import { cn } from "@/lib/utils";
import type { PublicImageRef } from "@/types/api";

interface ProductImageProps {
  image: PublicImageRef | null;
  alt: string;
  className?: string;
  sizes?: string;
}

// Shared Store product-image treatment (docs/user/user-ui.md "Store Product
// Image Policy" -- already browser-QA'd on the Home Store preview): product
// images may contain coupons/QR codes/text, so unlike News thumbnails they
// must never be cropped -- object-contain on a 4:5 area, with a quiet
// neutral backdrop filling any resulting empty space around a
// differently-shaped image. Used by the Home Store preview, the full
// /store grid, and the Order Confirmation modal.
export function ProductImage({ image, alt, className, sizes }: ProductImageProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-surface bg-surface-muted",
        className,
      )}
    >
      {image ? (
        <Image
          src={image.fileUrl}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-contain"
        />
      ) : (
        <ImagePlaceholder className="h-full w-full" />
      )}
    </div>
  );
}
