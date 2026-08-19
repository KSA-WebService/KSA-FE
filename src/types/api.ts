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
