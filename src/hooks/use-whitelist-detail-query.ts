"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import {
  deleteWhitelistEntry,
  getWhitelistDetail,
  resendInvitations,
  sendInvitations,
} from "@/lib/api/whitelist";

function detailKey(whitelistUserId: string) {
  return ["whitelist", "detail", whitelistUserId] as const;
}

export function useWhitelistDetailQuery(whitelistUserId: string) {
  return useQuery({
    queryKey: detailKey(whitelistUserId),
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getWhitelistDetail(whitelistUserId, accessToken);
    },
  });
}

export function useSendInvitationMutation(whitelistUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return sendInvitations([whitelistUserId], accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailKey(whitelistUserId) });
    },
  });
}

export function useResendInvitationMutation(whitelistUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return resendInvitations([whitelistUserId], accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailKey(whitelistUserId) });
    },
  });
}

export function useDeleteWhitelistMutation(whitelistUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return deleteWhitelistEntry(whitelistUserId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whitelist", "list"] });
    },
  });
}
