"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { POST_CATEGORY_OPTIONS } from "@/lib/post-form";
import type { PostCategory } from "@/types/api";

interface CategoryMultiSelectProps {
  value: PostCategory[];
  onChange: (value: PostCategory[]) => void;
  disabled?: boolean;
}

// docs/admin/admin-ui.md §7/§8/§9: "multi-select dropdown with checkboxes",
// selected categories shown as chips.
export function CategoryMultiSelect({ value, onChange, disabled }: CategoryMultiSelectProps) {
  function toggle(category: PostCategory, checked: boolean) {
    onChange(checked ? [...value, category] : value.filter((current) => current !== category));
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className="flex w-full items-center justify-between gap-2 rounded-control border border-border bg-surface px-3 py-2 text-body text-text-primary transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50"
        >
          <span className={value.length === 0 ? "text-text-muted" : undefined}>
            {value.length === 0 ? "Select categories" : `${value.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {POST_CATEGORY_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
              onSelect={(event) => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((category) => (
            <Badge key={category} tone="neutral">
              {POST_CATEGORY_OPTIONS.find((option) => option.value === category)?.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
