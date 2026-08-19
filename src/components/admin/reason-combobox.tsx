import { Input } from "@/components/ui/input";

// docs/admin/admin-ui.md §11 "Reason": editable combobox with presets, but
// custom text must remain allowed. A native <input list=...> + <datalist>
// gives exactly that (browser-native suggestion dropdown, still free-text)
// with no extra dependency. Render <ReasonPresetsDatalist /> once per page
// -- every ReasonCombobox on that page shares it via REASON_PRESETS_DATALIST_ID.
export const REASON_PRESETS = ["출석", "수요조사 참여", "기타"] as const;
export const REASON_PRESETS_DATALIST_ID = "token-reason-presets";

export function ReasonPresetsDatalist() {
  return (
    <datalist id={REASON_PRESETS_DATALIST_ID}>
      {REASON_PRESETS.map((preset) => (
        <option key={preset} value={preset} />
      ))}
    </datalist>
  );
}

interface ReasonComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ReasonCombobox({ id, value, onChange, disabled, className }: ReasonComboboxProps) {
  return (
    <Input
      id={id}
      list={REASON_PRESETS_DATALIST_ID}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder="Reason"
      className={className}
    />
  );
}
