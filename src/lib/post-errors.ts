// docs/admin/admin-ui.md §8 "Error Handling" -- shared between Post Edit and
// New Post (the New Post spec explicitly says to follow the same handling).
export const POST_ERROR_MESSAGES: Record<string, string> = {
  C404_CONTENT_POST_NOT_FOUND: "게시글을 찾을 수 없습니다.",
  C400_INVALID_EVENT_PERIOD: "종료 시간은 시작 시간 이후여야 합니다.",
  C400_EVENT_START_REQUIRED: "시작 시간을 먼저 선택해주세요.",
  C400_CALENDAR_START_REQUIRED: "캘린더에 표시하려면 시작 시간을 선택해주세요.",
  F409_FILE_NOT_AVAILABLE: "사용할 수 없는 이미지가 포함되어 있습니다. 이미지를 다시 확인해주세요.",
  F409_FILE_PURPOSE_MISMATCH: "게시글 이미지로 사용할 수 없는 파일입니다.",
  C409_CONTENT_POST_CONCURRENT_UPDATE: "다른 변경사항과 충돌했습니다. 최신 정보를 다시 불러온 후 다시 시도해주세요.",
};

export const GENERIC_POST_SAVE_ERROR = "게시글을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
export const GENERIC_POST_CREATE_ERROR = "게시글을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
