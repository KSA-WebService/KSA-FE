"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { readSheet } from "read-excel-file/browser";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useImportWhitelistMutation } from "@/hooks/use-whitelist-query";
import { ApiError } from "@/lib/api/client";
import { toTitleCase } from "@/lib/utils";
import type { ImportWhitelistResult, ImportWhitelistRow, WhitelistDuplicatePolicy } from "@/types/api";

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "review" | "result";

const DUPLICATE_OPTIONS: { value: WhitelistDuplicatePolicy; label: string }[] = [
  { value: "skip", label: "Skip duplicates" },
  { value: "fail", label: "Fail duplicates" },
  { value: "update", label: "Update duplicates" },
];

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

const KNOWN_SKIP_REASON = "email or student number already exists in the whitelist";

// docs/admin/admin-ui.md §5.2 "Import Students Dialog". Excel parsing
// happens entirely client-side; the backend import endpoint only ever
// receives JSON rows, never the binary file.
export function ImportExcelDialog({ open, onOpenChange }: ImportExcelDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportWhitelistRow[]>([]);
  const [onDuplicate, setOnDuplicate] = useState<WhitelistDuplicatePolicy>("skip");
  const [result, setResult] = useState<ImportWhitelistResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importWhitelist = useImportWhitelistMutation();

  function resetState() {
    setStep("upload");
    setParseError(null);
    setRows([]);
    setOnDuplicate("skip");
    setResult(null);
    setSubmitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (importWhitelist.isPending) return;
    resetState();
    onOpenChange(false);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setRows([]);

    try {
      const sheetRows = await readSheet(file);
      if (!sheetRows || sheetRows.length === 0) {
        setParseError("Excel 파일을 읽을 수 없습니다. 파일 형식을 확인해주세요.");
        return;
      }

      const [header, ...dataRows] = sheetRows;
      const headerIndex = header.map(normalizeHeader);
      const nameIdx = headerIndex.indexOf("name");
      const studentIdx = headerIndex.indexOf("student id");
      const emailIdx = headerIndex.indexOf("email");

      if (nameIdx === -1 || studentIdx === -1 || emailIdx === -1) {
        setParseError("필요한 열을 찾을 수 없습니다. Name, Student ID, Email 열을 확인해주세요.");
        return;
      }

      const parsedRows: ImportWhitelistRow[] = dataRows
        .filter((row) => row.some((cell) => cell !== null && String(cell).trim() !== ""))
        .map((row) => ({
          name: String(row[nameIdx] ?? "").trim(),
          studentNumber: String(row[studentIdx] ?? "").trim(),
          email: String(row[emailIdx] ?? "").trim(),
        }));

      setRows(parsedRows);
    } catch {
      setParseError("Excel 파일을 읽을 수 없습니다. 파일 형식을 확인해주세요.");
    }
  }

  function handleImport() {
    if (importWhitelist.isPending) return;

    importWhitelist.mutate(
      { onDuplicate, users: rows },
      {
        onSuccess: (importResult) => {
          setSubmitError(null);
          setResult(importResult);
          setStep("result");
        },
        onError: (error) => {
          // A well-formed backend rejection points at the input/policy; a
          // network/format failure is a transient service problem instead.
          setSubmitError(
            error instanceof ApiError
              ? "학생 목록을 가져오지 못했습니다. 입력 데이터와 중복 처리 방식을 확인해주세요."
              : "학생 목록을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        },
      },
    );
  }

  function handleDone() {
    resetState();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-[640px]">
        {step === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle>Import Students</DialogTitle>
            </DialogHeader>
            <p className="text-meta text-text-secondary">
              Excel 파일에는 Name, Student ID, Email 열이 필요합니다.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="mt-4 text-body text-text-primary"
            />
            {parseError && <p className="mt-2 text-meta text-destructive">{parseError}</p>}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setStep("review")} disabled={rows.length === 0}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "review" && (
          <>
            <DialogHeader>
              <DialogTitle>Import Students</DialogTitle>
            </DialogHeader>
            <p className="text-body text-text-primary">{rows.length} students ready to import</p>

            <div className="mt-3 max-h-[240px] overflow-auto rounded-control border border-border">
              <table className="w-full text-left text-body">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Name</th>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Student ID</th>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.studentNumber}</td>
                      <td className="px-3 py-2">{row.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <label className="text-meta font-medium text-text-secondary">Duplicate Handling</label>
              <div className="mt-1">
                <Select
                  value={onDuplicate}
                  onValueChange={(value) => setOnDuplicate(value as WhitelistDuplicatePolicy)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DUPLICATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {submitError && <p className="mt-2 text-meta text-destructive">{submitError}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("upload")}
                disabled={importWhitelist.isPending}
              >
                Back
              </Button>
              <Button type="button" onClick={handleImport} disabled={importWhitelist.isPending}>
                {importWhitelist.isPending ? "Importing..." : "Import Students"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "result" && result && (
          <>
            <DialogHeader>
              <DialogTitle>Import Complete</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-4 gap-3 text-center">
              <SummaryStat label="Total" value={result.totalCount} />
              <SummaryStat label="Created / Updated" value={result.successCount} />
              <SummaryStat label="Skipped" value={result.skippedCount} />
              <SummaryStat label="Failed" value={result.failedCount} />
            </div>

            <div className="mt-4 max-h-[240px] overflow-auto rounded-control border border-border">
              <table className="w-full text-left text-body">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Row</th>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Email</th>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Student ID</th>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Result</th>
                    <th className="px-3 py-2 text-meta font-medium text-text-secondary">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr key={row.rowIndex} className="border-t border-border">
                      <td className="px-3 py-2">{row.rowIndex}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.studentNumber}</td>
                      <td className="px-3 py-2">{toTitleCase(row.status)}</td>
                      <td className="px-3 py-2 text-text-secondary">
                        {row.status === "skipped" &&
                        row.errorMessage?.toLowerCase().includes(KNOWN_SKIP_REASON)
                          ? "이메일 또는 학번이 이미 화이트리스트에 등록되어 있습니다."
                          : (row.errorMessage ?? "—")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleDone}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control border border-border p-3">
      <p className="text-section-heading font-bold text-text-primary">{value}</p>
      <p className="text-meta text-text-secondary">{label}</p>
    </div>
  );
}
