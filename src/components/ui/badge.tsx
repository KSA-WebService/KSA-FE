import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "destructive" | "info";

// Compact pill badges per docs/admin/product.md §16 -- status meaning must
// never rely on color alone, so callers should always pair this with text.
const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-text-secondary",
  brand: "bg-brand-100 text-brand-800",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-meta font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
