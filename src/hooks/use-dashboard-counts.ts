"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getNewOrdersCount, getTotalPostsCount, getTotalUsersCount } from "@/lib/api/dashboard";

function useDashboardCount(key: string, fetchCount: (accessToken: string) => Promise<number>) {
  return useQuery({
    queryKey: ["dashboard", key],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return fetchCount(accessToken);
    },
  });
}

// Independent per-card queries so one failing count never blocks the other
// two -- docs/admin/admin-ui.md §2 "Error Handling".
export function useNewOrdersCount() {
  return useDashboardCount("newOrders", getNewOrdersCount);
}

export function useTotalPostsCount() {
  return useDashboardCount("totalPosts", getTotalPostsCount);
}

export function useTotalUsersCount() {
  return useDashboardCount("totalUsers", getTotalUsersCount);
}
