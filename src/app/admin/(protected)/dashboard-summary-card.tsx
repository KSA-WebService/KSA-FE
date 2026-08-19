"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Omit for cards whose target route doesn't exist in this phase yet. */
  href?: string;
}

// docs/admin/admin-ui.md §2: never show 0 while still loading, show a
// per-card unavailable state on error without failing the whole dashboard,
// and 0 is a valid (non-error) value once loaded.
export function SummaryCard({ label, value, isLoading, isError, href }: SummaryCardProps) {
  const card = (
    <div className="rounded-surface border border-border bg-surface p-6">
      <p className="text-meta font-medium text-text-secondary">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-16" />
      ) : isError ? (
        <p className="mt-3 text-body text-text-muted">데이터를 불러오지 못했습니다.</p>
      ) : (
        <p className="mt-3 text-page-title font-bold text-text-primary">{value}</p>
      )}
    </div>
  );

  if (!href || isLoading || isError) return card;

  return (
    <Link
      href={href}
      className="block rounded-surface transition-transform duration-150 ease-out hover:-translate-y-px"
    >
      {card}
    </Link>
  );
}
