// Formats an ISO timestamp for display on the public site using the shared
// Asia/Hong_Kong convention (docs/user/api-contract.md "Timezone"). Date-only
// -- distinct from the admin console's formatAdminDateTime (lib/format-date.ts),
// which also shows the time; Home News/Store cards only need a date.
const userDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatUserDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  return userDateFormatter.format(date);
}

// Date + time variant for News Detail's structured event-information block
// (docs/user/user-ui.md "Event Information"), where the time of day matters
// -- unlike formatUserDate above, which List/Home cards intentionally keep
// date-only. Same Asia/Hong_Kong convention.
const userDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatUserDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "—";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  return userDateTimeFormatter.format(date);
}
