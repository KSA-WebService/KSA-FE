import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

// Shared card surface for Login and Account Activation
// (docs/user/user-ui.md "Login Card" / "Card Header"): warm ivory-leaning
// surface, strong text readability, no heavy glassmorphism. `bg-surface/95`
// + `backdrop-blur-sm` is the exact treatment the existing Admin login card
// uses (src/app/admin/login/login-form.tsx) -- reused as-is here rather
// than a flat opaque `bg-surface`, which read as too stark/white against
// the auth background. There's no separate "ivory" color token in
// globals.css (`--color-page-bg` is the page-level ivory, not a card
// surface); this translucency is what gives the card its warmer, softer
// tone instead.
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="rounded-surface border border-border bg-surface/95 p-8 shadow-xl backdrop-blur-sm sm:p-10">
      <h1 className="text-section-heading font-semibold text-text-primary">{title}</h1>
      {description && <p className="mt-2 text-body text-text-secondary">{description}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
