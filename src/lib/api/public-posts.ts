import { apiFetch } from "@/lib/api/client";
import type { ListResponse, PublicPostDetail, PublicPostListItem, PublicPostsListParams } from "@/types/api";

function buildQueryString(params: PublicPostsListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// GET /posts -- public "News List" / "Home News Preview" (docs/user/api-contract.md).
// No Authorization header -- this is a public endpoint. `params` also
// supports `keyword`/`category` for the News List page; Home's preview
// usage (`{ page: 1, limit: 3 }`) is unaffected since those fields stay
// optional.
export function getPublicPosts(params: PublicPostsListParams) {
  return apiFetch<ListResponse<PublicPostListItem>>(`/posts${buildQueryString(params)}`);
}

// GET /posts/{postId} -- public "News Detail". No Authorization header.
export function getPublicPost(postId: string) {
  return apiFetch<PublicPostDetail>(`/posts/${postId}`);
}
