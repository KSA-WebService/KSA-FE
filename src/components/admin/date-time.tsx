import { formatAdminDateTime } from "@/lib/format-date";

// docs/admin/product.md §15: Asia/Hong_Kong, "18 Aug 2026, 19:00" style.
export function DateTime({ value }: { value: string | null | undefined }) {
  return <span>{formatAdminDateTime(value)}</span>;
}
