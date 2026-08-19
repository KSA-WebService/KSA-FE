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
// Files -- docs/admin/api-contract.md "Post Image Upload" (3-stage flow)
// ---------------------------------------------------------------------------

export interface PresignedFileRequest {
  originalName: string;
  contentType: string;
  fileSize: number;
  purpose: "post_image";
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
