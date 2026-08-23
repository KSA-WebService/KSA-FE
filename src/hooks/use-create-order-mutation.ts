"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/lib/api/order";
import { useUserSession } from "@/providers/user-session-provider";
import type { CreateOrderPayload } from "@/types/api";

// Thrown when no active Supabase session exists locally -- distinct from
// anything the backend could produce, because createOrder() is never even
// called in this case (no request was ever sent). OrderConfirmationModal
// already checks for a session before generating a key/calling this
// mutation at all, so this is a defensive last line of defense, not the
// primary guard -- kept as its own type specifically so a caller can never
// mistake "we never sent a request" for an uncertain server-side outcome.
export class NoActiveSessionError extends Error {
  constructor() {
    super("No active session.");
    this.name = "NoActiveSessionError";
  }
}

interface CreateOrderVariables {
  payload: CreateOrderPayload;
  idempotencyKey: string;
}

// Confirmed order rejection codes whose data the frontend previewed
// speculatively before submission (docs/user/api-contract.md "Page 8 —
// Order Confirmation"): the balance/availability shown in the modal can be
// stale by the time the backend actually validates it.
const STALE_TOKEN_BALANCE_CODES = new Set(["O409_INSUFFICIENT_TOKENS"]);
const STALE_PRODUCT_CODES = new Set([
  "O404_PRODUCT_NOT_FOUND",
  "O409_PRODUCT_UNAVAILABLE",
  "O409_INSUFFICIENT_STOCK",
]);

// docs/user/api-contract.md "Page 8 — Order Confirmation". Reuses
// UserSessionProvider for the access token (same source as
// useCurrentUserQuery) -- no separate auth architecture.
export function useCreateOrderMutation() {
  const { session } = useUserSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ payload, idempotencyKey }: CreateOrderVariables) => {
      if (!session) throw new NoActiveSessionError();
      return createOrder(payload, session.access_token, idempotencyKey);
    },
    onSuccess: () => {
      // Focused invalidation rather than a full app-wide refresh -- keeps
      // the Header/current-user Token balance and the Store grid's
      // availability/stock display consistent with the order that was
      // just placed. My Orders / My Token Logs hooks don't exist yet (My
      // Page is a later phase), so there's nothing to invalidate for them.
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["public-products", "list"] });
    },
  });

  // Called by the modal for a conclusive (4xx) rejection whose specific
  // errorCode implies the frontend's pre-submit preview was stale --
  // refetches only the data that rejection reason actually concerns,
  // rather than always invalidating everything on every rejection.
  function invalidateForRejection(errorCode: string) {
    if (STALE_TOKEN_BALANCE_CODES.has(errorCode)) {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    }
    if (STALE_PRODUCT_CODES.has(errorCode)) {
      queryClient.invalidateQueries({ queryKey: ["public-products", "list"] });
    }
  }

  return { ...mutation, invalidateForRejection };
}
