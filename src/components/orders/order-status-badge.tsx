import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/api";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ordered: "Ordered",
  accepted: "Accepted",
  delivered: "Delivered",
  canceled: "Canceled",
};

const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  ordered: "info",
  accepted: "brand",
  delivered: "success",
  canceled: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
