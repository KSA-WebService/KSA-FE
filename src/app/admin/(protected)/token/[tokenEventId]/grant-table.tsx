"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/empty-state";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReasonCombobox, ReasonPresetsDatalist } from "@/components/admin/reason-combobox";
import { useSaveGrantsMutation } from "@/hooks/use-token-event-detail-query";
import { GrantRow } from "./grant-row";
import type { TokenEventDetail } from "@/types/api";

const GENERIC_SAVE_ERROR = "토큰 지급 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";

interface GrantTableProps {
  tokenEventId: string;
  detail: TokenEventDetail;
  page: number;
  keyword: string;
  grantStatus: string;
  hasActiveFilters: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

// Never remounted on page/keyword/grantStatus changes (that tore down the
// surrounding search/filter UI and dropped input focus) -- selection is
// reset explicitly instead, using React's documented "adjust state during
// render" pattern (guarded setState comparing against the previous
// filter signature), the same technique already used in SearchInput's own
// value-sync. admin-ui.md §11: selection "must not silently select
// students on other pages [or filters]".
export function GrantTable({
  tokenEventId,
  detail,
  page,
  keyword,
  grantStatus,
  hasActiveFilters,
  isFetching,
  onPageChange,
}: GrantTableProps) {
  const filterSignature = `${page}-${keyword}-${grantStatus}`;
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkAmount, setBulkAmount] = useState("0");
  const [bulkReason, setBulkReason] = useState("");
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const saveGrants = useSaveGrantsMutation(tokenEventId);

  if (filterSignature !== lastFilterSignature) {
    setLastFilterSignature(filterSignature);
    setSelectedUserIds(new Set());
  }

  const items = detail.items;
  const eligibleRows = items.filter((row) => row.grantEligibility === "eligible");
  const allEligibleSelected =
    eligibleRows.length > 0 && eligibleRows.every((row) => selectedUserIds.has(row.userId));

  function toggleSelect(userId: string, selected: boolean) {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      if (selected) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      if (allEligibleSelected) {
        eligibleRows.forEach((row) => next.delete(row.userId));
      } else {
        eligibleRows.forEach((row) => next.add(row.userId));
      }
      return next;
    });
  }

  const selectedCount = selectedUserIds.size;
  const bulkAmountNumber = Number(bulkAmount);
  const isBulkAmountValid = Number.isInteger(bulkAmountNumber) && bulkAmountNumber >= 0;
  const totalGrantAmount = isBulkAmountValid ? bulkAmountNumber * selectedCount : 0;

  function handleOpenBulkConfirm() {
    if (!isBulkAmountValid) {
      toast.error("올바른 토큰 수를 입력해주세요.");
      return;
    }
    if (!bulkReason.trim()) {
      toast.error("Reason을 입력해주세요.");
      return;
    }
    setIsBulkConfirmOpen(true);
  }

  function handleBulkSave() {
    if (saveGrants.isPending) return;

    saveGrants.mutate(
      {
        grants: Array.from(selectedUserIds).map((userId) => ({
          userId,
          grantedAmount: bulkAmountNumber,
          reason: bulkReason.trim(),
        })),
      },
      {
        onSuccess: () => {
          setIsBulkConfirmOpen(false);
          setSelectedUserIds(new Set());
          toast.success("토큰 지급 정보가 저장되었습니다.");
        },
        onError: () => toast.error(GENERIC_SAVE_ERROR),
      },
    );
  }

  return (
    <div>
      <ReasonPresetsDatalist />

      <div
        className={cn(
          "max-h-[calc(100vh-320px)] overflow-auto rounded-surface border border-border bg-surface transition-opacity duration-150",
          isFetching && "opacity-60",
        )}
      >
        <table className="w-full min-w-[1100px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr>
              <th scope="col" className="border-b border-border px-4 py-3">
                <Checkbox
                  checked={allEligibleSelected}
                  onChange={toggleSelectAll}
                  disabled={eligibleRows.length === 0}
                  aria-label="Select all eligible students on this page"
                />
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Student
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Student ID
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Current Balance
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Grant Amount
                <div className="mt-0.5 max-w-[160px] text-[11px] leading-tight font-normal text-text-muted">
                  이 이벤트에서 해당 학생이 받아야 하는 최종 토큰 수입니다.
                </div>
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Reason
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Granted By
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium whitespace-nowrap text-text-secondary">
                Granted At
              </th>
              <th scope="col" className="border-b border-border px-4 py-3 text-meta font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <GrantRow
                key={`${row.userId}-${row.grantUpdatedAt ?? "none"}`}
                tokenEventId={tokenEventId}
                row={row}
                isSelected={selectedUserIds.has(row.userId)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <EmptyState
            message={hasActiveFilters ? "조건에 맞는 학생이 없습니다." : "표시할 학생이 없습니다."}
          />
        )}
      </div>

      {detail.pagination.total > 0 && (
        <Pagination
          page={detail.pagination.page}
          totalPages={detail.pagination.totalPages}
          total={detail.pagination.total}
          itemLabel="students"
          onPageChange={onPageChange}
        />
      )}

      {selectedCount > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-4 rounded-surface border border-border bg-surface-muted p-4">
          <p className="text-body font-medium text-text-primary">{selectedCount} students selected</p>
          <div>
            <label htmlFor="bulk-grant-amount" className="text-meta font-medium text-text-secondary">
              Grant Amount
            </label>
            <Input
              id="bulk-grant-amount"
              type="number"
              min={0}
              step={1}
              value={bulkAmount}
              onChange={(event) => setBulkAmount(event.target.value)}
              className="mt-1 w-24"
            />
          </div>
          <div>
            <label htmlFor="bulk-reason" className="text-meta font-medium text-text-secondary">
              Reason
            </label>
            <div className="mt-1">
              <ReasonCombobox id="bulk-reason" value={bulkReason} onChange={setBulkReason} className="w-48" />
            </div>
          </div>
          <Button onClick={handleOpenBulkConfirm}>Save Grants</Button>
        </div>
      )}

      <ConfirmDialog
        open={isBulkConfirmOpen}
        onOpenChange={setIsBulkConfirmOpen}
        title="Confirm Token Grants"
        description={`선택한 ${selectedCount}명의 Grant Amount를 각각 ${bulkAmountNumber} Tokens로 설정하시겠습니까?`}
        confirmLabel="Save Grants"
        onConfirm={handleBulkSave}
        isConfirming={saveGrants.isPending}
      >
        <div className="space-y-1 text-body text-text-primary">
          <p>Reason: {bulkReason}</p>
          <p>Total Grant Amount: {totalGrantAmount} Tokens</p>
        </div>
        <p className="mt-3 text-meta text-text-secondary">
          Grant Amount는 이 이벤트에서 각 학생이 받아야 하는 최종 토큰 수입니다.
        </p>
      </ConfirmDialog>
    </div>
  );
}
