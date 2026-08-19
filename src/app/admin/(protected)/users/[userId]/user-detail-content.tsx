"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { useUpdateUserMutation, useUserDetailQuery } from "@/hooks/use-user-detail-query";
import { ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/page-header";
import { DateTime } from "@/components/admin/date-time";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/components/admin/status-badges";
import type { UserAccountStatus, UserRole } from "@/types/api";

const GENERIC_SAVE_ERROR = "변경사항을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
const GENERIC_LOAD_ERROR = "사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
const NOT_FOUND_ERROR = "사용자를 찾을 수 없습니다.";

// docs/admin/api-contract.md "Admin User Update" known errors.
const KNOWN_SAVE_ERRORS: Record<string, string> = {
  U403_SELF_ROLE_CHANGE_NOT_ALLOWED: "현재 로그인한 관리자 계정의 권한을 낮출 수 없습니다.",
  U403_SELF_BLOCK_NOT_ALLOWED: "현재 로그인한 관리자 계정은 차단할 수 없습니다.",
  U404_USER_NOT_FOUND: NOT_FOUND_ERROR,
};

interface Change {
  field: "role" | "status";
  from: string;
  to: string;
}

export function UserDetailContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { profile: currentAdmin } = useAdminAuth();
  const { data: detail, isLoading, isError, error, refetch } = useUserDetailQuery(userId);
  const updateUser = useUpdateUserMutation(userId);

  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [pendingStatus, setPendingStatus] = useState<UserAccountStatus | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // useMemo must run unconditionally (before the loading/error early
  // returns below), so it tolerates `detail` being undefined.
  const changes = useMemo<Change[]>(() => {
    if (!detail) return [];
    const result: Change[] = [];
    if (pendingRole && pendingRole !== detail.role) {
      result.push({ field: "role", from: USER_ROLE_LABELS[detail.role], to: USER_ROLE_LABELS[pendingRole] });
    }
    if (pendingStatus && pendingStatus !== detail.status) {
      result.push({
        field: "status",
        from: USER_STATUS_LABELS[detail.status],
        to: USER_STATUS_LABELS[pendingStatus],
      });
    }
    return result;
  }, [detail, pendingRole, pendingStatus]);

  if (isLoading) {
    return (
      <div className="px-8 pb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-9 w-80" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    const isNotFound = error instanceof ApiError && error.errorCode === "U404_USER_NOT_FOUND";

    return (
      <div className="px-8 pb-8">
        <ErrorState
          message={isNotFound ? NOT_FOUND_ERROR : GENERIC_LOAD_ERROR}
          onRetry={isNotFound ? undefined : () => refetch()}
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="text-body text-text-secondary transition-colors hover:text-brand-800"
          >
            ← Back to Users
          </button>
        </div>
      </div>
    );
  }

  const role = pendingRole ?? detail.role;
  const status = pendingStatus ?? detail.status;
  const isSelf = detail.userId === currentAdmin.userId;
  const hasChanges = changes.length > 0;

  function handleConfirm() {
    if (!detail) return;

    const payload: { role?: UserRole; status?: UserAccountStatus } = {};
    if (pendingRole && pendingRole !== detail.role) payload.role = pendingRole;
    if (pendingStatus && pendingStatus !== detail.status) payload.status = pendingStatus;

    updateUser.mutate(payload, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        setPendingRole(null);
        setPendingStatus(null);
        toast.success("사용자 정보가 저장되었습니다.");
      },
      onError: (mutationError) => {
        const message =
          mutationError instanceof ApiError
            ? (KNOWN_SAVE_ERRORS[mutationError.errorCode] ?? GENERIC_SAVE_ERROR)
            : GENERIC_SAVE_ERROR;
        toast.error(message);
      },
    });
  }

  return (
    <div className="px-8 pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-body text-text-secondary transition-colors hover:text-brand-800"
      >
        ← Back to Users
      </button>

      <PageHeader title="User Details" description={detail.name} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-surface border border-border bg-surface p-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Profile Information</h2>
          <dl className="mt-4 space-y-3">
            <Field label="Name" value={detail.name} />
            <Field label="Student ID" value={detail.studentNumber} />
            <Field label="Email" value={detail.email} />
            <Field label="Token Balance" value={String(detail.tokenBalance)} />
          </dl>
        </section>

        <section className="rounded-surface border border-border bg-surface p-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Account Management</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-meta font-medium text-text-secondary">Role</label>
              <Select value={role} onValueChange={(value) => setPendingRole(value as UserRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student" disabled={isSelf}>
                    Student
                  </SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-meta font-medium text-text-secondary">Status</label>
              <Select value={status} onValueChange={(value) => setPendingStatus(value as UserAccountStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked" disabled={isSelf}>
                    Blocked
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isSelf && (
              <p className="text-meta text-text-muted">
                현재 로그인한 관리자 계정의 권한을 낮추거나 차단할 수 없습니다.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-surface border border-border bg-surface p-6 lg:col-span-2">
          <h2 className="text-section-heading font-semibold text-text-primary">Consent &amp; Activity</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Privacy Consent" value={detail.agreedPrivacy ? "Agreed" : "Not Agreed"} />
            <Field label="Agreed At" value={<DateTime value={detail.agreedAt} />} />
            <Field label="Joined At" value={<DateTime value={detail.createdAt} />} />
            <Field label="Updated At" value={<DateTime value={detail.updatedAt} />} />
          </dl>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setIsConfirmOpen(true)} disabled={!hasChanges || updateUser.isPending}>
          Save Changes
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Changes"
        description="다음 변경사항을 저장하시겠습니까?"
        confirmLabel="Save Changes"
        onConfirm={handleConfirm}
        isConfirming={updateUser.isPending}
      >
        <ul className="space-y-1 text-body text-text-primary">
          {changes.map((change) => (
            <li key={change.field}>
              {change.field === "role" ? "Role" : "Status"}: {change.from} → {change.to}
            </li>
          ))}
        </ul>
        {changes.some((change) => change.field === "role") && (
          <p className="mt-3 text-meta text-text-secondary">
            {pendingRole === "admin"
              ? "이 사용자는 관리자 권한을 갖게 됩니다."
              : "이 사용자의 관리자 권한이 제거됩니다."}
          </p>
        )}
        {changes.some((change) => change.field === "status") && (
          <p className="mt-1 text-meta text-text-secondary">
            {pendingStatus === "blocked"
              ? "차단된 사용자는 로그인 후 KSA의 인증이 필요한 기능을 사용할 수 없습니다."
              : "이 사용자의 계정 접근 권한이 다시 활성화됩니다."}
          </p>
        )}
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
