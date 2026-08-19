"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useUsersQuery } from "@/hooks/use-users-query";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import { RoleBadge, UserStatusBadge } from "@/components/admin/status-badges";
import { DateTime } from "@/components/admin/date-time";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import type { UsersListParams, UsersSortField } from "@/types/api";

const DEFAULT_SORT: UsersSortField = "created_at";
const DEFAULT_ORDER = "desc";
const PAGE_SIZE = 20;

interface Column {
  key: string;
  label: string;
  sortKey?: UsersSortField;
}

// Column -> sort key per docs/admin/admin-ui.md §3: response fields are
// camelCase, but the sort query values are snake_case -- keep the mapping
// in one place (here) rather than inferring it ad hoc elsewhere.
const COLUMNS: Column[] = [
  { key: "name", label: "Name", sortKey: "name" },
  { key: "studentNumber", label: "Student ID", sortKey: "student_number" },
  { key: "email", label: "Email", sortKey: "email" },
  { key: "role", label: "Role", sortKey: "role" },
  { key: "tokenBalance", label: "Token Balance", sortKey: "token_balance" },
  { key: "status", label: "Status", sortKey: "status" },
  { key: "createdAt", label: "Joined At", sortKey: "created_at" },
  { key: "actions", label: "Actions" },
];

export function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = (searchParams.get("sort") as UsersSortField) || DEFAULT_SORT;
  const order = searchParams.get("order") === "asc" ? "asc" : DEFAULT_ORDER;

  const queryParams: UsersListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      role: (role as UsersListParams["role"]) || undefined,
      status: (status as UsersListParams["status"]) || undefined,
      sort,
      order,
    }),
    [page, keyword, role, status, sort, order],
  );

  const { data, isLoading, isError, refetch } = useUsersQuery(queryParams);

  // URL search params are the source of truth for list state (per the
  // checkpoint's requirement) so refreshes and back/forward navigation
  // restore exactly what was showing.
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
    router.push(`/admin/users?${nextSearchParams.toString()}`);
  }

  function handleSort(sortKey: UsersSortField) {
    updateParams({ sort: sortKey, order: sort === sortKey && order === "asc" ? "desc" : "asc" });
  }

  const hasActiveFilters = Boolean(keyword || role || status);
  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && !isError && users.length === 0;

  return (
    <div className="px-8 pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={keyword}
          onChange={(value) => updateParams({ keyword: value })}
          placeholder="Search by name, email, or student ID"
        />
        <FilterSelect
          label="Role"
          value={role}
          onChange={(value) => updateParams({ role: value })}
          allLabel="All Roles"
          options={[
            { value: "student", label: "Student" },
            { value: "admin", label: "Admin" },
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => updateParams({ status: value })}
          allLabel="All Statuses"
          options={[
            { value: "active", label: "Active" },
            { value: "blocked", label: "Blocked" },
          ]}
        />
      </div>

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-surface border border-border bg-surface">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary"
                >
                  {column.sortKey ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.sortKey as UsersSortField)}
                      className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-text-primary"
                    >
                      {column.label}
                      {sort === column.sortKey &&
                        (order === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ))}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="border-t border-border">
                  {COLUMNS.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              !isError &&
              users.map((user) => (
                <tr
                  key={user.userId}
                  className="border-t border-border transition-colors duration-150 hover:bg-surface-muted"
                >
                  <td className="px-4 py-3 text-body text-text-primary">{user.name}</td>
                  <td className="px-4 py-3 text-body text-text-secondary">{user.studentNumber}</td>
                  <td className="px-4 py-3 text-body text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-body text-text-primary">{user.tokenBalance}</td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-body text-text-secondary">
                    <DateTime value={user.createdAt} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.userId}`} className={buttonVariants("secondary")}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {isEmpty && (
          <EmptyState
            message={hasActiveFilters ? "조건에 맞는 사용자가 없습니다." : "등록된 사용자가 없습니다."}
          />
        )}

        {isError && (
          <ErrorState
            message="사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            onRetry={() => refetch()}
          />
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="users"
          onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
        />
      )}
    </div>
  );
}
