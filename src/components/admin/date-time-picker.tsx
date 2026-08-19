import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Native calendar + time picker (docs/admin/admin-ui.md: "Administrators
// must not manually type ISO timestamps" -- the browser's own
// datetime-local UI satisfies this without a separate calendar library).
// `value` is the Hong Kong wall-clock local string this input works in
// natively; ISO conversion happens at the form's edges (see lib/hk-datetime.ts).
export function DateTimePicker({ id, value, onChange, disabled }: DateTimePickerProps) {
  return (
    <Input
      id={id}
      type="datetime-local"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    />
  );
}
