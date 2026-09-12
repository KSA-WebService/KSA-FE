"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateWhitelistMutation } from "@/hooks/use-whitelist-detail-query";
import { ApiError } from "@/lib/api/client";
import type { UpdateWhitelistPayload, WhitelistDetail } from "@/types/api";

interface EditWhitelistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: WhitelistDetail;
}

interface FieldErrors {
  name?: string;
  studentNumber?: string;
  email?: string;
  reason?: string;
}

const CONNECT_EMAIL_PATTERN = /^[^@\s]+@connect\.ust\.hk$/i;

export function EditWhitelistDialog({
  open,
  onOpenChange,
  detail,
}: EditWhitelistDialogProps) {
  if (!open) return null;

  return (
    <EditWhitelistDialogOpen detail={detail} onOpenChange={onOpenChange} />
  );
}

function EditWhitelistDialogOpen({
  detail,
  onOpenChange,
}: {
  detail: WhitelistDetail;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(detail.name);
  const [studentNumber, setStudentNumber] = useState(detail.studentNumber);
  const [email, setEmail] = useState(detail.email);
  const [reason, setReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const updateWhitelist = useUpdateWhitelistMutation(detail.whitelistUserId);

  const normalizedName = name.trim();
  const normalizedStudentNumber = studentNumber.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const nameChanged = normalizedName !== detail.name;
  const studentNumberChanged = normalizedStudentNumber !== detail.studentNumber;
  const emailChanged = normalizedEmail !== detail.email.toLowerCase();

  const hasChanges = nameChanged || studentNumberChanged || emailChanged;

  function closeDialog() {
    if (updateWhitelist.isPending) return;

    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (updateWhitelist.isPending) return;

    const nextErrors: FieldErrors = {};

    if (!normalizedName) {
      nextErrors.name = "이름을 입력해주세요.";
    }

    if (!normalizedStudentNumber) {
      nextErrors.studentNumber = "학번을 입력해주세요.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "이메일을 입력해주세요.";
    } else if (!CONNECT_EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email =
        "HKUST Connect 이메일(@connect.ust.hk)을 입력해주세요.";
    }

    if (!reason.trim()) {
      nextErrors.reason = "수정 사유를 입력해주세요.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (!hasChanges) {
      toast.error("변경된 학생 정보가 없습니다.");
      return;
    }

    const payload: UpdateWhitelistPayload = {
      reason: reason.trim(),
    };

    if (nameChanged) {
      payload.name = normalizedName;
    }

    if (studentNumberChanged) {
      payload.studentNumber = normalizedStudentNumber;
    }

    if (emailChanged) {
      payload.email = normalizedEmail;
    }

    updateWhitelist.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);

        if (emailChanged) {
          if (detail.invitationStatus === "pending") {
            toast.success(
              "이메일이 수정되었습니다. 수정된 이메일로 초대장을 보내주세요.",
            );
          } else {
            toast.success(
              "이메일이 수정되었습니다. 기존 초대 링크는 더 이상 사용할 수 없습니다. 수정된 이메일로 초대장을 다시 보내주세요.",
            );
          }
          return;
        }

        toast.success("학생 정보가 수정되었습니다.");
      },

      onError: (error) => {
        if (error instanceof ApiError) {
          if (
            error.errorCode === "W409_EMAIL" ||
            error.errorCode === "U409_EMAIL"
          ) {
            setFieldErrors((prev) => ({
              ...prev,
              email: "이미 사용 중인 이메일입니다.",
            }));
            return;
          }

          if (
            error.errorCode === "W409_STUDENT_NUMBER" ||
            error.errorCode === "U409_STUDENT_NUMBER"
          ) {
            setFieldErrors((prev) => ({
              ...prev,
              studentNumber: "이미 사용 중인 학번입니다.",
            }));
            return;
          }

          if (error.errorCode === "W400_NO_CHANGES") {
            toast.error("변경된 학생 정보가 없습니다.");
            return;
          }

          if (error.errorCode === "W409_WHITELIST_USER_NOT_EDITABLE") {
            toast.error(
              "이미 가입이 완료된 학생의 화이트리스트 정보는 수정할 수 없습니다.",
            );
            onOpenChange(false);
            return;
          }
        }

        toast.error(
          "학생 정보를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      },
    });
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) closeDialog();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student Information</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="edit-whitelist-name"
              className="text-meta font-medium text-text-secondary"
            >
              Name
            </label>

            <Input
              id="edit-whitelist-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  name: undefined,
                }));
              }}
              disabled={updateWhitelist.isPending}
              className="mt-1"
            />

            {fieldErrors.name && (
              <p className="mt-1 text-meta text-destructive">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-whitelist-student-number"
              className="text-meta font-medium text-text-secondary"
            >
              Student ID
            </label>

            <Input
              id="edit-whitelist-student-number"
              value={studentNumber}
              onChange={(event) => {
                setStudentNumber(event.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  studentNumber: undefined,
                }));
              }}
              disabled={updateWhitelist.isPending}
              className="mt-1"
            />

            {fieldErrors.studentNumber && (
              <p className="mt-1 text-meta text-destructive">
                {fieldErrors.studentNumber}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-whitelist-email"
              className="text-meta font-medium text-text-secondary"
            >
              Email
            </label>

            <Input
              id="edit-whitelist-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  email: undefined,
                }));
              }}
              disabled={updateWhitelist.isPending}
              className="mt-1"
            />

            {fieldErrors.email && (
              <p className="mt-1 text-meta text-destructive">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-whitelist-reason"
              className="text-meta font-medium text-text-secondary"
            >
              Reason for correction
            </label>

            <Input
              id="edit-whitelist-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  reason: undefined,
                }));
              }}
              placeholder="Enter the reason for this correction"
              disabled={updateWhitelist.isPending}
              className="mt-1"
            />

            {fieldErrors.reason && (
              <p className="mt-1 text-meta text-destructive">
                {fieldErrors.reason}
              </p>
            )}
          </div>

          <p className="text-meta text-text-secondary">
            학생이 가입을 완료한 이후에는 이 화면에서 정보를 수정할 수 없습니다.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={closeDialog}
              disabled={updateWhitelist.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={updateWhitelist.isPending || !hasChanges}
            >
              {updateWhitelist.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
