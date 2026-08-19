// docs/admin/product.md §21: empty states should be calm and useful, using
// Korean explanatory text.
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-body text-text-secondary">{message}</p>
    </div>
  );
}
