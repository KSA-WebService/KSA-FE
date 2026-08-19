import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

// docs/admin/product.md §13 / admin-ui.md list pages: Previous / Next +
// compact total indicator, server-side pagination.
export function Pagination({ page, totalPages, total, itemLabel, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <span className="text-meta text-text-secondary">
        {total} {itemLabel}
      </span>
      <div className="flex items-center gap-3">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-meta text-text-secondary">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
