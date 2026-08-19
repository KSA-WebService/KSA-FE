import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { PostCategory, PostStatus } from "@/types/api";
import { POST_CATEGORY_LABELS } from "@/lib/post-form";

// docs/admin/admin-ui.md §7 label mappings.
export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

const POST_STATUS_TONES: Record<PostStatus, BadgeTone> = {
  draft: "neutral",
  published: "success",
  hidden: "warning",
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return <Badge tone={POST_STATUS_TONES[status]}>{POST_STATUS_LABELS[status]}</Badge>;
}

export function AccessBadge({ membersOnly }: { membersOnly: boolean }) {
  return <Badge tone={membersOnly ? "brand" : "neutral"}>{membersOnly ? "Members Only" : "Public"}</Badge>;
}

export function CategoryBadge({ category }: { category: PostCategory }) {
  return <Badge tone="neutral">{POST_CATEGORY_LABELS[category]}</Badge>;
}
