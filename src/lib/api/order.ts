import { apiFetch } from "@/lib/api/client";
import type { CreateOrderPayload, CreateOrderResult } from "@/types/api";

// POST /orders -- docs/user/api-contract.md "Page 8 — Order Confirmation".
// Authenticated (the ordering member's own action). `idempotencyKey` is
// sent as the confirmed `Idempotency-Key` header -- one purchase intent
// must correspond to exactly one key; see useCreateOrderMutation /
// OrderConfirmationModal for the lifecycle that generates/reuses it.
export function createOrder(payload: CreateOrderPayload, accessToken: string, idempotencyKey: string) {
  return apiFetch<CreateOrderResult>("/orders", {
    method: "POST",
    body: payload,
    accessToken,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}
