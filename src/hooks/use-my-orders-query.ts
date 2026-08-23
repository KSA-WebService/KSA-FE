"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/lib/api/my-orders";
import { useUserSession } from "@/providers/user-session-provider";
import type { MyOrdersParams } from "@/types/api";

// docs/user/api-contract.md "Page 4 — My Page" §2. Key family
// ["users", "me", userId, "orders", ...] -- nests under the same
// ["users", "me"] prefix useCurrentUserQuery uses, so Phase 4's existing
// invalidateQueries({ queryKey: ["users", "me"] }) still covers this via
// prefix matching regardless of what comes after "me". Includes `userId`
// (never the access token) so a different authenticated user in the same
// browser session never shares this cache entry.
export function useMyOrdersQuery(params: MyOrdersParams) {
  const { session } = useUserSession();
  const accessToken = session?.access_token;
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["users", "me", userId, "orders", params],
    queryFn: () => getMyOrders(params, accessToken!),
    enabled: Boolean(accessToken && userId),
    placeholderData: keepPreviousData,
  });
}
