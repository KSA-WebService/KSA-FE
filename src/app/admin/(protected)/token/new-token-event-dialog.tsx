"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { useCreateTokenEventMutation } from "@/hooks/use-token-events-query";

interface NewTokenEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// docs/admin/admin-ui.md §10 "New Token Event Modal". A separate page is
// unnecessary because only one field is required.
export function NewTokenEventDialog({ open, onOpenChange }: NewTokenEventDialogProps) {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const createTokenEvent = useCreateTokenEventMutation();

  function resetAndClose() {
    if (createTokenEvent.isPending) return;
    setEventName("");
    setFieldError(undefined);
    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createTokenEvent.isPending) return;

    const trimmed = eventName.trim();
    if (!trimmed) {
      setFieldError("이벤트 이름을 입력해주세요.");
      return;
    }
    setFieldError(undefined);

    createTokenEvent.mutate(
      { eventName: trimmed },
      {
        onSuccess: (created) => {
          toast.success("토큰 이벤트가 생성되었습니다.");
          setEventName("");
          onOpenChange(false);
          router.push(`/admin/token/${created.tokenEventId}`);
        },
        onError: () => {
          // Preserve the entered event name for a recoverable failure.
          toast.error("토큰 이벤트를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && resetAndClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Token Event</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="token-event-name" className="text-meta font-medium text-text-secondary">
              Event Name
            </label>
            <Input
              id="token-event-name"
              value={eventName}
              onChange={(event) => {
                setEventName(event.target.value);
                setFieldError(undefined);
              }}
              disabled={createTokenEvent.isPending}
              className="mt-1"
            />
            {fieldError && <p className="mt-1 text-meta text-destructive">{fieldError}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={resetAndClose}
              disabled={createTokenEvent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTokenEvent.isPending}>
              {createTokenEvent.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
