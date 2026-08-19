import { apiFetch } from "@/lib/api/client";
import type {
  ListResponse,
  PostCreatePayload,
  PostCreateResponse,
  PostDetail,
  PostListItem,
  PostUpdatePayload,
  PostUpdateResponse,
  PostsListParams,
} from "@/types/api";

function buildQueryString(params: PostsListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /admin/posts -- "Admin Posts List"
export function getPosts(params: PostsListParams, accessToken: string) {
  return apiFetch<ListResponse<PostListItem>>(`/admin/posts${buildQueryString(params)}`, {
    accessToken,
  });
}

// GET /admin/posts/{postId} -- "Admin Post Detail"
export function getPost(postId: string, accessToken: string) {
  return apiFetch<PostDetail>(`/admin/posts/${postId}`, { accessToken });
}

// POST /admin/posts -- "Admin Post Create"
export function createPost(payload: PostCreatePayload, accessToken: string) {
  return apiFetch<PostCreateResponse>("/admin/posts", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

// PATCH /admin/posts/{postId} -- "Admin Post Update". Response is a
// summary only -- callers must refetch getPost() after success.
export function updatePost(postId: string, payload: PostUpdatePayload, accessToken: string) {
  return apiFetch<PostUpdateResponse>(`/admin/posts/${postId}`, {
    method: "PATCH",
    body: payload,
    accessToken,
  });
}
