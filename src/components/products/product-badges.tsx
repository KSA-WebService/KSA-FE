import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { AvailabilityStatus, ProductType, PublicationStatus } from "@/types/api";

// docs/admin/admin-ui.md §13/§14 label mappings.
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ticket: "Ticket",
  merchandise: "Merchandise",
};

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  unavailable: "Unavailable",
};

const PUBLICATION_TONES: Record<PublicationStatus, BadgeTone> = {
  draft: "neutral",
  published: "success",
  hidden: "warning",
};

export function ProductTypeBadge({ type }: { type: ProductType }) {
  return <Badge tone="neutral">{PRODUCT_TYPE_LABELS[type]}</Badge>;
}

export function PublicationBadge({ status }: { status: PublicationStatus }) {
  return <Badge tone={PUBLICATION_TONES[status]}>{PUBLICATION_STATUS_LABELS[status]}</Badge>;
}

// Availability is a distinct, operational concept from Publication --
// docs/admin/admin-ui.md §13 "Availability Semantics" -- so this
// deliberately never shares a tone/label map with PublicationBadge.
export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <Badge tone={status === "available" ? "success" : "destructive"}>
      {AVAILABILITY_STATUS_LABELS[status]}
    </Badge>
  );
}
