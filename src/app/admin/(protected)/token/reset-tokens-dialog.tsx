"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DateTime } from "@/components/admin/date-time";
import {
  fetchLatestTokenResetPreview,
  useResetTokenBalancesMutation,
  useTokenResetPreviewQuery,
} from "@/hooks/use-token-reset";
import { TOKEN_RESET_CONFIRMATION_PHRASE, type TokenResetPreview } from "@/types/api";

interface ResetTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREVIEW_EXPIRED_MESSAGE =
  "토큰 잔액이 변경되어 Reset Preview가 만료되었습니다. 최신 내용을 다시 확인해주세요.";
const GENERIC_RESET_ERROR = "학생 토큰 잔액을 초기화하지 못했습니다. 잠시 후 다시 시도해주세요.";

// docs/admin/admin-ui.md §12 "Global Student Token Reset". The critical
// piece here is the "Frontend Preview Recheck": immediately before POSTing,
// re-fetch the preview and compare it against the baseline preview THIS
// dialog captured when it opened -- if either affectedMemberCount or
// totalResetAmount changed, never call the reset endpoint.
//
// That baseline must be immutable for the life of one open dialog: it is
// captured once into local state the first time the query resolves (not
// read live from the query on every render), so a background refetch
// (window focus, an unrelated invalidation elsewhere, etc.) can never
// silently move the goalposts out from under the comparison.
export function ResetTokensDialog({ open, onOpenChange }: ResetTokensDialogProps) {
  const [reason, setReason] = useState("");
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isRechecking, setIsRechecking] = useState(false);
  const [baselinePreview, setBaselinePreview] = useState<TokenResetPreview | null>(null);

  const preview = useTokenResetPreviewQuery(open);
  const resetTokenBalances = useResetTokenBalancesMutation();

  // Capture the baseline exactly once per open-dialog session, the first
  // time data arrives (including after a Retry from an error). React's
  // "adjust state during render" pattern -- guarded, so this only fires
  // once until clearAndClose() resets it for the next time the dialog opens.
  if (open && preview.data && !baselinePreview) {
    setBaselinePreview(preview.data);
  }

  const isBusy = isRechecking || resetTokenBalances.isPending;

  function clearAndClose() {
    setReason("");
    setConfirmationInput("");
    setBaselinePreview(null);
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    // Guards the X button, Escape, and overlay click alike -- all funnel
    // through this callback since the dialog is controlled.
    if (!next) {
      if (isBusy) return;
      clearAndClose();
      return;
    }
    onOpenChange(next);
  }

  const isConfirmationValid = confirmationInput === TOKEN_RESET_CONFIRMATION_PHRASE;
  const hasNothingToReset =
    baselinePreview?.affectedMemberCount === 0 && baselinePreview?.totalResetAmount === 0;
  const canSubmit =
    Boolean(baselinePreview) &&
    !hasNothingToReset &&
    Boolean(reason.trim()) &&
    isConfirmationValid &&
    !isBusy;

  async function handleReset() {
    if (!baselinePreview || !canSubmit) return;

    setIsRechecking(true);

    let latest;
    try {
      latest = await fetchLatestTokenResetPreview();
    } catch {
      setIsRechecking(false);
      toast.error(GENERIC_RESET_ERROR);
      return;
    }
    setIsRechecking(false);

    if (
      latest.affectedMemberCount !== baselinePreview.affectedMemberCount ||
      latest.totalResetAmount !== baselinePreview.totalResetAmount
    ) {
      clearAndClose();
      toast.error(PREVIEW_EXPIRED_MESSAGE);
      return;
    }

    resetTokenBalances.mutate(
      { confirmation: TOKEN_RESET_CONFIRMATION_PHRASE, reason: reason.trim() },
      {
        onSuccess: (result) => {
          clearAndClose();
          toast.success(
            `학생 토큰 잔액이 초기화되었습니다. (${result.affectedMemberCount}명의 학생, 총 ${result.totalResetAmount} Tokens)`,
          );
        },
        onError: () => {
          // Keep the dialog open with Reason/confirmation preserved --
          // clicking Reset Tokens again re-runs the recheck from scratch.
          toast.error(GENERIC_RESET_ERROR);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Student Tokens</DialogTitle>
        </DialogHeader>

        <p className="text-body text-destructive">
          모든 대상 학생의 현재 Token Balance가 0으로 초기화됩니다.
          <br />
          실행 후 자동으로 되돌릴 수 없습니다.
        </p>

        <div className="mt-4 rounded-control border border-border bg-surface-muted p-4">
          {preview.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ) : preview.isError ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-meta text-destructive">
                Reset Preview를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
              </p>
              <Button variant="secondary" onClick={() => preview.refetch()}>
                Retry
              </Button>
            </div>
          ) : baselinePreview ? (
            <>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-meta text-text-secondary">Affected Students</dt>
                  <dd className="text-section-heading font-semibold text-text-primary">
                    {baselinePreview.affectedMemberCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-meta text-text-secondary">Tokens to Reset</dt>
                  <dd className="text-section-heading font-semibold text-text-primary">
                    {baselinePreview.totalResetAmount}
                  </dd>
                </div>
                <div>
                  <dt className="text-meta text-text-secondary">Previewed At</dt>
                  <dd className="text-body text-text-primary">
                    <DateTime value={baselinePreview.previewedAt} />
                  </dd>
                </div>
              </dl>
              {hasNothingToReset && (
                <p className="mt-3 text-meta text-text-secondary">초기화할 학생 토큰이 없습니다.</p>
              )}
            </>
          ) : null}
        </div>

        <div className="mt-4">
          <label htmlFor="reset-reason" className="text-meta font-medium text-text-secondary">
            Reason
          </label>
          <Textarea
            id="reset-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isBusy || !baselinePreview || hasNothingToReset}
            rows={2}
            className="mt-1"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="reset-confirmation" className="text-meta font-medium text-text-secondary">
            Confirm
          </label>
          <p className="mt-1 text-meta text-text-secondary">아래 문구를 정확히 입력해주세요.</p>
          <p className="mt-1 rounded-control bg-surface-muted px-2 py-1 font-mono text-meta text-text-primary">
            {TOKEN_RESET_CONFIRMATION_PHRASE}
          </p>
          <Input
            id="reset-confirmation"
            value={confirmationInput}
            onChange={(event) => setConfirmationInput(event.target.value)}
            disabled={isBusy || !baselinePreview || hasNothingToReset}
            className="mt-1"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleReset} disabled={!canSubmit}>
            {isBusy ? "Resetting..." : "Reset Tokens"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
