import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { InvitationStatus } from "@/types/api";

// docs/admin/admin-ui.md §5 label mapping.
export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pending",
  invited: "Invited",
  accepted: "Accepted",
  expired: "Expired",
  failed: "Failed",
};

const INVITATION_STATUS_TONES: Record<InvitationStatus, BadgeTone> = {
  pending: "neutral",
  invited: "info",
  accepted: "success",
  expired: "warning",
  failed: "destructive",
};

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return <Badge tone={INVITATION_STATUS_TONES[status]}>{INVITATION_STATUS_LABELS[status]}</Badge>;
}
