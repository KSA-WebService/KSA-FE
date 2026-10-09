"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onSearch,
  placeholder,
}: SearchInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [draft, setDraft] = useState(value);
  const isComposingRef = useRef(false);

  // Only synchronize when the applied keyword changes.
  // Unrelated parent re-renders must not overwrite the draft.
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  function handleSearch() {
    const normalized = draft.trim();

    // Avoid unnecessary navigation for unchanged searches.
    if (normalized === value) return;

    onSearch(normalized);
  }

  function handleClear() {
    setDraft("");

    // Clearing removes only the applied keyword.
    if (value !== "") {
      onSearch("");
    }
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();

        if (isComposingRef.current) return;

        handleSearch();
      }}
      className="flex w-full max-w-[460px] items-center gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (event.nativeEvent.isComposing ||
                isComposingRef.current ||
                event.nativeEvent.keyCode === 229)
            ) {
              event.preventDefault();
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder || "Search"}
          className="pr-9 pl-9"
        />

        {draft.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button type="submit">Search</Button>
    </form>
  );
}
