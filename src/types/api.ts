// Shapes mirror docs/admin/api-contract.md exactly. Do not add fields that
// aren't confirmed in that document.

export interface ApiErrorShape {
  errorCode: string;
  reason: string;
  data?: Record<string, unknown> | null;
}

export type ApiEnvelope<T> =
  | { resultType: "success"; error: null; success: T }
  | { resultType: "fail"; error: ApiErrorShape; success: null };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// GET /api/v1/admin/me -- "Admin Authentication"
export interface AdminProfile {
  userId: string;
  name: string;
  email: string;
  role: "admin";
  status: string;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type UserRole = "student" | "admin";
export type UserAccountStatus = "active" | "blocked";

// GET /api/v1/admin/users -- "Admin Users List"
export interface UserSummary {
  userId: string;
  name: string;
  studentNumber: string;
  email: string;
  role: UserRole;
  tokenBalance: number;
  status: UserAccountStatus;
  createdAt: string;
}

// GET /api/v1/admin/users/{userId} -- "Admin User Details"
export interface UserDetail extends UserSummary {
  agreedPrivacy: boolean;
  agreedAt: string | null;
  updatedAt: string;
}

export type UsersSortField =
  | "name"
  | "student_number"
  | "email"
  | "role"
  | "token_balance"
  | "status"
  | "created_at";

export interface UsersListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: UserRole;
  status?: UserAccountStatus;
  sort?: UsersSortField;
  order?: "asc" | "desc";
}

// ---------------------------------------------------------------------------
// Whitelist -- docs/admin/api-contract.md "Admin Whitelist ..." sections
// ---------------------------------------------------------------------------

export type InvitationStatus = "pending" | "invited" | "accepted" | "expired" | "failed";

export interface WhitelistSummary {
  whitelistUserId: string;
  name: string;
  studentNumber: string;
  email: string;
  invitationStatus: InvitationStatus;
  invitedAt: string | null;
  createdAt: string;
}

export interface WhitelistListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  invitationStatus?: InvitationStatus;
}

export interface WhitelistInvitedBy {
  userId: string;
  name: string;
}

export interface WhitelistLatestInvitation {
  invitationId: string;
  linkStatus: string;
  sentAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

// GET /admin/auth/whitelist-users/{whitelistUserId} -- "Admin Whitelist Detail"
export interface WhitelistDetail {
  whitelistUserId: string;
  name: string;
  studentNumber: string;
  email: string;
  invitationStatus: InvitationStatus;
  userId: string | null;
  invitedBy: WhitelistInvitedBy | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  latestInvitation: WhitelistLatestInvitation | null;
}

export interface CreateWhitelistPayload {
  name: string;
  studentNumber: string;
  email: string;
}

export type WhitelistDuplicatePolicy = "skip" | "fail" | "update";

export interface ImportWhitelistRow {
  name: string;
  studentNumber: string;
  email: string;
}

export interface ImportWhitelistPayload {
  onDuplicate: WhitelistDuplicatePolicy;
  users: ImportWhitelistRow[];
}

export interface ImportWhitelistRowResult {
  rowIndex: number;
  email: string;
  studentNumber: string;
  status: string;
  whitelistUserId: string | null;
  errorMessage: string | null;
}

export interface ImportWhitelistResult {
  totalCount: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  results: ImportWhitelistRowResult[];
}

export interface InvitationResultItem {
  whitelistUserId: string;
  email: string;
  invitationId: string;
  sendStatus: string;
  invitationStatus: string;
  linkStatus: string;
  sentAt: string;
  expiresAt: string;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface SendInvitationResponse {
  requestedCount: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  results: InvitationResultItem[];
}

export interface ResendInvitationResponse {
  requestedCount: number;
  resentCount: number;
  skippedCount: number;
  failedCount: number;
  results: InvitationResultItem[];
}

export interface DeleteWhitelistResponse {
  deletedWhitelistUserId: string;
}

// ---------------------------------------------------------------------------
// Posts -- docs/admin/api-contract.md "Admin Post(s) ..." sections
// ---------------------------------------------------------------------------

export type PostCategory =
  | "partnership"
  | "event"
  | "co_purchase"
  | "career"
  | "announcement"
  | "alumni";

export type PostStatus = "draft" | "published" | "hidden";

export interface PostRepresentativeImage {
  fileId: string;
  originalName: string;
  fileUrl: string;
}

export interface PostAuthor {
  userId: string;
  name: string;
}

// GET /admin/posts -- "Admin Posts List"
export interface PostListItem {
  postId: string;
  title: string;
  categories: PostCategory[];
  membersOnly: boolean;
  status: PostStatus;
  eventStartAt: string | null;
  eventEndAt: string | null;
  showOnCalendar: boolean;
  representativeImage: PostRepresentativeImage | null;
  author: PostAuthor;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostsListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: PostCategory;
  status?: PostStatus;
}

export interface PostDetailImage {
  contentImageId: string;
  fileId: string;
  originalName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  sortOrder: number;
}

// GET /admin/posts/{postId} -- "Admin Post Detail"
export interface PostDetail {
  postId: string;
  title: string;
  content: string | null;
  categories: PostCategory[];
  membersOnly: boolean;
  status: PostStatus;
  eventStartAt: string | null;
  eventEndAt: string | null;
  showOnCalendar: boolean;
  images: PostDetailImage[];
  author: PostAuthor;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// PATCH /admin/posts/{postId} -- "Admin Post Update". Fields the frontend
// edits; nullable event fields may be explicitly set to null.
export interface PostUpdatePayload {
  title?: string;
  content?: string | null;
  categories?: PostCategory[];
  membersOnly?: boolean;
  status?: PostStatus;
  eventStartAt?: string | null;
  eventEndAt?: string | null;
  showOnCalendar?: boolean;
  imageFileIds?: string[];
}

// PATCH does not return a full post -- always refetch Post Detail after.
export interface PostUpdateResponse {
  postId: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
}

// POST /admin/posts -- "Admin Post Create". Frontend only ever creates as
// draft or published (never hidden at creation).
export interface PostCreatePayload {
  title: string;
  content?: string;
  categories: PostCategory[];
  membersOnly: boolean;
  status: "draft" | "published";
  eventStartAt?: string;
  eventEndAt?: string;
  showOnCalendar: boolean;
  imageFileIds?: string[];
}

export interface PostCreateImage {
  fileId: string;
  fileUrl: string;
  sortOrder: number;
}

export interface PostCreateResponse {
  postId: string;
  title: string;
  categories: PostCategory[];
  membersOnly: boolean;
  status: PostStatus;
  eventStartAt: string | null;
  eventEndAt: string | null;
  showOnCalendar: boolean;
  images: PostCreateImage[];
  publishedAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Files -- docs/admin/api-contract.md "Post Image Upload" (3-stage flow),
// reused by Products with purpose: "product_image".
// ---------------------------------------------------------------------------

export interface PresignedFileRequest {
  originalName: string;
  contentType: string;
  fileSize: number;
  purpose: "post_image" | "product_image";
}

export interface PresignedFileResponse {
  fileId: string;
  originalName: string;
  storagePath: string;
  uploadUrl: string;
  uploadToken: string;
  contentType: string;
  fileSize: number;
  purpose: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface CompletedFileResponse {
  fileId: string;
  originalName: string;
  storagePath: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  purpose: string;
  status: string;
  createdAt: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Token Events / Grants / Reset -- docs/admin/api-contract.md "Admin Token
// Events List" through "Admin Token Balance Reset"
// ---------------------------------------------------------------------------

export interface TokenEventCreator {
  userId: string;
  name: string;
}

// GET /admin/token-events -- list item
export interface TokenEventSummary {
  tokenEventId: string;
  eventName: string;
  createdBy: TokenEventCreator;
  createdAt: string;
  lastGrantUpdatedAt: string | null;
  grantedMemberCount: number;
}

export interface TokenEventsListParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface CreateTokenEventPayload {
  eventName: string;
}

// POST /admin/token-events response
export interface CreateTokenEventResponse {
  tokenEventId: string;
  eventName: string;
  createdBy: TokenEventCreator;
  createdAt: string;
}

export type GrantEligibility = "eligible" | "adjustment_only";
export type GrantStatus = "granted" | "not_granted";

// One row of GET /admin/token-events/{id}'s student list.
// tokenGrantId: null means no grant exists yet for this user in this event
// -- grantedAmount/reason/grantedBy/grantedAt/grantUpdatedAt are then null too.
export interface TokenGrantStudentRow {
  userId: string;
  name: string;
  studentNumber: string;
  email: string;
  grantEligibility: GrantEligibility;
  currentTokenBalance: number;
  tokenGrantId: string | null;
  grantedAmount: number | null;
  reason: string | null;
  grantedBy: TokenEventCreator | null;
  grantedAt: string | null;
  grantUpdatedAt: string | null;
}

export interface TokenEventDetailParams {
  page?: number;
  limit?: number;
  keyword?: string;
  grantStatus?: GrantStatus;
}

// GET /admin/token-events/{id} -- event metadata + paginated student rows.
// The array field name isn't shown in a confirmed example for this specific
// endpoint; every other paginated admin endpoint uses `items`, so the same
// convention is applied here rather than inventing a new field name.
export interface TokenEventDetail {
  tokenEventId: string;
  eventName: string;
  createdBy: TokenEventCreator;
  createdAt: string;
  lastGrantUpdatedAt: string | null;
  grantedMemberCount: number;
  items: TokenGrantStudentRow[];
  pagination: PaginationMeta;
}

export interface GrantEntryPayload {
  userId: string;
  grantedAmount: number;
  reason: string;
}

// PATCH /admin/token-events/{id}/grants request
export interface SaveGrantsPayload {
  grants: GrantEntryPayload[];
}

export interface GrantSaveResultItem {
  status: string;
  tokenGrantId: string;
  tokenLogId: string;
  userId: string;
  name: string;
  studentNumber: string;
  previousGrantedAmount: number;
  grantedAmount: number;
  deltaAmount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface SaveGrantsResponse {
  tokenEventId: string;
  processedCount: number;
  savedCount: number;
  unchangedCount: number;
  items: GrantSaveResultItem[];
}

export interface RenameTokenEventPayload {
  eventName: string;
}

export interface RenameTokenEventResponse {
  tokenEventId: string;
  eventName: string;
  updatedAt: string;
}

export interface DeleteTokenEventResponse {
  deletedTokenEventId: string;
  deletedAt: string;
}

// GET /admin/token-balances/reset-preview
export interface TokenResetPreview {
  affectedMemberCount: number;
  totalResetAmount: number;
  previewedAt: string;
}

export const TOKEN_RESET_CONFIRMATION_PHRASE = "RESET_ALL_STUDENT_TOKEN_BALANCES" as const;

export interface TokenResetPayload {
  confirmation: typeof TOKEN_RESET_CONFIRMATION_PHRASE;
  reason: string;
}

// POST /admin/token-balances/reset response
export interface TokenResetResponse {
  affectedMemberCount: number;
  totalResetAmount: number;
  reason: string;
  performedBy: TokenEventCreator;
  performedAt: string;
}

// ---------------------------------------------------------------------------
// Products -- docs/admin/api-contract.md "Admin Products List" through
// "Admin Product Create"
// ---------------------------------------------------------------------------

export type ProductType = "ticket" | "merchandise";
export type PublicationStatus = "draft" | "published" | "hidden";
export type AvailabilityStatus = "available" | "unavailable";

export interface ProductImage {
  fileId: string;
  fileUrl: string;
}

// GET /admin/products -- list item
export interface ProductListItem {
  productId: string;
  productName: string;
  productType: ProductType;
  tokenPrice: number;
  stockQuantity: number;
  isOrderable: boolean;
  availabilityStatus: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  image: ProductImage | null;
  updatedAt: string;
}

// The current admin list UI intentionally does not expose productType as a
// filter (docs/admin/admin-ui.md §13), so it's not part of this params type.
export interface ProductsListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  publicationStatus?: PublicationStatus;
  availabilityStatus?: AvailabilityStatus;
}

// GET /admin/products/{id} -- also the shape PATCH returns directly
// (confirmed: full detail, not a summary).
export interface ProductDetail {
  productId: string;
  productName: string;
  productType: ProductType;
  tokenPrice: number;
  stockQuantity: number;
  isOrderable: boolean;
  availabilityStatus: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  description: string | null;
  image: ProductImage | null;
  coreFieldsLocked: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// PATCH /admin/products/{id}. imageFileId: a real fileId to attach/replace
// an image. Manual QA confirmed the backend rejects `null` here once a
// product already has an image, so the frontend never sends null solely to
// remove one -- an existing image can only be replaced, never removed
// (still typed as nullable since a product created without an image can
// receive its first one via a non-null fileId; null itself is not sent by
// this frontend).
export interface ProductUpdatePayload {
  productName?: string;
  tokenPrice?: number;
  stockQuantity?: number;
  isOrderable?: boolean;
  description?: string | null;
  imageFileId?: string | null;
  publicationStatus?: PublicationStatus;
}

// POST /admin/products. Frontend only ever creates as draft or published.
export interface ProductCreatePayload {
  productName: string;
  productType: ProductType;
  tokenPrice: number;
  stockQuantity: number;
  isOrderable: boolean;
  publicationStatus: "draft" | "published";
  description?: string;
  imageFileId?: string;
}

// ---------------------------------------------------------------------------
// Orders -- docs/admin/api-contract.md "Admin Orders List" / "Admin Order
// Status Update". No Order Detail endpoint/route exists.
// ---------------------------------------------------------------------------

export type OrderStatus = "ordered" | "accepted" | "delivered" | "canceled";

export interface OrderProductSummary {
  productId: string;
  productName: string;
}

export interface OrderCustomerSummary {
  userId: string;
  customerName: string;
  studentNumber: string;
  email: string;
}

export interface OrderListItem {
  orderId: string;
  product: OrderProductSummary;
  customer: OrderCustomerSummary;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderedAt: string;
  acceptedAt: string | null;
  deliveredAt: string | null;
  canceledAt: string | null;
  cancellationReason: string | null;
}

// `sort` only has a confirmed value for "oldest"; the UI's "Newest" option
// omits the param entirely (confirmed default) rather than guessing an
// unconfirmed "newest" string -- see the Orders implementation summary.
export interface OrdersListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  orderStatus?: OrderStatus;
  sort?: "oldest";
}

// PATCH /admin/orders/{id}/status
export interface UpdateOrderStatusPayload {
  orderStatus: "accepted" | "delivered" | "canceled";
  cancellationReason?: string;
}

// ---------------------------------------------------------------------------
// Action Logs -- docs/admin/api-contract.md "Admin Action Logs List" /
// "Admin Action Log Detail". Read-only.
// ---------------------------------------------------------------------------

export interface ActionLogAdmin {
  userId: string;
  name: string;
  email: string;
}

// actionType/action are open-ended ("other action types may appear as the
// application grows") so they're typed as string, not a closed union.
export interface ActionLogListItem {
  logId: number;
  admin: ActionLogAdmin;
  actionType: string;
  action: string;
  targetId: string | null;
  createdAt: string;
}

export interface ActionLogsListParams {
  page?: number;
  limit?: number;
  actionType?: string;
}

// GET /admin/action-logs/{id} -- list fields plus action-specific details.
export interface ActionLogDetail extends ActionLogListItem {
  details: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Public Posts -- docs/user/api-contract.md "Page 1 — Home" / "Page 5 — News
// List" / "Page 6 — News Detail". Unauthenticated, public-facing shapes --
// distinct from the admin Post types above (no `status`/`author`/etc).
// ---------------------------------------------------------------------------

export interface PublicImageRef {
  fileId: string;
  fileUrl: string;
}

// GET /posts -- "Home News Preview" / "News List"
export interface PublicPostListItem {
  postId: string;
  title: string;
  categories: PostCategory[];
  membersOnly: boolean;
  eventStartAt: string | null;
  eventEndAt: string | null;
  representativeImage: PublicImageRef | null;
  publishedAt: string;
}

// Confirmed backend values for the public `period` filter. There is no
// "all" value on the wire -- "전체" is represented by omitting the param
// entirely (see PublicPostsListParams.period below).
export type PostPeriod = "upcoming" | "past" | "undated";

export interface PublicPostsListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: PostCategory;
  period?: PostPeriod;
  // Confirmed values are "latest" | "oldest"; the product decision is
  // News always displays newest-published-first with no user-facing sort
  // control, so only "latest" is ever actually sent by this frontend.
  sort?: "latest" | "oldest";
}

export interface PublicPostImage extends PublicImageRef {
  sortOrder: number;
}

// GET /posts/{postId} -- "News Detail". `content` is confirmed nullable in
// practice -- a published post can legitimately have no body content.
export interface PublicPostDetail {
  postId: string;
  title: string;
  content: string | null;
  categories: PostCategory[];
  membersOnly: boolean;
  eventStartAt: string | null;
  eventEndAt: string | null;
  images: PublicPostImage[];
  publishedAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Public Products -- docs/user/api-contract.md "Page 1 — Home" / "Page 7 —
// Store List". The public Products API does not support `keyword` (confirmed
// HTTP 400 if sent) -- see PublicProductsListParams.
// ---------------------------------------------------------------------------

// GET /products -- "Home Store Preview" / "Store List"
export interface PublicProductListItem {
  productId: string;
  productName: string;
  productType: ProductType;
  description: string | null;
  tokenPrice: number;
  image: PublicImageRef | null;
  availabilityStatus: AvailabilityStatus;
  publishedAt: string;
}

export interface PublicProductsListParams {
  page?: number;
  limit?: number;
  productType?: ProductType;
}

// ---------------------------------------------------------------------------
// Current User ("me") -- docs/user/api-contract.md "Page 4 — My Page". Also
// used by the shared Header to resolve the authenticated display name, since
// the Supabase session itself never carries the KSA member's `name`.
// ---------------------------------------------------------------------------

// GET /users/me
export interface CurrentUser {
  userId: string;
  name: string;
  studentNumber: string;
  email: string;
  role: UserRole;
  tokenBalance: number;
  status: UserAccountStatus;
  agreedPrivacy: boolean;
  agreedAt: string | null;
}

// ---------------------------------------------------------------------------
// Create Order -- docs/user/api-contract.md "Page 8 — Order Confirmation".
// Authenticated (the ordering member's own action) -- distinct from the
// admin Orders List above (no `customer` field), but reuses OrderStatus
// and OrderProductSummary since both shapes are identical here.
// ---------------------------------------------------------------------------

// POST /orders request body. Only the fields the backend actually needs --
// never a frontend-calculated price/total.
export interface CreateOrderPayload {
  productId: string;
  quantity: number;
}

// POST /orders response. Authoritative for unitPrice/totalAmount/
// remainingTokenBalance -- the frontend's pre-submit cost preview is
// presentation only.
export interface CreateOrderResult {
  orderId: string;
  product: OrderProductSummary;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  remainingTokenBalance: number;
  orderedAt: string;
}

// ---------------------------------------------------------------------------
// Public Auth -- docs/user/api-contract.md "Page 3 — Account Activation".
// Both endpoints are public (no Authorization header); Login itself has no
// KSA backend endpoint at all -- it's Supabase `signInWithPassword` only.
// ---------------------------------------------------------------------------

export interface VerifyInvitationPayload {
  token: string;
}

// POST /auth/invitations/verify
export interface VerifiedInvitation {
  name: string;
  email: string;
  studentNumber: string;
  expiresAt: string;
}

// POST /auth/onboarding/complete. `agreedPrivacy` is typed as the literal
// `true` -- the contract explicitly forbids ever sending `false`.
export interface CompleteOnboardingPayload {
  token: string;
  password: string;
  agreedPrivacy: true;
}

export interface OnboardingCompleteResult {
  userId: string;
  name: string;
  email: string;
  studentNumber: string;
  role: UserRole;
  status: UserAccountStatus;
  tokenBalance: number;
  createdAt: string;
}
