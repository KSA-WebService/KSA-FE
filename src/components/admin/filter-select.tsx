"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL_VALUE = "all";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: FilterOption[];
}

// Radix Select can't take an empty-string item value, so "" (no query
// value, per admin-ui.md's filter specs) is represented internally as a
// sentinel and translated back to "" for the caller.
export function FilterSelect({ label, value, onChange, allLabel, options }: FilterSelectProps) {
  return (
    <Select
      value={value || ALL_VALUE}
      onValueChange={(next) => onChange(next === ALL_VALUE ? "" : next)}
    >
      <SelectTrigger aria-label={label} className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
