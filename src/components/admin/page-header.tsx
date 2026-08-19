import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

// docs/admin/product.md §30: each page has one obvious primary action --
// pass it via `actions`.
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-8 pb-6">
      <div>
        <h1 className="text-page-title font-bold text-text-primary">{title}</h1>
        {description && <div className="mt-1 text-body text-text-secondary">{description}</div>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
