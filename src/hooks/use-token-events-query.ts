"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { createTokenEvent, getTokenEvents } from "@/lib/api/token-events";
import type { CreateTokenEventPayload, TokenEventsListParams } from "@/types/api";

const TOKEN_EVENTS_LIST_KEY = ["token-events", "list"] as const;

export function useTokenEventsQuery(params: TokenEventsListParams) {
  return useQuery({
    queryKey: [...TOKEN_EVENTS_LIST_KEY, params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getTokenEvents(params, accessToken);
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateTokenEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTokenEventPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return createTokenEvent(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOKEN_EVENTS_LIST_KEY });
    },
  });
}
