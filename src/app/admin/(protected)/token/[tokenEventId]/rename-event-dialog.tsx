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
import { useRenameTokenEventMutation } from "@/hooks/use-token-event-detail-query";

interface RenameEventDialogProps {
  tokenEventId: string;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameEventDialog({ tokenEventId, currentName, open, onOpenChange }: RenameEventDialogProps) {
  const [eventName, setEventName] = useState(currentName);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const renameTokenEvent = useRenameTokenEventMutation(tokenEventId);

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (renameTokenEvent.isPending) return;
      setEventName(currentName);
      setFieldError(undefined);
    }
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (renameTokenEvent.isPending) return;

    const trimmed = eventName.trim();
    if (!trimmed) {
      setFieldError("이벤트 이름을 입력해주세요.");
      return;
    }
    setFieldError(undefined);

    renameTokenEvent.mutate(
      { eventName: trimmed },
      {
        onSuccess: () => {
          toast.success("토큰 이벤트 이름이 변경되었습니다.");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("토큰 이벤트 이름을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Token Event</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="rename-event-name" className="text-meta font-medium text-text-secondary">
              Event Name
            </label>
            <Input
              id="rename-event-name"
              value={eventName}
              onChange={(event) => {
                setEventName(event.target.value);
                setFieldError(undefined);
              }}
              disabled={renameTokenEvent.isPending}
              className="mt-1"
            />
            {fieldError && <p className="mt-1 text-meta text-destructive">{fieldError}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={renameTokenEvent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={renameTokenEvent.isPending}>
              {renameTokenEvent.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
