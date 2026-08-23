"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMyTokenLogs } from "@/lib/api/my-token-logs";
import { useUserSession } from "@/providers/user-session-provider";
import type { MyTokenLogsParams } from "@/types/api";

// docs/user/api-contract.md "Page 4 — My Page" §3. Key family
// ["users", "me", userId, "token-logs", ...] -- same rationale as
// useMyOrdersQuery: nests under Phase 4's existing ["users", "me"]
// invalidation prefix, and includes `userId` (never the access token) for
// per-user cache isolation.
export function useMyTokenLogsQuery(params: MyTokenLogsParams) {
  const { session } = useUserSession();
  const accessToken = session?.access_token;
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["users", "me", userId, "token-logs", params],
    queryFn: () => getMyTokenLogs(params, accessToken!),
    enabled: Boolean(accessToken && userId),
    placeholderData: keepPreviousData,
  });
}
