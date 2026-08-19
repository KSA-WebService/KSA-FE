"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useDeleteWhitelistMutation,
  useResendInvitationMutation,
  useSendInvitationMutation,
  useWhitelistDetailQuery,
} from "@/hooks/use-whitelist-detail-query";
import { PageHeader } from "@/components/admin/page-header";
import { DateTime } from "@/components/admin/date-time";
import { InvitationStatusBadge } from "@/components/admin/whitelist-status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/lib/utils";
import type { WhitelistDetail } from "@/types/api";

// docs/admin/admin-ui.md §6 "Invitation Action Mapping".
function getInvitationAction(detail: WhitelistDetail): "send" | "resend" | null {
  if (detail.userId) return null;
  if (detail.invitationStatus === "pending") return "send";
  if (
    detail.invitationStatus === "invited" ||
    detail.invitationStatus === "expired" ||
    detail.invitationStatus === "failed"
  ) {
    return "resend";
  }
  return null;
}

export function WhitelistDetailContent({ whitelistUserId }: { whitelistUserId: string }) {
  const router = useRouter();
  const { data: detail, isLoading, isError, refetch } = useWhitelistDetailQuery(whitelistUserId);
  const sendInvitation = useSendInvitationMutation(whitelistUserId);
  const resendInvitation = useResendInvitationMutation(whitelistUserId);
  const deleteWhitelist = useDeleteWhitelistMutation(whitelistUserId);

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="px-8 pt-8 pb-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-9 w-80" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="px-8 pt-8 pb-8">
        <ErrorState
          message="화이트리스트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const action = getInvitationAction(detail);

  function handleSend() {
    sendInvitation.mutate(undefined, {
      onSuccess: (response) => {
        // A batch response can be top-level successful while this specific
        // item failed -- inspect the row result, not just resultType.
        const item = response.results.find((row) => row.whitelistUserId === whitelistUserId);
        if (item?.sendStatus === "sent") {
          setIsSendOpen(false);
          toast.success("초대 이메일을 보냈습니다.");
        } else {
          toast.error("초대 이메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      },
      onError: () => {
        toast.error("초대 이메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
      },
    });
  }

  function handleResend() {
    resendInvitation.mutate(undefined, {
      onSuccess: (response) => {
        const item = response.results.find((row) => row.whitelistUserId === whitelistUserId);
        if (item?.sendStatus === "resent") {
          setIsResendOpen(false);
          toast.success("초대 이메일을 다시 보냈습니다.");
        } else {
          toast.error("초대 이메일을 다시 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      },
      onError: () => {
        toast.error("초대 이메일을 다시 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
      },
    });
  }

  function handleDelete() {
    deleteWhitelist.mutate(undefined, {
      onSuccess: () => {
        toast.success("화이트리스트에서 학생이 삭제되었습니다.");
        router.push("/admin/whitelist");
      },
      onError: () => {
        toast.error("화이트리스트 항목을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
      },
    });
  }

  return (
    <div className="px-8 pt-8 pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
      >
        ← Back to Whitelist
      </button>

      <PageHeader title="Whitelist Details" description={detail.name} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-surface border border-border bg-surface p-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Student Information</h2>
          <dl className="mt-4 space-y-3">
            <Field label="Name" value={detail.name} />
            <Field label="Student ID" value={detail.studentNumber} />
            <Field label="Email" value={detail.email} />
          </dl>
        </section>

        <section className="rounded-surface border border-border bg-surface p-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Invitation Information</h2>
          <dl className="mt-4 space-y-3">
            <Field label="Invitation Status" value={<InvitationStatusBadge status={detail.invitationStatus} />} />
            <Field label="Invited By" value={detail.invitedBy?.name ?? "—"} />
            <Field label="Invited At" value={<DateTime value={detail.invitedAt} />} />
            <Field
              label="Link Status"
              value={detail.latestInvitation ? toTitleCase(detail.latestInvitation.linkStatus) : "Not Sent"}
            />
            <Field
              label="Expires At"
              value={detail.latestInvitation ? <DateTime value={detail.latestInvitation.expiresAt} /> : "—"}
            />
            <Field label="Accepted At" value={<DateTime value={detail.acceptedAt} />} />
          </dl>

          {action === "send" && (
            <Button className="mt-4" onClick={() => setIsSendOpen(true)}>
              Send Invitation
            </Button>
          )}
          {action === "resend" && (
            <Button className="mt-4" onClick={() => setIsResendOpen(true)}>
              Resend Invitation
            </Button>
          )}
        </section>

        <section className="rounded-surface border border-border bg-surface p-6 lg:col-span-2">
          <h2 className="text-section-heading font-semibold text-text-primary">Record Information</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Added At" value={<DateTime value={detail.createdAt} />} />
            <Field label="Updated At" value={<DateTime value={detail.updatedAt} />} />
          </dl>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        title="Send Invitation"
        description={`${detail.name}에게 초대 이메일을 보내시겠습니까?`}
        confirmLabel="Send Invitation"
        onConfirm={handleSend}
        isConfirming={sendInvitation.isPending}
      >
        <p className="text-meta text-text-secondary">{detail.email}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={isResendOpen}
        onOpenChange={setIsResendOpen}
        title="Resend Invitation"
        description={
          <>
            {detail.name}에게 초대 이메일을 다시 보내시겠습니까?
            <br />
            재발송이 완료되면 이전 초대 링크는 더 이상 사용할 수 없습니다.
          </>
        }
        confirmLabel="Resend Invitation"
        onConfirm={handleResend}
        isConfirming={resendInvitation.isPending}
      >
        <p className="text-meta text-text-secondary">{detail.email}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Whitelist Entry"
        description={
          <>
            이 학생을 화이트리스트에서 삭제하시겠습니까?
            <br />
            활성 초대 링크가 있다면 더 이상 사용할 수 없습니다.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isConfirming={deleteWhitelist.isPending}
      >
        <p className="text-meta text-text-secondary">
          {detail.name} · {detail.email}
        </p>
      </ConfirmDialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-meta font-medium text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-body text-text-primary">{value}</dd>
    </div>
  );
}
