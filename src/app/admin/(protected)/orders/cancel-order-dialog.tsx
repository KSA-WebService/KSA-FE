"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateOrderStatusMutation } from "@/hooks/use-orders-query";
import type { OrderListItem } from "@/types/api";

interface CancelOrderDialogProps {
  order: OrderListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GENERIC_CANCEL_ERROR = "주문을 취소하지 못했습니다. 잠시 후 다시 시도해주세요.";

// docs/admin/admin-ui.md §16 "Cancel Order". Note the button labels are
// swapped from ConfirmDialog's defaults: the dismiss action is "Keep
// Order", the destructive confirm action is "Cancel Order".
export function CancelOrderDialog({ order, open, onOpenChange }: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const updateStatus = useUpdateOrderStatusMutation(order.orderId);

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (updateStatus.isPending) return;
      setReason("");
      setFieldError(undefined);
    }
    onOpenChange(next);
  }

  function handleConfirm() {
    if (updateStatus.isPending) return;

    const trimmed = reason.trim();
    if (!trimmed) {
      setFieldError("주문 취소 사유를 입력해주세요.");
      return;
    }

    updateStatus.mutate(
      { orderStatus: "canceled", cancellationReason: trimmed },
      {
        onSuccess: () => {
          toast.success("주문이 취소되었습니다.");
          handleOpenChange(false);
        },
        onError: () => {
          // Preserve the entered reason -- the dialog stays open for retry.
          toast.error(GENERIC_CANCEL_ERROR);
        },
      },
    );
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Cancel Order"
      confirmLabel="Cancel Order"
      cancelLabel="Keep Order"
      variant="destructive"
      onConfirm={handleConfirm}
      isConfirming={updateStatus.isPending}
    >
      <div className="space-y-1 text-body text-text-primary">
        <p>{order.product.productName}</p>
        <p>{order.customer.customerName}</p>
        <p>
          {order.quantity} × {order.unitPrice} Tokens = {order.totalAmount} Tokens
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="cancellation-reason" className="text-meta font-medium text-text-secondary">
          Cancellation Reason
        </label>
        <Textarea
          id="cancellation-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setFieldError(undefined);
          }}
          disabled={updateStatus.isPending}
          rows={3}
          className="mt-1"
        />
        {fieldError && <p className="mt-1 text-meta text-destructive">{fieldError}</p>}
      </div>

      <p className="mt-3 text-meta text-text-secondary">
        주문 취소 시 사용한 Tokens와 상품 재고가 복구됩니다.
      </p>
    </ConfirmDialog>
  );
}
