"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/admin/copy-button";
import { DateTime } from "@/components/admin/date-time";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useUpdateOrderStatusMutation } from "@/hooks/use-orders-query";
import { CancelOrderDialog } from "./cancel-order-dialog";
import type { OrderListItem } from "@/types/api";

const COLUMN_COUNT = 7;

export function OrderRow({ order }: { order: OrderListItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeliverConfirmOpen, setIsDeliverConfirmOpen] = useState(false);
  const updateStatus = useUpdateOrderStatusMutation(order.orderId);

  function handleAccept() {
    if (updateStatus.isPending) return;
    updateStatus.mutate(
      { orderStatus: "accepted" },
      {
        onSuccess: () => toast.success("주문이 확인되었습니다."),
        onError: () => toast.error("주문을 확인 처리하지 못했습니다. 잠시 후 다시 시도해주세요."),
      },
    );
  }

  function handleMarkDelivered() {
    if (updateStatus.isPending) return;
    updateStatus.mutate(
      { orderStatus: "delivered" },
      {
        onSuccess: () => {
          setIsDeliverConfirmOpen(false);
          toast.success("주문이 전달 완료 처리되었습니다.");
        },
        onError: () => toast.error("주문을 전달 완료 처리하지 못했습니다. 잠시 후 다시 시도해주세요."),
      },
    );
  }

  return (
    <>
      <tr className="border-t border-border transition-colors duration-150 hover:bg-surface-muted">
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            className="text-text-muted transition-colors duration-150 hover:text-text-primary"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="text-body text-text-primary">{order.product.productName}</div>
          <div className="flex items-center gap-1 text-meta text-text-secondary">
            #{order.orderId.slice(0, 8)}
            <CopyButton value={order.orderId} label="Copy order ID" />
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="text-body text-text-primary">{order.customer.customerName}</div>
          <div className="text-meta text-text-secondary">
            {order.customer.studentNumber} · {order.customer.email}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="text-body font-medium text-text-primary">{order.totalAmount} Tokens</div>
          <div className="text-meta text-text-secondary">
            {order.quantity} × {order.unitPrice}
          </div>
        </td>
        <td className="px-4 py-3">
          <OrderStatusBadge status={order.orderStatus} />
        </td>
        <td className="px-4 py-3 text-body text-text-secondary">
          <DateTime value={order.orderedAt} />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {order.orderStatus === "ordered" && (
              <>
                <Button variant="secondary" onClick={handleAccept} disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? "Saving..." : "Accept"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsCancelOpen(true)}
                  disabled={updateStatus.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
            {order.orderStatus === "accepted" && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsDeliverConfirmOpen(true)}
                  disabled={updateStatus.isPending}
                >
                  Mark Delivered
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsCancelOpen(true)}
                  disabled={updateStatus.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-t border-border bg-surface-muted">
          <td colSpan={COLUMN_COUNT} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-meta font-medium text-text-secondary">Order Timeline</h3>
                <dl className="mt-2 space-y-1 text-body text-text-primary">
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Ordered At</dt>
                    <dd>
                      <DateTime value={order.orderedAt} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Accepted At</dt>
                    <dd>
                      <DateTime value={order.acceptedAt} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Delivered At</dt>
                    <dd>
                      <DateTime value={order.deliveredAt} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Canceled At</dt>
                    <dd>
                      <DateTime value={order.canceledAt} />
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-meta font-medium text-text-secondary">Cancellation</h3>
                <p className="mt-2 text-body text-text-primary">
                  {order.cancellationReason ?? "—"}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}

      <CancelOrderDialog order={order} open={isCancelOpen} onOpenChange={setIsCancelOpen} />

      <ConfirmDialog
        open={isDeliverConfirmOpen}
        onOpenChange={setIsDeliverConfirmOpen}
        title="Mark Order as Delivered"
        description="상품 지급이 완료되었는지 확인해주세요. 완료 처리 후 상태를 되돌릴 수 없습니다."
        confirmLabel="Mark Delivered"
        onConfirm={handleMarkDelivered}
        isConfirming={updateStatus.isPending}
      />
    </>
  );
}
