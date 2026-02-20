"use client";

import { useCallback, useRef, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiArrowLeftLine,
  RiDownloadLine,
  RiUploadLine,
  RiCheckLine,
  RiCloseLine,
  RiFileTextLine,
} from "@remixicon/react";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useBulkAttendanceMutation } from "../queries/queries";
import { AttendanceStatus } from "../types";
import { useSectionsListQuery } from "../../../academics/classes/queries/queries";

const NS = "admin-panel-students-attendance";

type BulkState = "idle" | "preview" | "importing" | "done";

interface CsvRow {
  attendableId: number;
  attendableType: "student" | "staff";
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
  isValid: boolean;
  error?: string;
  // Display fields from CSV
  studentName?: string;
  studentId?: string;
}

function BulkAttendance() {
  const { t } = useTranslation(NS);
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<BulkState>("idle");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sectionId, setSectionId] = useState<string>("");
  const { data: sections } = useSectionsListQuery();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{
    marked: number;
    skipped: number;
  } | null>(null);

  const bulkMutation = useBulkAttendanceMutation();

  const validStatuses = Object.values(AttendanceStatus) as string[];

  const handleDownloadTemplate = useCallback(() => {
    const headers = [
      "attendable_id",
      "student_name",
      "student_id",
      "status",
      "check_in",
      "check_out",
      "remarks",
    ];
    const sampleRows = [
      ["1", "John Doe", "STU-001", "present", "08:00", "14:00", "On time"],
      ["2", "Jane Smith", "STU-002", "absent", "", "", "Sick leave"],
      ["3", "Bob Wilson", "STU-003", "late", "08:30", "14:00", "Traffic"],
    ];
    const csv = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const parseCsv = useCallback(
    (text: string): CsvRow[] => {
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) return [];

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idIdx = headers.indexOf("attendable_id");
      const nameIdx = headers.indexOf("student_name");
      const sidIdx = headers.indexOf("student_id");
      const statusIdx = headers.indexOf("status");
      const checkInIdx = headers.indexOf("check_in");
      const checkOutIdx = headers.indexOf("check_out");
      const remarksIdx = headers.indexOf("remarks");

      return lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const attendableId = Number(cols[idIdx] ?? 0);
        const status = (cols[statusIdx] ?? "").toLowerCase();
        const isValidStatus = validStatuses.includes(status);
        const isValidId = attendableId > 0;

        return {
          attendableId,
          attendableType: "student" as const,
          status: (isValidStatus
            ? status
            : AttendanceStatus.PRESENT) as AttendanceStatus,
          checkIn: cols[checkInIdx] || undefined,
          checkOut: cols[checkOutIdx] || undefined,
          remarks: cols[remarksIdx] || undefined,
          studentName: cols[nameIdx] || undefined,
          studentId: cols[sidIdx] || undefined,
          isValid: isValidId && isValidStatus,
          error: !isValidId
            ? "Invalid ID"
            : !isValidStatus
              ? `Invalid status: ${cols[statusIdx]}`
              : undefined,
        };
      });
    },
    [validStatuses]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".csv")) {
        enqueueSnackbar("Please upload a CSV file.", { variant: "error" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("File size exceeds 5MB limit.", { variant: "error" });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const parsed = parseCsv(text);
        setRows(parsed);
        setState("preview");
      };
      reader.readAsText(file);
    },
    [parseCsv, enqueueSnackbar]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.name.endsWith(".csv")) {
        enqueueSnackbar("Please upload a CSV file.", { variant: "error" });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const parsed = parseCsv(text);
        setRows(parsed);
        setState("preview");
      };
      reader.readAsText(file);
    },
    [parseCsv, enqueueSnackbar]
  );

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);

  const handleImport = useCallback(() => {
    if (validRows.length === 0) {
      enqueueSnackbar("No valid rows to import.", { variant: "error" });
      return;
    }

    setState("importing");
    bulkMutation.mutate(
      {
        date,
        sectionId: sectionId ? Number(sectionId) : 0,
        records: validRows.map((r) => ({
          attendableType: r.attendableType,
          attendableId: r.attendableId,
          status: r.status,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          remarks: r.remarks,
        })),
      },
      {
        onSuccess: (data) => {
          setResult({
            marked: data?.marked ?? validRows.length,
            skipped: data?.skipped ?? 0,
          });
          setState("done");
          enqueueSnackbar(
            t(`${NS}:bulk.success`, {
              marked: data?.marked ?? validRows.length,
              skipped: data?.skipped ?? 0,
            }),
            { variant: "success" }
          );
        },
        onError: () => {
          setState("preview");
          enqueueSnackbar(t(`${NS}:bulk.error`), { variant: "error" });
        },
      }
    );
  }, [validRows, date, sectionId, bulkMutation, enqueueSnackbar, t]);

  const handleReset = useCallback(() => {
    setState("idle");
    setRows([]);
    setFileName("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin-panel/students/attendance">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RiArrowLeftLine className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h3 className="text-3xl font-bold tracking-tight">
                {t(`${NS}:bulk.title`)}
              </h3>
              <p className="text-paragraph-sm text-text-soft-400">
                {t(`${NS}:bulk.description`)}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <RiDownloadLine className="mr-1 h-4 w-4" />
            {t(`${NS}:bulk.downloadTemplate`)}
          </Button>
        </div>

        {/* Date & Section */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:mark.selectDate`)}
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:mark.selectSection`)}
            </label>
            <Select value={sectionId} onValueChange={(v) => setSectionId(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t(`${NS}:mark.selectSection`)} />
              </SelectTrigger>
              <SelectContent>
                {(sections ?? []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* State: Idle — Upload */}
        {state === "idle" && (
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stroke-soft-200 p-12 transition-colors hover:border-primary-base hover:bg-bg-weak-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <RiUploadLine className="mb-3 h-10 w-10 text-text-soft-400" />
            <p className="text-paragraph-md font-medium text-text-strong-950">
              {t(`${NS}:bulk.dropzone`)}
            </p>
            <p className="mt-1 text-paragraph-sm text-text-soft-400">
              {t(`${NS}:bulk.csvFormat`)}
            </p>
            <p className="text-paragraph-xs text-text-soft-400">
              {t(`${NS}:bulk.maxSize`)}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* State: Preview */}
        {state === "preview" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-stroke-soft-200 p-4">
              <div className="flex items-center gap-3">
                <RiFileTextLine className="h-6 w-6 text-primary-base" />
                <div>
                  <p className="text-paragraph-sm font-medium">{fileName}</p>
                  <p className="text-paragraph-xs text-text-soft-400">
                    {t(`${NS}:bulk.rows`, { count: rows.length })} •{" "}
                    <span className="text-success-base">
                      {t(`${NS}:bulk.validRows`)}: {validRows.length}
                    </span>{" "}
                    •{" "}
                    <span className="text-error-base">
                      {t(`${NS}:bulk.invalidRows`)}: {invalidRows.length}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  {t(`${NS}:actions.cancel`)}
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={validRows.length === 0}
                >
                  <RiCheckLine className="mr-1 h-4 w-4" />
                  {t(`${NS}:bulk.import`)}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Valid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={row.isValid ? "" : "bg-error-lighter/30"}
                    >
                      <TableCell className="text-paragraph-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {row.attendableId}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {row.studentName ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {row.studentId ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === AttendanceStatus.PRESENT
                              ? "success"
                              : row.status === AttendanceStatus.ABSENT
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {row.checkIn ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {row.checkOut ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-text-soft-400">
                        {row.remarks ?? "—"}
                      </TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <RiCheckLine className="h-4 w-4 text-success-base" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <RiCloseLine className="h-4 w-4 text-error-base" />
                            <span className="text-paragraph-xs text-error-base">
                              {row.error}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* State: Importing */}
        {state === "importing" && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-paragraph-md text-text-soft-400">
              {t(`${NS}:bulk.importing`)}
            </p>
          </div>
        )}

        {/* State: Done */}
        {state === "done" && result && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-stroke-soft-200 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-lighter">
              <RiCheckLine className="h-8 w-8 text-success-base" />
            </div>
            <p className="mt-4 text-paragraph-lg font-medium text-text-strong-950">
              {t(`${NS}:bulk.success`, {
                marked: result.marked,
                skipped: result.skipped,
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={handleReset}
            >
              {t(`${NS}:bulk.backToUpload`)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(BulkAttendance, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
