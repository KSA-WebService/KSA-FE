import type { TokenTransactionType } from "@/types/api";

// docs/user/user-ui.md "Page 4 — My Page" "Token History Table"
// "Transaction Type" -- the documented wording is used here (이벤트 지급 /
// 이벤트 조정 / 잔액 초기화) rather than this phase's own restated
// "recommended" labels (which used "토큰" instead of "이벤트"/"잔액") --
// the documented wording is more precise per the instruction to prefer it
// when both exist.
export const TRANSACTION_TYPE_LABELS: Record<TokenTransactionType, string> = {
  event_grant: "이벤트 지급",
  event_adjustment: "이벤트 조정",
  order_payment: "주문 결제",
  order_refund: "주문 환불",
  reset: "잔액 초기화",
};

// docs/user/user-ui.md "Token History Table" "Delta": positive values
// include "+", negative values retain "-", zero shows no direction.
// "Tokens" suffix per this phase's explicit examples ("+30 Tokens").
export function formatTokenDeltaAmount(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function formatTokenDelta(delta: number): string {
  return `${formatTokenDeltaAmount(delta)} Tokens`;
}
