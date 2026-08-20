"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicPost } from "@/lib/api/public-posts";
import { ApiRequestError } from "@/lib/api/client";

// Public endpoint -- no Supabase access token needed. A confirmed 404 is a
// conclusive "this post doesn't exist" -- not worth the default retry
// backoff before the not-found state can show. Anything else (network,
// 5xx, malformed response) still gets a couple of retries.
export function usePublicPostQuery(postId: string) {
  return useQuery({
    queryKey: ["public-posts", "detail", postId],
    queryFn: () => getPublicPost(postId),
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
