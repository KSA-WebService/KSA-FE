"use client";

import { useRouter } from "next/navigation";
import { toTitleCase } from "@/lib/utils";
import { ApiRequestError } from "@/lib/api/client";
import { useActionLogQuery } from "@/hooks/use-action-logs-query";
import { DateTime } from "@/components/admin/date-time";
import { CopyButton } from "@/components/admin/copy-button";
import { LogDetailsRenderer } from "@/components/logs/log-details-renderer";
import { ErrorState } from "@/components/admin/error-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const NOT_FOUND_MESSAGE = "작업 기록을 찾을 수 없습니다.";
const GENERIC_LOAD_ERROR = "작업 기록 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";

// docs/admin/admin-ui.md §17.2. Fully read-only -- no edit/delete actions
// anywhere on this page.
export function LogDetailContent({ logId }: { logId: string }) {
  const router = useRouter();
  const { data: log, isLoading, isError, error, refetch } = useActionLogQuery(logId);

  if (isLoading) {
    return (
      <div className="px-8 pt-8 pb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-9 w-80" />
        <Skeleton className="mt-6 h-48 w-full" />
      </div>
    );
  }

  if (isError || !log) {
    // No confirmed errorCode for "log not found" in the docs -- HTTP 404
    // is the generic, non-invented signal already available via
    // ApiRequestError.status.
    const isNotFound = error instanceof ApiRequestError && error.status === 404;

    return (
      <div className="px-8 pt-8 pb-8">
        <ErrorState
          message={isNotFound ? NOT_FOUND_MESSAGE : GENERIC_LOAD_ERROR}
          onRetry={isNotFound ? undefined : () => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-8">
      <button
        type="button"
        onClick={() => router.push("/admin/logs")}
        className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
      >
        ← Back to Logs
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-page-title font-bold text-text-primary">Log Details</h1>
        <Badge tone="neutral">{toTitleCase(log.actionType)}</Badge>
      </div>
      <p className="mt-1 text-body text-text-secondary">{toTitleCase(log.action)}</p>

      <section className="mt-6 rounded-surface border border-border bg-surface p-6">
        <h2 className="text-section-heading font-semibold text-text-primary">Action Summary</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-meta font-medium text-text-secondary">Date</dt>
            <dd className="mt-0.5 text-body text-text-primary">
              <DateTime value={log.createdAt} />
            </dd>
          </div>
          <div>
            <dt className="text-meta font-medium text-text-secondary">Admin</dt>
            <dd className="mt-0.5 text-body text-text-primary">{log.admin.name}</dd>
          </div>
          <div>
            <dt className="text-meta font-medium text-text-secondary">Admin Email</dt>
            <dd className="mt-0.5 text-body text-text-primary">{log.admin.email}</dd>
          </div>
          <div>
            <dt className="text-meta font-medium text-text-secondary">Type</dt>
            <dd className="mt-0.5 text-body text-text-primary">{toTitleCase(log.actionType)}</dd>
          </div>
          <div>
            <dt className="text-meta font-medium text-text-secondary">Action</dt>
            <dd className="mt-0.5 flex items-center gap-2 text-body text-text-primary">
              <span>{toTitleCase(log.action)}</span>
              <span className="font-mono text-meta text-text-muted">({log.action})</span>
            </dd>
          </div>
          <div>
            <dt className="text-meta font-medium text-text-secondary">Target ID</dt>
            <dd className="mt-0.5 flex items-center gap-2 font-mono text-body text-text-primary">
              {log.targetId ?? "—"}
              {log.targetId && <CopyButton value={log.targetId} label="Copy target ID" />}
            </dd>
          </div>
          <div>
            <dt className="text-meta font-medium text-text-secondary">Log ID</dt>
            <dd className="mt-0.5 flex items-center gap-2 font-mono text-body text-text-primary">
              {log.logId}
              <CopyButton value={String(log.logId)} label="Copy log ID" />
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-surface border border-border bg-surface p-6">
        <h2 className="text-section-heading font-semibold text-text-primary">Details</h2>
        <div className="mt-4">
          <LogDetailsRenderer details={log.details} />
        </div>
      </section>
    </div>
  );
}
