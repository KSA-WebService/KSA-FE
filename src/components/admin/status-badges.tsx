import { Badge } from "@/components/ui/badge";
import type { UserAccountStatus, UserRole } from "@/types/api";

// docs/admin/admin-ui.md §3/§4 label mappings. Exported so the User Detail
// confirmation modal can reuse the exact same labels for its diff lines.
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  admin: "Admin",
};

export const USER_STATUS_LABELS: Record<UserAccountStatus, string> = {
  active: "Active",
  blocked: "Blocked",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={role === "admin" ? "brand" : "neutral"}>{USER_ROLE_LABELS[role]}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserAccountStatus }) {
  return (
    <Badge tone={status === "active" ? "success" : "destructive"}>
      {USER_STATUS_LABELS[status]}
    </Badge>
  );
}
