"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Debounced text search for the public site (docs/user/user-ui.md News List
// "Search"): updates after a short debounce, never fires on every keystroke,
// and never loses focus on refetch since this component itself never
// remounts -- only its internal `draft` state changes. Same debounce
// technique as the admin console's SearchInput (components/admin/search-input.tsx),
// kept as a separate component per the project's Admin/user structural split.
export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [draft, setDraft] = useState(value);

  // Adjust local draft when the controlling value changes from outside
  // (e.g. browser back/forward restoring a different URL query state) --
  // guarded setState during render, not inside an effect.
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  // Keep the latest onChange available to the debounce effect without
  // making it a dependency -- callers typically pass a new inline function
  // each render, which would otherwise reset the debounce timer on every
  // parent re-render instead of only when `draft` changes.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalized = draft.trim();
      // Only emit when the normalized draft actually differs from the
      // current external value. Without this, mounting with (or a
      // back/forward navigation restoring) an existing keyword still fires
      // this debounce once after 300ms, and the caller treats that as a
      // fresh search -- resetting pagination even though nothing changed.
      if (normalized !== value) {
        onChangeRef.current(normalized);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [draft, value]);

  return (
    <div className="relative w-full max-w-[320px]">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
