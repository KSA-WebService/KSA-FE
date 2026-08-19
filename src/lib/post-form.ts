import type { PostCategory, PostDetail } from "@/types/api";
import { isoToHkLocalInputValue } from "@/lib/hk-datetime";

// Event dates are kept as <input type="datetime-local"> string values
// (Hong Kong wall-clock, "" when unset) throughout the form -- they only
// become timezone-aware ISO strings when building the API payload. Because
// these strings are fixed-width and zero-padded, plain string comparison
// is valid for ordering (used in validation below).
export interface PostFormValues {
  title: string;
  categories: PostCategory[];
  membersOnly: boolean;
  content: string;
  eventStartAt: string;
  eventEndAt: string;
  showOnCalendar: boolean;
}

export const EMPTY_POST_FORM_VALUES: PostFormValues = {
  title: "",
  categories: [],
  membersOnly: false,
  content: "",
  eventStartAt: "",
  eventEndAt: "",
  showOnCalendar: false,
};

export function postDetailToFormValues(detail: PostDetail): PostFormValues {
  return {
    title: detail.title,
    categories: detail.categories,
    membersOnly: detail.membersOnly,
    content: detail.content ?? "",
    eventStartAt: isoToHkLocalInputValue(detail.eventStartAt),
    eventEndAt: isoToHkLocalInputValue(detail.eventEndAt),
    showOnCalendar: detail.showOnCalendar,
  };
}

export interface PostFormErrors {
  title?: string;
  categories?: string;
  eventStart?: string;
  eventEnd?: string;
}

// docs/admin/admin-ui.md §8/§9 validation rules -- Korean strings are
// spec-confirmed except `title`, which the spec never gives an exact
// message for (only "Required"); the phrasing here follows the same
// "~을 입력해주세요." pattern used everywhere else in the doc.
export function validatePostForm(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "제목을 입력해주세요.";
  }
  if (values.categories.length === 0) {
    errors.categories = "카테고리를 하나 이상 선택해주세요.";
  }

  if (values.categories.includes("event")) {
    if (values.eventEndAt && !values.eventStartAt) {
      errors.eventStart = "시작 시간을 먼저 선택해주세요.";
    } else if (values.eventStartAt && values.eventEndAt && values.eventEndAt <= values.eventStartAt) {
      errors.eventEnd = "종료 시간은 시작 시간 이후여야 합니다.";
    }
    if (values.showOnCalendar && !values.eventStartAt) {
      errors.eventStart = "캘린더에 표시하려면 시작 시간을 선택해주세요.";
    }
  }

  return errors;
}

export const POST_CATEGORY_OPTIONS: { value: PostCategory; label: string }[] = [
  { value: "partnership", label: "Partnership" },
  { value: "event", label: "Event" },
  { value: "co_purchase", label: "Co-purchase" },
  { value: "career", label: "Career" },
  { value: "announcement", label: "Announcement" },
  { value: "alumni", label: "Alumni" },
];

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  partnership: "Partnership",
  event: "Event",
  co_purchase: "Co-purchase",
  career: "Career",
  announcement: "Announcement",
  alumni: "Alumni",
};
