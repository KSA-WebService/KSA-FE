import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-control border border-border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
