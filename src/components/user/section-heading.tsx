import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  viewAllHref: string;
}

// Shared "News"/"Store" Home section header + `View all →` action
// (docs/user/product.md Home "News Section" / "Store Section").
export function SectionHeading({ title, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="text-section-heading font-semibold text-text-primary">{title}</h2>
      <Link
        href={viewAllHref}
        className="group flex items-center gap-1.5 text-body text-brand-800 transition-colors hover:text-brand-500"
      >
        View all
        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
