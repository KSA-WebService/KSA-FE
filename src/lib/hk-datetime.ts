// Hong Kong has a fixed UTC+8 offset (no DST), matching
// docs/admin/api-contract.md's "Confirmed Timezone Behavior".
const HK_OFFSET_MINUTES = 8 * 60;

// Converts a backend UTC ISO timestamp into the value a
// <input type="datetime-local"> expects, representing that instant's
// Hong Kong wall-clock time (e.g. "2026-09-20T14:00"). Adding the offset
// and reading UTC fields back out avoids any dependency on the browser's
// own local timezone.
export function isoToHkLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const shifted = new Date(date.getTime() + HK_OFFSET_MINUTES * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

// Converts a <input type="datetime-local"> value -- already entered as
// Hong Kong wall-clock time by construction -- into a timezone-aware ISO
// string for the API (e.g. "2026-09-20T14:00:00+08:00").
export function hkLocalInputValueToIso(value: string): string | null {
  if (!value) return null;
  return `${value}:00+08:00`;
}
