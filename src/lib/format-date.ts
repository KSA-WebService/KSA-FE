// Formats an ISO timestamp for display in the admin UI using the shared
// Asia/Hong_Kong convention from docs/admin/product.md §15
// (e.g. "18 Aug 2026, 19:00").
const adminDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatAdminDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "—";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  return adminDateTimeFormatter.format(date);
}
