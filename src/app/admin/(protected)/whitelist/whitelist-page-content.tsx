"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useWhitelistQuery } from "@/hooks/use-whitelist-query";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import { DateTime } from "@/components/admin/date-time";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { InvitationStatusBadge } from "@/components/admin/whitelist-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { AddStudentDialog } from "./add-student-dialog";
import { ImportExcelDialog } from "./import-excel-dialog";
import type { InvitationStatus, WhitelistListParams } from "@/types/api";

const PAGE_SIZE = 20;

const INVITATION_STATUS_OPTIONS: { value: InvitationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "invited", label: "Invited" },
  { value: "accepted", label: "Accepted" },
  { value: "expired", label: "Expired" },
  { value: "failed", label: "Failed" },
];

export function WhitelistPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";
  const invitationStatus = searchParams.get("invitationStatus") ?? "";

  const queryParams: WhitelistListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      invitationStatus: (invitationStatus as WhitelistListParams["invitationStatus"]) || undefined,
    }),
    [page, keyword, invitationStatus],
  );

  const { data, isLoading, isError, refetch } = useWhitelistQuery(queryParams);

  function updateParams(next: Record<string, string | number | undefined>, resetPage = true) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") {
        nextSearchParams.delete(key);
      } else {
        nextSearchParams.set(key, String(value));
      }
    }
    if (resetPage) nextSearchParams.set("page", "1");
    router.push(`/admin/whitelist?${nextSearchParams.toString()}`);
  }

  const hasActiveFilters = Boolean(keyword || invitationStatus);
  const entries = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && entries.length === 0;

  return (
    <>
      <PageHeader
        title="Whitelist"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
              Import Excel
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>Add Student</Button>
          </>
        }
      />

      <div className="px-8 pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            value={keyword}
            onChange={(value) => updateParams({ keyword: value })}
            placeholder="Search by name, email, or student ID"
          />
          <FilterSelect
            label="Invitation Status"
            value={invitationStatus}
            onChange={(value) => updateParams({ invitationStatus: value })}
            allLabel="All Statuses"
            options={INVITATION_STATUS_OPTIONS}
          />
        </div>

        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-surface border border-border bg-surface">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-surface-muted">
              <tr>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Name
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Student ID
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Email
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Invitation Status
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                  Invited At
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                  Added At
                </th>
                <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-t border-border">
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                !isError &&
                entries.map((entry) => (
                  <tr
                    key={entry.whitelistUserId}
                    className="border-t border-border transition-colors duration-150 hover:bg-surface-muted"
                  >
                    <td className="px-4 py-3 text-body text-text-primary">{entry.name}</td>
                    <td className="px-4 py-3 text-body text-text-secondary">{entry.studentNumber}</td>
                    <td className="px-4 py-3 text-body text-text-secondary">{entry.email}</td>
                    <td className="px-4 py-3">
                      <InvitationStatusBadge status={entry.invitationStatus} />
                    </td>
                    <td className="px-4 py-3 text-body text-text-secondary">
                      <DateTime value={entry.invitedAt} />
                    </td>
                    <td className="px-4 py-3 text-body text-text-secondary">
                      <DateTime value={entry.createdAt} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/whitelist/${entry.whitelistUserId}`}
                        className={buttonVariants("secondary")}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {isEmpty && (
            <EmptyState
              message={
                hasActiveFilters
                  ? "조건에 맞는 화이트리스트 항목이 없습니다."
                  : "화이트리스트에 등록된 학생이 없습니다."
              }
            />
          )}

          {isError && (
            <ErrorState
              message="화이트리스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
              onRetry={() => refetch()}
            />
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemLabel="whitelist entries"
            onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
          />
        )}
      </div>

      <AddStudentDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <ImportExcelDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </>
  );
}
