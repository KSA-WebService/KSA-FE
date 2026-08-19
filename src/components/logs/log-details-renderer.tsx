import { humanizeCamelCase } from "@/lib/utils";

// A bare camelCase-shaped token (e.g. a `changedFields` entry like
// "productName") is a field-name identifier, not free-form data -- it's
// humanized for display the same way object keys are. Anything containing
// spaces, punctuation, etc. (emails, UUIDs, sentences) is left exactly as
// stored. This never mutates the underlying value, only its display text.
const CAMEL_CASE_TOKEN_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

function isScalar(value: unknown): boolean {
  return value === null || value === undefined || typeof value !== "object";
}

function renderScalar(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") {
    return CAMEL_CASE_TOKEN_PATTERN.test(value) ? humanizeCamelCase(value) : value;
  }
  return String(value);
}

// Renders any metadata value generically at any nesting depth: scalars
// inline, arrays of scalars as a bullet list, arrays of objects (or mixed)
// as repeated numbered subsections, and plain objects as nested
// label/value rows -- recursing for further nesting. Never hardcodes a
// shape for one action type (Token Grant, Product, Invitation, ...).
function DetailValue({ value }: { value: unknown }) {
  if (isScalar(value)) {
    return <span>{renderScalar(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span>—</span>;

    if (value.every(isScalar)) {
      return (
        <ul className="list-inside list-disc space-y-0.5">
          {value.map((item, index) => (
            <li key={index}>{renderScalar(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-control border border-border p-3">
            <p className="mb-1 text-meta font-medium text-text-muted">Item {index + 1}</p>
            <DetailValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return <span>—</span>;

  return (
    <dl className="space-y-1">
      {entries.map(([key, entryValue]) => (
        <div key={key} className="flex flex-wrap gap-x-1.5">
          <dt className="text-text-secondary">{humanizeCamelCase(key)}:</dt>
          <dd>
            <DetailValue value={entryValue} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface LogDetailsRendererProps {
  details: Record<string, unknown> | null;
}

// Details = administrator-friendly structured rendering (this component).
// Raw Details = the exact underlying metadata JSON, unchanged, for
// audit/debugging -- kept as a separate collapsible block so the same data
// isn't just shown twice in two JSON blocks.
export function LogDetailsRenderer({ details }: LogDetailsRendererProps) {
  const entries = details ? Object.entries(details) : [];

  if (entries.length === 0) {
    return <p className="text-body text-text-secondary">추가 상세 정보가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map(([key, value]) => {
          const isComplex = !isScalar(value);
          return (
            <div key={key} className={isComplex ? "sm:col-span-2" : undefined}>
              <dt className="text-meta font-medium text-text-secondary">{humanizeCamelCase(key)}</dt>
              <dd className="mt-1 text-body text-text-primary">
                <DetailValue value={value} />
              </dd>
            </div>
          );
        })}
      </dl>

      <details className="rounded-control border border-border bg-surface-muted p-3">
        <summary className="cursor-pointer text-meta font-medium text-text-secondary">Raw Details</summary>
        <pre className="mt-2 overflow-auto text-meta text-text-primary">
          {JSON.stringify(details, null, 2)}
        </pre>
      </details>
    </div>
  );
}
