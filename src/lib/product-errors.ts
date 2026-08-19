// docs/admin/admin-ui.md §14 "Error Handling".
export const PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  P409_PRODUCT_CORE_FIELDS_LOCKED: "주문이 생성된 상품의 이름과 Token Price는 변경할 수 없습니다.",
};

export const GENERIC_PRODUCT_SAVE_ERROR = "상품을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
export const GENERIC_PRODUCT_CREATE_ERROR = "상품을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
export const GENERIC_PRODUCT_LOAD_ERROR = "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
