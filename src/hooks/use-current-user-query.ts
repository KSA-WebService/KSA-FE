"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/me";
import { useUserSession } from "@/providers/user-session-provider";

// Resolves the authenticated member's profile (name, token balance, ...) for
// the shared Header and, later, My Page. Only runs once a Supabase session
// exists -- there is nothing to fetch for a logged-out visitor.
export function useCurrentUserQuery() {
  const { session } = useUserSession();
  const accessToken = session?.access_token;
  const userId = session?.user.id;

  // The query key identifies *which* cached profile this is (so different
  // authenticated users don't share a cache entry) -- it must not carry the
  // secret access token itself. The token is only ever passed to
  // getCurrentUser(), never included in the key.
  return useQuery({
    queryKey: ["users", "me", userId],
    queryFn: () => getCurrentUser(accessToken!),
    enabled: Boolean(accessToken && userId),
  });
}
