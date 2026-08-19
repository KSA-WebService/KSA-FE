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
import { useCreateWhitelistMutation } from "@/hooks/use-whitelist-query";
import { ApiError } from "@/lib/api/client";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FieldErrors {
  name?: string;
  studentNumber?: string;
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// docs/admin/admin-ui.md §5.1 "Add Student Modal". No second confirmation
// -- this is a low-risk, reversible action.
export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const createWhitelist = useCreateWhitelistMutation();

  function resetAndClose() {
    if (createWhitelist.isPending) return;
    setName("");
    setStudentNumber("");
    setEmail("");
    setFieldErrors({});
    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createWhitelist.isPending) return;

    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (!studentNumber.trim()) nextErrors.studentNumber = "학번을 입력해주세요.";
    if (!email.trim()) {
      nextErrors.email = "이메일을 입력해주세요.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createWhitelist.mutate(
      { name: name.trim(), studentNumber: studentNumber.trim(), email: email.trim() },
      {
        onSuccess: () => {
          toast.success("화이트리스트에 학생이 추가되었습니다.");
          resetAndClose();
        },
        onError: (error) => {
          // Duplicate errors: keep the modal open and preserve entered
          // values so the administrator can correct them.
          if (error instanceof ApiError) {
            if (error.errorCode === "W409_EMAIL") {
              setFieldErrors((prev) => ({ ...prev, email: "이미 화이트리스트에 등록된 이메일입니다." }));
              return;
            }
            if (error.errorCode === "W409_STUDENT_NUMBER") {
              setFieldErrors((prev) => ({
                ...prev,
                studentNumber: "이미 화이트리스트에 등록된 학번입니다.",
              }));
              return;
            }
          }
          toast.error("학생을 화이트리스트에 추가하지 못했습니다. 잠시 후 다시 시도해주세요.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && resetAndClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="student-name" className="text-meta font-medium text-text-secondary">
              Name
            </label>
            <Input
              id="student-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              disabled={createWhitelist.isPending}
              className="mt-1"
            />
            {fieldErrors.name && <p className="mt-1 text-meta text-destructive">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="student-number" className="text-meta font-medium text-text-secondary">
              Student ID
            </label>
            <Input
              id="student-number"
              value={studentNumber}
              onChange={(event) => {
                setStudentNumber(event.target.value);
                setFieldErrors((prev) => ({ ...prev, studentNumber: undefined }));
              }}
              disabled={createWhitelist.isPending}
              className="mt-1"
            />
            {fieldErrors.studentNumber && (
              <p className="mt-1 text-meta text-destructive">{fieldErrors.studentNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="student-email" className="text-meta font-medium text-text-secondary">
              Email
            </label>
            <Input
              id="student-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={createWhitelist.isPending}
              className="mt-1"
            />
            {fieldErrors.email && <p className="mt-1 text-meta text-destructive">{fieldErrors.email}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={resetAndClose} disabled={createWhitelist.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWhitelist.isPending}>
              {createWhitelist.isPending ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
