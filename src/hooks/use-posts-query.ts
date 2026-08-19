"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { getPosts } from "@/lib/api/posts";
import type { PostsListParams } from "@/types/api";

export function usePostsQuery(params: PostsListParams) {
  return useQuery({
    queryKey: ["posts", "list", params],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getPosts(params, accessToken);
    },
    placeholderData: keepPreviousData,
  });
}
