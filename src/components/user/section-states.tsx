import { buttonVariants } from "@/components/ui/button";

// Calm, section-local empty/error states for the public site (News/Store
// preview and, later, their list pages). Deliberately separate from the
// admin console's EmptyState/ErrorState (components/admin/) to keep the two
// frontends structurally independent -- see CLAUDE.md.
export function SectionEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-surface border border-dashed border-border py-16 text-center">
      <p className="text-body text-text-secondary">{message}</p>
    </div>
  );
}

interface SectionErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function SectionErrorState({ message, onRetry }: SectionErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-surface border border-dashed border-border py-16 text-center">
      <p className="text-body text-destructive">{message}</p>
      <button type="button" onClick={onRetry} className={buttonVariants("secondary")}>
        다시 시도
      </button>
    </div>
  );
}
