import type { OrderStatus } from "@/types/api";

// docs/user/user-ui.md "Page 4 — My Page" "Order Status Badges". Distinct
// from the admin console's ORDER_STATUS_LABELS
// (components/orders/order-status-badge.tsx), which are English
// ("Ordered", "Accepted", ...) -- same pattern as NEWS_CATEGORY_LABELS /
// PRODUCT_TYPE_LABELS being separate from their admin equivalents.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ordered: "주문 접수",
  accepted: "주문 확인",
  delivered: "전달 완료",
  canceled: "취소",
};
