"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
import { useCreateOrderMutation, NoActiveSessionError } from "@/hooks/use-create-order-mutation";
import { useUserSession } from "@/providers/user-session-provider";
import { ApiError, ApiRequestError } from "@/lib/api/client";
import { PRODUCT_TYPE_LABELS } from "@/lib/user/product-labels";
import { ProductImage } from "@/components/user/product-image";
import { CopyButton } from "@/components/user/copy-button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CreateOrderResult, PublicProductListItem } from "@/types/api";

interface OrderConfirmationModalProps {
  product: PublicProductListItem;
  onClose: () => void;
}

// A small explicit local state model for the purchase attempt -- per
// docs/user/user-ui.md "Modal Close / Retry Safety": "do not over-engineer
// a complex state machine library for this modal."
//
//   idle      -- no attempt made yet, or the previous attempt was
//                conclusively rejected and quantity is free to change again
//   pending   -- request in flight; quantity locked, modal can't be closed
//   uncertain -- request finished with no reliable/conclusive result
//                (transport/format failure, or a well-formed 5xx); quantity
//                stays locked, only a same-key retry is offered, modal
//                can't be closed
//   rejected  -- a well-formed 4xx backend rejection; quantity unlocks
//                again, the NEXT "구매하기" press starts a genuinely new
//                intent
//   success   -- confirmed order result from the backend
type PurchaseAttempt =
  | { status: "idle" }
  | { status: "pending"; idempotencyKey: string; quantity: number }
  | { status: "uncertain"; idempotencyKey: string; quantity: number }
  | { status: "rejected"; message: string }
  | { status: "success"; result: CreateOrderResult };

// Confirmed 4xx order error codes (verified against
// src/orders/orders.controller.ts / orders.service.ts /
// dto/create-order.dto.ts). O500_ORDER_CREATE_FAILED is deliberately NOT
// mapped here -- a 5xx is classified as uncertain before this map is ever
// consulted (see classifyOrderError).
const ORDER_ERROR_MESSAGES: Record<string, string> = {
  O400_IDEMPOTENCY_KEY_REQUIRED: "주문 요청을 시작할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.",
  O400_IDEMPOTENCY_KEY_INVALID: "주문 요청을 시작할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.",
  O403_ORDER_NOT_ALLOWED: "현재 계정으로는 주문할 수 없습니다.",
  O404_PRODUCT_NOT_FOUND: "상품을 찾을 수 없습니다. 상품 목록을 다시 확인해주세요.",
  O409_PRODUCT_UNAVAILABLE: "현재 주문할 수 없는 상품입니다. 상품 상태를 다시 확인해주세요.",
  O409_INSUFFICIENT_STOCK: "상품 재고가 부족합니다. 수량을 줄여서 다시 시도해주세요.",
  O409_INSUFFICIENT_TOKENS: "보유 토큰이 부족합니다.",
  O409_ORDER_STATE_CONFLICT: "주문 중 상태가 변경되었습니다. 다시 시도해주세요.",
  O409_ORDER_CONCURRENT_UPDATE: "다른 주문과 동시에 처리되어 주문을 완료하지 못했습니다. 다시 시도해주세요.",
  O409_IDEMPOTENCY_KEY_REUSED: "주문 요청 정보가 변경되었습니다. 다시 시도해주세요.",
};
const ORDER_FAILURE_MESSAGE = "주문을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.";
const UNCERTAIN_MESSAGE =
  "주문 결과를 확인할 수 없습니다. 같은 주문으로 다시 시도해주세요. 이미 처리되었다면 중복 주문되지 않습니다.";

type OrderFailureClassification =
  | { kind: "auth" }
  | { kind: "rejected"; message: string; errorCode: string }
  | { kind: "uncertain" };

// Safety-oriented classification -- prioritizes duplicate-order prevention
// over a tidy error message. Only a well-formed 4xx ApiError is ever
// treated as conclusive; everything else (401 of any shape, a well-formed
// 5xx, a malformed response, a transport failure) is either an auth
// redirect or "uncertain", never an ordinary rejection eligible for a
// fresh idempotency key.
function classifyOrderError(error: unknown): OrderFailureClassification {
  if (error instanceof NoActiveSessionError) return { kind: "auth" };

  // A 401 can arrive as either ApiError (well-formed envelope) or
  // ApiResponseFormatError (e.g. a bare 401 from a proxy/guard, no
  // envelope at all) -- both extend ApiRequestError, so branch on the
  // shared base by status rather than assuming ApiError specifically.
  if (error instanceof ApiRequestError && error.status === 401) return { kind: "auth" };

  if (error instanceof ApiError) {
    // A well-formed 5xx (e.g. O500_ORDER_CREATE_FAILED) means the backend
    // itself failed while processing the order -- the client cannot
    // safely assume that means nothing was committed, so this must be
    // treated as uncertain, not a clean rejection safe to retry with a
    // fresh key.
    if (error.status >= 500) return { kind: "uncertain" };

    return {
      kind: "rejected",
      message: ORDER_ERROR_MESSAGES[error.errorCode] ?? ORDER_FAILURE_MESSAGE,
      errorCode: error.errorCode,
    };
  }

  // ApiResponseFormatError (non-401) / ApiTransportError / anything else
  // unexpected -- a response may or may not have been received, and even
  // if one was, its shape couldn't be trusted enough to read an errorCode
  // from it. Never conclusively reject in this case.
  return { kind: "uncertain" };
}

// docs/user/user-ui.md "Page 8 — Order Confirmation". Rendered only while a
// product is selected on the Store page (conditional mount, not an
// `open`-toggled always-mounted dialog) -- so every open is a fresh mount
// and quantity/attempt state naturally resets per purchase.
export function OrderConfirmationModal({ product, onClose }: OrderConfirmationModalProps) {
  const router = useRouter();
  const { session } = useUserSession();
  const { data: currentUser, isPending: isBalancePending } = useCurrentUserQuery();
  const createOrder = useCreateOrderMutation();

  const [quantity, setQuantity] = useState(1);
  const [attempt, setAttempt] = useState<PurchaseAttempt>({ status: "idle" });
  // Synchronous re-entry guard against two final-submit events firing
  // before React re-renders and disables the button -- state alone can't
  // catch that window, since both event handlers would still read the
  // same pre-click `attempt`/`quantity`. Claimed the instant a legitimate
  // click is accepted (before generating/reusing any idempotency key),
  // released once that attempt's request has conclusively settled.
  const submitGuardRef = useRef(false);

  const isPending = attempt.status === "pending";
  const isUncertain = attempt.status === "uncertain";
  const isSuccess = attempt.status === "success";
  const quantityLocked = isPending || isUncertain;

  const unitPrice = product.tokenPrice;
  const expectedCost = unitPrice * quantity;
  const currentBalance = currentUser?.tokenBalance;
  const expectedRemaining = currentBalance !== undefined ? currentBalance - expectedCost : undefined;
  const insufficientBalance = currentBalance !== undefined && expectedCost > currentBalance;

  function handleOpenChange(open: boolean) {
    if (open) return;
    // Never silently discard an in-flight or ambiguous purchase intent.
    if (isPending || isUncertain) return;
    onClose();
  }

  async function submit(idempotencyKey: string, submittedQuantity: number) {
    setAttempt({ status: "pending", idempotencyKey, quantity: submittedQuantity });

    try {
      const result = await createOrder.mutateAsync({
        payload: { productId: product.productId, quantity: submittedQuantity },
        idempotencyKey,
      });
      setAttempt({ status: "success", result });
    } catch (error) {
      const classification = classifyOrderError(error);

      if (classification.kind === "auth") {
        setAttempt({ status: "idle" });
        router.push("/login");
        return;
      }

      if (classification.kind === "rejected") {
        createOrder.invalidateForRejection(classification.errorCode);
        setAttempt({ status: "rejected", message: classification.message });
        return;
      }

      setAttempt({ status: "uncertain", idempotencyKey, quantity: submittedQuantity });
    } finally {
      // Only ever guards against a double-fire of the click that started
      // THIS attempt -- always safe to release once it has settled,
      // regardless of outcome. A retry of an "uncertain" attempt re-claims
      // this same ref for itself.
      submitGuardRef.current = false;
    }
  }

  function handleSubmit() {
    if (submitGuardRef.current) return;
    if (isPending || isUncertain || isSuccess) return;
    if (insufficientBalance || isBalancePending) return;
    if (!session) {
      router.push("/login");
      return;
    }

    // A brand-new purchase intent -- "idle" (first attempt) and "rejected"
    // (the previous attempt already conclusively finished as a failure)
    // both start fresh. Claim the guard, then generate exactly one UUID
    // v4 for this click.
    submitGuardRef.current = true;
    submit(crypto.randomUUID(), quantity);
  }

  function handleRetry() {
    if (submitGuardRef.current) return;
    if (attempt.status !== "uncertain") return;

    // Same frozen key + quantity -- never regenerate for a retry of the
    // same uncertain intent.
    submitGuardRef.current = true;
    submit(attempt.idempotencyKey, attempt.quantity);
  }

  function adjustQuantity(delta: number) {
    if (quantityLocked) return;
    setQuantity((current) => Math.max(1, current + delta));
    // The previous rejection was specific to a prior attempt -- clear it
    // once the user starts adjusting toward a new one.
    if (attempt.status === "rejected") setAttempt({ status: "idle" });
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent>
        {isSuccess ? (
          <SuccessView result={attempt.result} onClose={onClose} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>주문 확인</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4">
              <ProductImage image={product.image} alt={product.productName} className="w-24 shrink-0" />
              <div className="min-w-0">
                <p className="text-meta text-text-secondary">{PRODUCT_TYPE_LABELS[product.productType]}</p>
                <p className="text-body font-semibold text-text-primary">{product.productName}</p>
                <p className="mt-1 text-body text-text-primary">🪙 {unitPrice} Tokens</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-body text-text-secondary">수량</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantityLocked || quantity <= 1}
                  aria-label="수량 감소"
                  className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-text-primary transition-colors hover:bg-surface-muted disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-body font-semibold text-text-primary">{quantity}</span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantityLocked}
                  aria-label="수량 증가"
                  className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-text-primary transition-colors hover:bg-surface-muted disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-2 rounded-control bg-surface-muted px-4 py-3 text-body">
              <div className="flex justify-between">
                <span className="text-text-secondary">보유 토큰</span>
                <span className="text-text-primary">{isBalancePending ? "…" : currentBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">결제 토큰</span>
                <span className="text-text-primary">{expectedCost}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-text-secondary">예상 잔액</span>
                <span className={insufficientBalance ? "text-destructive" : "text-text-primary"}>
                  {expectedRemaining ?? "…"}
                </span>
              </div>
            </div>

            {insufficientBalance && (
              <p className="mt-3 text-meta text-destructive">보유 토큰이 부족합니다.</p>
            )}
            {attempt.status === "rejected" && (
              <p className="mt-3 text-meta text-destructive">{attempt.message}</p>
            )}
            {isUncertain && <p className="mt-3 text-meta text-warning">{UNCERTAIN_MESSAGE}</p>}
            {isPending && (
              <p className="mt-3 text-meta text-text-muted">처리가 완료될 때까지 창을 닫지 마세요.</p>
            )}

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => handleOpenChange(false)}
                disabled={isPending || isUncertain}
              >
                취소
              </Button>
              {isUncertain ? (
                <Button onClick={handleRetry} disabled={isPending}>
                  다시 시도
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isPending || isBalancePending || insufficientBalance}>
                  {isPending ? "구매 처리 중..." : "구매하기"}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessView({ result, onClose }: { result: CreateOrderResult; onClose: () => void }) {
  const router = useRouter();
  const shortOrderId = `${result.orderId.slice(0, 8)}…`;

  return (
    <>
      <DialogHeader>
        <DialogTitle>주문이 완료되었습니다.</DialogTitle>
      </DialogHeader>

      <div className="space-y-2 rounded-control bg-surface-muted px-4 py-3 text-body">
        <div className="flex justify-between">
          <span className="text-text-secondary">상품</span>
          <span className="text-text-primary">{result.product.productName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">수량</span>
          <span className="text-text-primary">{result.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">결제 토큰</span>
          <span className="text-text-primary">{result.totalAmount}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-text-secondary">잔여 토큰</span>
          <span className="text-text-primary">{result.remainingTokenBalance}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">주문번호</span>
          <span className="flex items-center gap-1.5 text-text-primary">
            {shortOrderId}
            <CopyButton value={result.orderId} label="주문번호 복사" />
          </span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={() => router.push("/mypage")}>
          주문 내역 보기
        </Button>
        <Button onClick={onClose}>확인</Button>
      </DialogFooter>
    </>
  );
}
