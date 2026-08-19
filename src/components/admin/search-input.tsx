"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Debounced text search per docs/admin/product.md §17 / admin-ui.md's list
// pages ("Debounce text input briefly before requesting new results").
export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [draft, setDraft] = useState(value);

  // React's documented pattern for adjusting state when a prop changes
  // (e.g. browser back/forward restoring a different URL query state):
  // guarded setState during render, not inside an effect.
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  // Keep the latest onChange available to the debounce effect below
  // without making it a dependency -- callers typically pass a new inline
  // function each render, which would otherwise reset the debounce timer
  // on every parent re-render instead of only when `draft` changes.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChangeRef.current(draft.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [draft]);

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
