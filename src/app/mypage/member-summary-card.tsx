import { Skeleton } from "@/components/ui/skeleton";
import type { CurrentUser } from "@/types/api";

// docs/user/user-ui.md "Page 4 — My Page" "Member Summary": read-only,
// Token balance visually emphasized, no edit controls, no password reset.
export function MemberSummaryCard({ user }: { user: CurrentUser }) {
  return (
    <div className="rounded-surface border border-border bg-surface p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="이름" value={user.name} />
          <Field label="이메일" value={user.email} />
          <Field label="학번" value={user.studentNumber} />
        </div>

        <div className="flex flex-col justify-center border-t border-border pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <span className="text-meta text-text-secondary">보유 토큰</span>
          <span className="mt-1 text-page-title font-semibold text-brand-800">{user.tokenBalance} Tokens</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-meta text-text-secondary">{label}</p>
      <p className="mt-0.5 truncate text-body font-medium text-text-primary">{value}</p>
    </div>
  );
}

export function MemberSummarySkeleton() {
  return (
    <div className="rounded-surface border border-border bg-surface p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
