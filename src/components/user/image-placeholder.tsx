import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Quiet frontend-generated placeholder for a missing News representative
// image or Product image (docs/user/product.md "Branded Placeholder"): a
// calm brand-tinted neutral, not an error state, and deliberately without a
// large logo competing with real card content.
export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-brand-100/50", className)}>
      <ImageIcon className="h-8 w-8 text-brand-300" strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}
