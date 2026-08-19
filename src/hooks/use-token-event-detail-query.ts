"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import {
  deleteTokenEvent,
  getTokenEventDetail,
  renameTokenEvent,
  saveGrants,
} from "@/lib/api/token-events";
import type {
  RenameTokenEventPayload,
  SaveGrantsPayload,
  TokenEventDetailParams,
} from "@/types/api";

function detailKey(tokenEventId: string, params?: TokenEventDetailParams) {
  return params
    ? (["token-events", "detail", tokenEventId, params] as const)
    : (["token-events", "detail", tokenEventId] as const);
}

export function useTokenEventDetailQuery(tokenEventId: string, params: TokenEventDetailParams) {
  return useQuery({
    queryKey: detailKey(tokenEventId, params),
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getTokenEventDetail(tokenEventId, params, accessToken);
    },
    // Keep the previous page/keyword/grantStatus result on screen while the
    // next one loads -- without this, every keystroke-driven keyword change
    // was treated as a brand new query with no data yet, which flipped
    // isLoading back to true and tore down the whole detail page (including
    // the search input itself, losing focus) instead of just the table.
    placeholderData: keepPreviousData,
  });
}

// Shared by individual-row Save and the bulk action bar -- both send the
// same PATCH .../grants shape, just with a one-item or many-item array.
export function useSaveGrantsMutation(tokenEventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveGrantsPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return saveGrants(tokenEventId, payload, accessToken);
    },
    onSuccess: () => {
      // Balances/grant metadata/counts/timestamps all need to stay in sync
      // -- refetch detail, the events list (grantedMemberCount/lastGrantAt),
      // and Users (currentTokenBalance is the same balance shown there).
      queryClient.invalidateQueries({ queryKey: ["token-events", "detail", tokenEventId] });
      queryClient.invalidateQueries({ queryKey: ["token-events", "list"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRenameTokenEventMutation(tokenEventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RenameTokenEventPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return renameTokenEvent(tokenEventId, payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["token-events", "detail", tokenEventId] });
      queryClient.invalidateQueries({ queryKey: ["token-events", "list"] });
    },
  });
}

export function useDeleteTokenEventMutation(tokenEventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return deleteTokenEvent(tokenEventId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["token-events", "list"] });
    },
  });
}
