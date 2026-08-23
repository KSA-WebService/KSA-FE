import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  summary: string;
  onPageChange: (page: number) => void;
}

// Shared user-facing pagination (docs/user/user-ui.md News List
// "Pagination"): simple Previous/Next + a caller-formatted summary,
// server-side pagination. Kept separate from the admin console's
// Pagination (components/admin/pagination.tsx) per the project's
// Admin/user structural split, and takes a pre-formatted `summary` string
// rather than a `total`/`itemLabel` pair since Korean count phrasing
// ("총 42개의 소식") doesn't compose the same way English does.
export function Pagination({ page, totalPages, summary, onPageChange }: PaginationProps) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
      <span className="text-meta text-text-secondary">{summary}</span>
      <div className="flex items-center gap-3">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          이전
        </Button>
        <span className="text-meta text-text-secondary">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          다음
        </Button>
      </div>
    </div>
  );
}
