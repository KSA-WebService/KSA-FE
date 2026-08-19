"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/supabase/client";
import { createPost, getPost, updatePost } from "@/lib/api/posts";
import type { PostCreatePayload, PostUpdatePayload } from "@/types/api";

function postDetailKey(postId: string) {
  return ["posts", "detail", postId] as const;
}

export function usePostDetailQuery(postId: string) {
  return useQuery({
    queryKey: postDetailKey(postId),
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return getPost(postId, accessToken);
    },
  });
}

export function useUpdatePostMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PostUpdatePayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      await updatePost(postId, payload, accessToken);
      // PATCH only returns a summary -- docs/admin/admin-ui.md §8 "Save
      // Behavior" requires refetching the full detail afterward.
      return getPost(postId, accessToken);
    },
    onSuccess: (freshDetail) => {
      queryClient.setQueryData(postDetailKey(postId), freshDetail);
      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
    },
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PostCreatePayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No active session.");
      return createPost(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
    },
  });
}
