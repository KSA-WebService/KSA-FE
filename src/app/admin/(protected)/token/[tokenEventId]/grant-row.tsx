"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReasonCombobox } from "@/components/admin/reason-combobox";
import { DateTime } from "@/components/admin/date-time";
import { useSaveGrantsMutation } from "@/hooks/use-token-event-detail-query";
import type { TokenGrantStudentRow } from "@/types/api";

const GENERIC_SAVE_ERROR = "토큰 지급 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";

interface GrantRowProps {
  tokenEventId: string;
  row: TokenGrantStudentRow;
  isSelected: boolean;
  onToggleSelect: (userId: string, selected: boolean) => void;
}

// Rendered with key={row.userId + row.grantUpdatedAt} by the parent table
// so this component only re-seeds its local edit state when THIS row's
// grant actually changes (e.g. after this row's own save, or a bulk save
// that included it) -- other rows mid-edit are left untouched by a refetch
// triggered elsewhere.
export function GrantRow({ tokenEventId, row, isSelected, onToggleSelect }: GrantRowProps) {
  const [grantedAmount, setGrantedAmount] = useState(String(row.grantedAmount ?? 0));
  const [reason, setReason] = useState(row.reason ?? "");
  const saveGrants = useSaveGrantsMutation(tokenEventId);

  const isEligible = row.grantEligibility === "eligible";
  const savedAmount = String(row.grantedAmount ?? 0);
  const savedReason = row.reason ?? "";
  const isDirty = grantedAmount !== savedAmount || reason !== savedReason;

  function handleSave() {
    if (saveGrants.isPending) return;

    const amount = Number(grantedAmount);
    if (!Number.isInteger(amount) || amount < 0) {
      toast.error("올바른 토큰 수를 입력해주세요.");
      return;
    }

    saveGrants.mutate(
      { grants: [{ userId: row.userId, grantedAmount: amount, reason: reason.trim() }] },
      {
        onSuccess: () => toast.success("토큰 지급 정보가 저장되었습니다."),
        onError: () => toast.error(GENERIC_SAVE_ERROR),
      },
    );
  }

  return (
    <tr className="border-t border-border transition-colors duration-150 hover:bg-surface-muted">
      <td className="px-4 py-3">
        {isEligible ? (
          <Checkbox
            checked={isSelected}
            onChange={(event) => onToggleSelect(row.userId, event.target.checked)}
            aria-label={`Select ${row.name}`}
          />
        ) : (
          <Badge tone="neutral">Adjustment Only</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="text-body text-text-primary">{row.name}</div>
        <div className="text-meta text-text-secondary">{row.email}</div>
      </td>
      <td className="px-4 py-3 text-body text-text-secondary">{row.studentNumber}</td>
      <td className="px-4 py-3 text-body font-medium text-text-primary">{row.currentTokenBalance}</td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min={0}
          step={1}
          value={grantedAmount}
          onChange={(event) => setGrantedAmount(event.target.value)}
          disabled={saveGrants.isPending}
          className="w-24"
        />
      </td>
      <td className="px-4 py-3">
        <ReasonCombobox value={reason} onChange={setReason} disabled={saveGrants.isPending} className="w-40" />
      </td>
      <td className="px-4 py-3 text-body text-text-secondary">{row.grantedBy?.name ?? "—"}</td>
      <td className="px-4 py-3 text-body text-text-secondary">
        <DateTime value={row.grantedAt} />
      </td>
      <td className="px-4 py-3">
        <Button variant="secondary" onClick={handleSave} disabled={!isDirty || saveGrants.isPending}>
          {saveGrants.isPending ? "Saving..." : "Save"}
        </Button>
      </td>
    </tr>
  );
}
