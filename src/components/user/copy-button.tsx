"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  value: string;
  label?: string;
}

// User-facing equivalent of the admin console's CopyButton
// (components/admin/copy-button.tsx) -- same behavior, kept as a separate
// component per the project's Admin/user structural split. Used by the
// Order Confirmation success state for the full order ID; a reasonable fit
// for reuse by My Page's order history later.
export function CopyButton({ value, label = "복사" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) -- not
      // worth surfacing an error for a convenience action.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="text-text-muted transition-colors duration-150 hover:text-brand-500"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
