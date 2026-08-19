import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "destructive";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

// Variants per docs/admin/product.md §12. Motion: subtle color shift + at
// most translateY(-1px), never bounce/scale (product.md §22).
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-800 text-white hover:bg-brand-800/90",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-surface-muted",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
};

// Exposed so a non-<button> element (e.g. a Next.js <Link> styled as a
// button, like the Users table's "View" action) can share these exact
// classes without nesting an interactive <button> inside an <a>.
export function buttonVariants(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control px-4 py-2 text-button font-semibold transition-all duration-150 ease-out hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0",
    variantClasses[variant],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button ref={ref} type={type} className={buttonVariants(variant, className)} {...props} />
    );
  },
);
Button.displayName = "Button";
