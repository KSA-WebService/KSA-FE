"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getActionLog, getActionLogs } from "@/lib/api/action-logs";
import type { ActionLogsListParams } from "@/types/api";

export function useActionLogsQuery(params: ActionLogsListParams) {
  return useQuery({
    queryKey: ["action-logs", "list", params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getActionLogs(params, accessToken);
    },
    placeholderData: keepPreviousData,
  });
}

export function useActionLogQuery(logId: string) {
  return useQuery({
    queryKey: ["action-logs", "detail", logId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getActionLog(logId, accessToken);
    },
  });
}
