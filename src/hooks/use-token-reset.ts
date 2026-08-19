"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getTokenResetPreview, resetTokenBalances } from "@/lib/api/token-reset";
import type { TokenResetPayload } from "@/types/api";

const RESET_PREVIEW_KEY = ["token-reset-preview"] as const;

// Loaded when the reset dialog opens (enabled only while it's open).
// refetchOnWindowFocus is disabled -- the dialog freezes whatever preview
// it first loads as an immutable baseline (see reset-tokens-dialog.tsx), so
// a background refetch silently swapping `data` underneath it would defeat
// that safety contract even though this hook's data isn't read directly
// for the comparison.
export function useTokenResetPreviewQuery(enabled: boolean) {
  return useQuery({
    queryKey: RESET_PREVIEW_KEY,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getTokenResetPreview(accessToken);
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

// Direct call (not the cached query above) for the immediate-before-submit
// recheck -- this must always be a genuinely fresh network call, compared
// point-in-time against what the dialog is currently showing, not a value
// that could be satisfied from cache.
export async function fetchLatestTokenResetPreview() {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("No active session.");
  return getTokenResetPreview(accessToken);
}

export function useResetTokenBalancesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TokenResetPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return resetTokenBalances(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESET_PREVIEW_KEY });
      // Token balances are reflected in the Users list/detail too.
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
