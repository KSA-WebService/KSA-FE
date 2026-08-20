import type { PostCategory } from "@/types/api";

// docs/user/product.md / user-ui.md category label mappings. Deliberately
// separate from the admin console's POST_CATEGORY_LABELS (lib/post-form.ts)
// -- the admin labels are English ("Event", "Partnership", ...) while the
// public site uses Korean labels for every category except Alumni.
export const NEWS_CATEGORY_LABELS: Record<PostCategory, string> = {
  event: "행사",
  announcement: "공지",
  career: "커리어",
  partnership: "제휴",
  co_purchase: "공동구매",
  alumni: "Alumni",
};
