"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPublicPosts } from "@/lib/api/public-posts";
import type { PublicPostsListParams } from "@/types/api";

// Public endpoint -- no Supabase access token needed, unlike the admin
// posts/products query hooks this mirrors.
export function usePublicPostsQuery(params: PublicPostsListParams) {
  return useQuery({
    queryKey: ["public-posts", "list", params],
    queryFn: () => getPublicPosts(params),
    placeholderData: keepPreviousData,
  });
}
