"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  RiUploadLine,
  RiFileTextLine,
  RiDownloadLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { useImportStudentsMutation } from "../queries/queries";

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CSV_TEMPLATE_HEADERS = [
  "firstName",
  "lastName",
  "email",
  "gender",
  "dateOfBirth",
  "phone",
  "address",
  "guardianName",
  "guardianPhone",
  "guardianEmail",
  "guardianRelation",
];

type ImportState = "idle" | "preview" | "importing" | "done";

interface PreviewRow {
  data: Record<string, string>;
  valid: boolean;
  error?: string;
}

function BulkImportModal({ open, onOpenChange }: BulkImportModalProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { enqueueSnackbar } = useSnackbar();
  const importMutation = useImportStudentsMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ImportState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setSelectedFile(null);
    setPreviewRows([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(
    (openState: boolean) => {
      if (!openState) {
        reset();
      }
      onOpenChange(openState);
    },
    [onOpenChange, reset]
  );

  const handleDownloadTemplate = useCallback(() => {
    const csv = CSV_TEMPLATE_HEADERS.join(",") + "\n";
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const parseCSV = useCallback((text: string): PreviewRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const data: Record<string, string> = {};
      headers.forEach((header, idx) => {
        data[header] = values[idx] || "";
      });

      const valid = Boolean(data.firstName && data.lastName);
      return {
        data,
        valid,
        error: valid
          ? undefined
          : "Missing required fields (firstName, lastName)",
      };
    });
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".csv")) {
        enqueueSnackbar(
          t("admin-panel-students-registrations:import.csvFormat"),
          { variant: "error" }
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar(
          t("admin-panel-students-registrations:import.maxSize"),
          { variant: "error" }
        );
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        setPreviewRows(rows);
        setState("preview");
      };
      reader.readAsText(file);
    },
    [enqueueSnackbar, parseCSV, t]
  );

  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setState("importing");
    try {
      const result = await importMutation.mutateAsync({
        file: selectedFile,
      });
      setImportResult(result);
      setState("done");

      if (result.errors.length === 0) {
        enqueueSnackbar(
          t("admin-panel-students-registrations:import.success", {
            count: result.imported,
          }),
          { variant: "success" }
        );
      }
    } catch {
      enqueueSnackbar(t("admin-panel-students-registrations:import.error"), {
        variant: "error",
      });
      setState("preview");
    }
  }, [selectedFile, importMutation, enqueueSnackbar, t]);

  const validCount = previewRows.filter((r) => r.valid).length;
  const invalidCount = previewRows.filter((r) => !r.valid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("admin-panel-students-registrations:import.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin-panel-students-registrations:import.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Download template */}
          <div className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 p-3">
            <RiFileTextLine className="h-8 w-8 text-text-soft-400" />
            <div className="flex-1">
              <p className="text-paragraph-sm font-medium text-text-strong-950">
                {t(
                  "admin-panel-students-registrations:import.downloadTemplate"
                )}
              </p>
              <p className="text-paragraph-xs text-text-soft-400">
                {t("admin-panel-students-registrations:import.csvFormat")}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              <RiDownloadLine className="mr-1 h-4 w-4" />
              {t("admin-panel-students-registrations:import.downloadTemplate")}
            </Button>
          </div>

          {/* Upload area */}
          {state === "idle" && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-stroke-soft-200 p-8 transition-colors hover:border-primary-base hover:bg-bg-weak-50">
              <RiUploadLine className="h-10 w-10 text-text-soft-400" />
              <div className="text-center">
                <p className="text-paragraph-sm font-medium text-text-strong-950">
                  {t("admin-panel-students-registrations:import.dropzone")}
                </p>
                <p className="text-paragraph-xs text-text-soft-400">
                  {t("admin-panel-students-registrations:import.maxSize")}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}

          {/* Preview */}
          {state === "preview" && selectedFile && (
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg bg-bg-weak-50 p-3">
                <div className="flex items-center gap-2">
                  <RiFileTextLine className="h-5 w-5 text-text-soft-400" />
                  <span className="text-paragraph-sm font-medium">
                    {selectedFile.name}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={reset}>
                  <RiCloseLine className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4 text-paragraph-sm">
                <span className="text-text-soft-400">
                  {t("admin-panel-students-registrations:import.previewRows")}:{" "}
                  {previewRows.length}
                </span>
                <span className="text-success-base">
                  {t("admin-panel-students-registrations:import.validRows")}:{" "}
                  {validCount}
                </span>
                {invalidCount > 0 && (
                  <span className="text-error-base">
                    {t("admin-panel-students-registrations:import.invalidRows")}
                    : {invalidCount}
                  </span>
                )}
              </div>

              {/* Preview table (first 5 rows) */}
              <div className="max-h-48 overflow-auto rounded-lg border border-stroke-soft-200">
                <table className="w-full text-paragraph-xs">
                  <thead>
                    <tr className="border-b bg-bg-weak-50">
                      <th className="p-2 text-left font-medium">#</th>
                      <th className="p-2 text-left font-medium">
                        {t(
                          "admin-panel-students-registrations:table.columns.name"
                        )}
                      </th>
                      <th className="p-2 text-left font-medium">
                        {t(
                          "admin-panel-students-registrations:table.columns.email"
                        )}
                      </th>
                      <th className="p-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">
                          {row.data.firstName} {row.data.lastName}
                        </td>
                        <td className="p-2">{row.data.email || "—"}</td>
                        <td className="p-2">
                          {row.valid ? (
                            <RiCheckLine className="h-4 w-4 text-success-base" />
                          ) : (
                            <RiErrorWarningLine className="h-4 w-4 text-error-base" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Importing */}
          {state === "importing" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Spinner size="md" />
              <p className="text-paragraph-sm text-text-soft-400">
                {t("admin-panel-students-registrations:import.importProgress")}
              </p>
            </div>
          )}

          {/* Done */}
          {state === "done" && importResult && (
            <div className="grid gap-3 py-2">
              <div className="flex items-center gap-2 rounded-lg bg-success-lighter p-3">
                <RiCheckLine className="h-5 w-5 text-success-base" />
                <span className="text-paragraph-sm font-medium text-success-base">
                  {t("admin-panel-students-registrations:import.success", {
                    count: importResult.imported,
                  })}
                </span>
              </div>

              {importResult.errors.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-paragraph-sm font-medium text-error-base">
                    {importResult.errors.length} error(s):
                  </p>
                  <div className="max-h-32 overflow-auto rounded-lg border border-error-lighter p-2">
                    {importResult.errors.map((err, idx) => (
                      <p
                        key={idx}
                        className="text-paragraph-xs text-error-base"
                      >
                        Row {err.row}: {err.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {state === "done" ? (
            <Button onClick={() => handleClose(false)}>
              {t("admin-panel-students-registrations:actions.close")}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={state === "importing"}
              >
                {t("admin-panel-students-registrations:actions.cancel")}
              </Button>
              {state === "preview" && (
                <Button
                  onClick={() => void handleImport()}
                  disabled={validCount === 0}
                >
                  {t(
                    "admin-panel-students-registrations:actions.importStudents"
                  )}{" "}
                  ({validCount})
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkImportModal;
