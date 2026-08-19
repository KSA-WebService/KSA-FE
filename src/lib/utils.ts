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
