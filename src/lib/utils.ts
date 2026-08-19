import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// For backend values not covered by a fixed label map (e.g. import-row
// status, invitation link status) -- admin-ui.md explicitly asks the UI to
// "safely display other valid ... statuses" rather than assume a closed set.
export function toTitleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// For camelCase object keys (e.g. Action Log `details` metadata:
// "beforeStatus" -> "Before Status"). Distinct from toTitleCase, which
// splits on underscores/spaces, not capitalization.
export function humanizeCamelCase(key: string): string {
  const withSpaces = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
