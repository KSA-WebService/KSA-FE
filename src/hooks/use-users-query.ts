"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getUsers } from "@/lib/api/users";
import type { UsersListParams } from "@/types/api";

// Server-side pagination/filter/sort -- URL search params are the source of
// truth (see users-page-content.tsx), so `params` changing is what drives
// refetching here.
export function useUsersQuery(params: UsersListParams) {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getUsers(params, accessToken);
    },
    // Keep the previous page's rows on screen while the next page/filter
    // loads, instead of flashing back to a full skeleton every time.
    placeholderData: keepPreviousData,
  });
}
