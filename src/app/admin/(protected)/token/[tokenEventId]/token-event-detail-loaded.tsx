"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { DateTime } from "@/components/admin/date-time";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTokenEventMutation } from "@/hooks/use-token-event-detail-query";
import { GrantTable } from "./grant-table";
import { RenameEventDialog } from "./rename-event-dialog";
import type { GrantStatus, TokenEventDetail, TokenEventDetailParams } from "@/types/api";

interface TokenEventDetailLoadedProps {
  tokenEventId: string;
  detail: TokenEventDetail;
  queryParams: TokenEventDetailParams;
  isFetching: boolean;
}

const GRANT_STATUS_OPTIONS: { value: GrantStatus; label: string }[] = [
  { value: "granted", label: "Granted" },
  { value: "not_granted", label: "Not Granted" },
];

export function TokenEventDetailLoaded({
  tokenEventId,
  detail,
  queryParams,
  isFetching,
}: TokenEventDetailLoadedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteTokenEvent = useDeleteTokenEventMutation(tokenEventId);

  const keyword = queryParams.keyword ?? "";
  const grantStatus = queryParams.grantStatus ?? "";
  const hasActiveFilters = Boolean(keyword || grantStatus);

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
    router.push(`/admin/token/${tokenEventId}?${nextSearchParams.toString()}`);
  }

  function handleDelete() {
    deleteTokenEvent.mutate(undefined, {
      onSuccess: () => {
        toast.success("토큰 이벤트가 삭제되었습니다.");
        router.push("/admin/token");
      },
      onError: () => {
        toast.error("토큰 이벤트를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
      },
    });
  }

  return (
    <div className="px-8 pt-8 pb-8">
      <button
        type="button"
        onClick={() => router.push("/admin/token")}
        className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
      >
        ← Back to Token Events
      </button>

      <PageHeader
        title={detail.eventName}
        description={
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-meta text-text-secondary">
            <span>Granted Members: {detail.grantedMemberCount}</span>
            <span>Created By: {detail.createdBy.name}</span>
            <span>
              Created At: <DateTime value={detail.createdAt} />
            </span>
            <span>
              Last Grant At: <DateTime value={detail.lastGrantUpdatedAt} />
            </span>
          </div>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsRenameOpen(true)}>
              Rename Event
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              Delete Event
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={keyword}
          onChange={(value) => updateParams({ keyword: value })}
          placeholder="Search by name, Student ID, or email"
        />
        <FilterSelect
          label="Grant Status"
          value={grantStatus}
          onChange={(value) => updateParams({ grantStatus: value })}
          allLabel="All"
          options={GRANT_STATUS_OPTIONS}
        />
      </div>

      <GrantTable
        tokenEventId={tokenEventId}
        detail={detail}
        page={queryParams.page ?? 1}
        keyword={keyword}
        grantStatus={grantStatus}
        hasActiveFilters={hasActiveFilters}
        isFetching={isFetching}
        onPageChange={(nextPage) => updateParams({ page: nextPage }, false)}
      />

      <RenameEventDialog
        tokenEventId={tokenEventId}
        currentName={detail.eventName}
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Token Event"
        description={
          <>
            이 토큰 이벤트를 삭제하시겠습니까?
            <br />
            이벤트를 삭제해도 이미 학생 잔액에 반영된 토큰은 회수되지 않습니다.
          </>
        }
        confirmLabel="Delete Event"
        variant="destructive"
        onConfirm={handleDelete}
        isConfirming={deleteTokenEvent.isPending}
      />
    </div>
  );
}
