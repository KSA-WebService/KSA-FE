"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { createWhitelistEntry, getWhitelist, importWhitelistEntries } from "@/lib/api/whitelist";
import type { CreateWhitelistPayload, ImportWhitelistPayload, WhitelistListParams } from "@/types/api";

const WHITELIST_LIST_KEY = ["whitelist", "list"] as const;

export function useWhitelistQuery(params: WhitelistListParams) {
  return useQuery({
    queryKey: [...WHITELIST_LIST_KEY, params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getWhitelist(params, accessToken);
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateWhitelistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWhitelistPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return createWhitelistEntry(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WHITELIST_LIST_KEY });
    },
  });
}

export function useImportWhitelistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ImportWhitelistPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return importWhitelistEntries(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WHITELIST_LIST_KEY });
    },
  });
}
