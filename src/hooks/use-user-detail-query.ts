"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getUser, updateUser, type UpdateUserPayload } from "@/lib/api/users";

export function useUserDetailQuery(userId: string) {
  return useQuery({
    queryKey: ["users", "detail", userId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getUser(userId, accessToken);
    },
  });
}

export function useUpdateUserMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return updateUser(userId, payload, accessToken);
    },
    onSuccess: (updated) => {
      // docs/admin/admin-ui.md §4: "Replace the displayed user state with
      // the returned response" -- no refetch needed, and the Users list
      // (if the admin navigates back) should reflect the change too.
      queryClient.setQueryData(["users", "detail", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}
