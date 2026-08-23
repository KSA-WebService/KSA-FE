"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
import { useMyOrdersQuery } from "@/hooks/use-my-orders-query";
import { useMyTokenLogsQuery } from "@/hooks/use-my-token-logs-query";
import { useUserSession } from "@/providers/user-session-provider";
import { ApiRequestError } from "@/lib/api/client";
import { MemberSummaryCard, MemberSummarySkeleton } from "./member-summary-card";
import { OrderHistorySection } from "./order-history-section";
import { TokenHistorySection } from "./token-history-section";
import { SectionErrorState } from "@/components/user/section-states";
import { cn } from "@/lib/utils";

const ORDER_PAGE_SIZE = 10;
const TOKEN_PAGE_SIZE = 10;

type HistoryTab = "orders" | "tokens";

// Same defensive approach as News/Store's parsePage: only a positive
// integer is ever forwarded to the backend.
function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function isAuthError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 401;
}

// docs/user/user-ui.md "Page 4 — My Page". Both history queries are always
// mounted (not lazily gated by the active tab) so switching tabs is instant
// and each keeps its own independent page state -- only the active tab's
// table is actually rendered. `tab`/`orderPage`/`tokenPage` are distinct
// URL keys specifically so neither history section's pagination can
// overwrite the other's.
export function MyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading: isSessionLoading } = useUserSession();

  const tab: HistoryTab = searchParams.get("tab") === "tokens" ? "tokens" : "orders";
  const orderPage = parsePage(searchParams.get("orderPage"));
  const tokenPage = parsePage(searchParams.get("tokenPage"));

  const currentUserQuery = useCurrentUserQuery();
  const ordersQuery = useMyOrdersQuery({ page: orderPage, limit: ORDER_PAGE_SIZE });
  const tokenLogsQuery = useMyTokenLogsQuery({ page: tokenPage, limit: TOKEN_PAGE_SIZE });

  // The server-side check in page.tsx only guarantees a valid session at
  // the moment the page was requested. Two independent layers now watch
  // for it going stale after that:
  //
  // 1. UserSessionProvider reacts directly to Supabase auth-state changes,
  //    so `session` can become null (e.g. sign-out in another tab, a
  //    revoked session) before any backend request has even had a chance
  //    to return a 401 -- `localSessionLost` catches that case. Gated on
  //    `!isSessionLoading` so the initial resolve (session starts null
  //    before the provider's first getSession() call resolves) never
  //    reads as "logged out" and triggers a false redirect.
  // 2. `isAuthError` is the existing second layer -- a request that was in
  //    flight when the session went stale, or a 401 the backend returns
  //    for a reason the local session state doesn't yet reflect.
  const localSessionLost = !isSessionLoading && session === null;
  const sessionInvalid =
    localSessionLost ||
    isAuthError(currentUserQuery.error) ||
    isAuthError(ordersQuery.error) ||
    isAuthError(tokenLogsQuery.error);

  useEffect(() => {
    // replace(), not push() -- an authentication redirect away from an
    // already-mounted page shouldn't leave the now-inaccessible My Page in
    // browser history for "back" to return to.
    if (sessionInvalid) router.replace("/login");
  }, [sessionInvalid, router]);

  function updateParams(next: Record<string, string | number | undefined>) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") {
        nextSearchParams.delete(key);
      } else {
        nextSearchParams.set(key, String(value));
      }
    }
    const query = nextSearchParams.toString();
    router.push(query ? `/mypage?${query}` : "/mypage");
  }

  // Already redirecting -- don't flash a profile-error state on the way out.
  if (sessionInvalid) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-page-title font-semibold text-text-primary">My Page</h1>

      <div className="mt-8">
        {currentUserQuery.isPending && <MemberSummarySkeleton />}
        {currentUserQuery.isError && (
          <SectionErrorState
            message="회원 정보를 불러오지 못했습니다."
            onRetry={() => currentUserQuery.refetch()}
          />
        )}
        {currentUserQuery.data && <MemberSummaryCard user={currentUserQuery.data} />}
      </div>

      <div className="mt-10">
        <div role="tablist" aria-label="내역 종류" className="flex gap-6 border-b border-border">
          <TabButton
            active={tab === "orders"}
            onClick={() => updateParams({ tab: undefined })}
          >
            주문 내역
          </TabButton>
          <TabButton active={tab === "tokens"} onClick={() => updateParams({ tab: "tokens" })}>
            토큰 내역
          </TabButton>
        </div>

        <div className="mt-6">
          {tab === "orders" ? (
            <OrderHistorySection
              query={ordersQuery}
              onPageChange={(nextPage) => updateParams({ orderPage: nextPage })}
            />
          ) : (
            <TokenHistorySection
              query={tokenLogsQuery}
              onPageChange={(nextPage) => updateParams({ tokenPage: nextPage })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 pb-3 text-body font-medium transition-colors",
        active
          ? "border-brand-800 text-brand-800"
          : "border-transparent text-text-secondary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}
