"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { PropsWithChildren, useCallback, useState } from "react";
import {
  useStudentsListQuery,
  useDeleteStudentMutation,
} from "./queries/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiArrowUpDownLine,
  RiAddLine,
  RiMoreLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiUserAddLine,
  RiFileTextLine,
  RiDownloadLine,
  RiUploadLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSkipBackLine,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import StudentFilter from "./components/student-filter";
import AddStudentModal from "./components/add-student-modal";
import StudentDetailModal from "./components/student-detail-modal";
import EnrollStudentModal from "./components/enroll-student-modal";
import BulkImportModal from "./components/bulk-import-modal";
import type { Student, StudentFilterType, StudentSortType } from "./types";

type StudentKeys = keyof Student;

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: StudentKeys;
    order: "ASC" | "DESC";
    column: StudentKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: StudentKeys
    ) => void;
  }>
) {
  return (
    <TableHead style={{ width: props.width }}>
      <button
        className="inline-flex items-center gap-1 font-medium hover:text-text-strong-950"
        onClick={(event) => props.handleRequestSort(event, props.column)}
      >
        {props.children}
        {props.orderBy === props.column ? (
          props.order === "ASC" ? (
            <RiArrowUpSLine className="h-4 w-4" />
          ) : (
            <RiArrowDownSLine className="h-4 w-4" />
          )
        ) : (
          <RiArrowUpDownLine className="h-4 w-4 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StudentRegistrations() {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const deleteMutation = useDeleteStudentMutation();

  // Filter state
  const [filter, setFilter] = useState<StudentFilterType>({});

  // Sort state
  const [sort, setSort] = useState<StudentSortType>({
    order: "DESC",
    orderBy: "createdAt",
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | undefined>();
  const [detailStudentId, setDetailStudentId] = useState<number | null>(null);
  const [enrollStudent, setEnrollStudent] = useState<Student | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const { data: queryResult, isLoading } = useStudentsListQuery(
    filter,
    sort,
    page + 1, // API uses 1-based pages, UI uses 0-based
    rowsPerPage
  );

  const paginatedData = queryResult?.data ?? [];
  const hasNextPage = queryResult?.hasNextPage ?? false;

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: StudentKeys) => {
      const isAsc = sort.orderBy === property && sort.order === "ASC";
      setSort({
        order: isAsc ? "DESC" : "ASC",
        orderBy: property,
      });
      setPage(0);
    },
    [sort]
  );

  const handleDelete = useCallback(
    async (student: Student) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-students-registrations:confirm.delete.title"),
        message: t("admin-panel-students-registrations:confirm.delete.message"),
      });

      if (isConfirmed) {
        try {
          await deleteMutation.mutateAsync(student.id);
          enqueueSnackbar(
            t("admin-panel-students-registrations:confirm.delete.success"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar("Failed to delete student", { variant: "error" });
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  const handleEdit = useCallback((student: Student) => {
    setEditStudent(student);
    setAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback((open: boolean) => {
    setAddModalOpen(open);
    if (!open) {
      setEditStudent(undefined);
    }
  }, []);

  const handleDetailEdit = useCallback(
    (student: Student) => {
      setDetailStudentId(null);
      handleEdit(student);
    },
    [handleEdit]
  );

  const handleExport = useCallback(() => {
    if (!paginatedData || paginatedData.length === 0) {
      enqueueSnackbar(t("admin-panel-students-registrations:export.noData"), {
        variant: "error",
      });
      return;
    }

    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Email",
      "Gender",
      "Phone",
      "Guardian Name",
      "Guardian Phone",
      "Class / Section",
      "Registered Date",
    ];
    const csvRows = [
      headers.join(","),
      ...paginatedData.map((s) =>
        [
          s.rollNumber || s.studentId || "",
          s.firstName || "",
          s.lastName || "",
          s.email || "",
          s.gender || "",
          s.phone || "",
          s.guardianName || "",
          s.guardianPhone || "",
          [s.className, s.sectionName].filter(Boolean).join(" - ") || "",
          s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    enqueueSnackbar(t("admin-panel-students-registrations:export.success"), {
      variant: "success",
    });
  }, [paginatedData, enqueueSnackbar, t]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-students-registrations:title")}
          </h3>
          <div className="flex items-center gap-2">
            <StudentFilter
              filter={filter}
              onFilterChange={(newFilter) => {
                setFilter(newFilter);
                setPage(0);
              }}
            />
            <Button variant="outline" onClick={handleExport}>
              <RiDownloadLine className="mr-1 h-4 w-4" />
              {t("admin-panel-students-registrations:actions.export")}
            </Button>
            <Button variant="outline" onClick={() => setImportModalOpen(true)}>
              <RiUploadLine className="mr-1 h-4 w-4" />
              {t("admin-panel-students-registrations:actions.importStudents")}
            </Button>
            <Button onClick={() => setAddModalOpen(true)}>
              <RiAddLine className="mr-1 h-4 w-4" />
              {t("admin-panel-students-registrations:actions.addStudent")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 50 }}>
                  {t("admin-panel-students-registrations:table.columns.photo")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t(
                    "admin-panel-students-registrations:table.columns.studentId"
                  )}
                </TableHead>
                <TableSortCellWrapper
                  width={180}
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="firstName"
                  handleRequestSort={handleRequestSort}
                >
                  {t("admin-panel-students-registrations:table.columns.name")}
                </TableSortCellWrapper>
                <TableHead style={{ width: 180 }}>
                  {t("admin-panel-students-registrations:table.columns.email")}
                </TableHead>
                <TableHead style={{ width: 130 }}>
                  {t(
                    "admin-panel-students-registrations:table.columns.classSection"
                  )}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t(
                    "admin-panel-students-registrations:table.columns.contactNumber"
                  )}
                </TableHead>
                <TableHead style={{ width: 130 }}>
                  {t(
                    "admin-panel-students-registrations:table.columns.guardianName"
                  )}
                </TableHead>
                <TableSortCellWrapper
                  width={120}
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="createdAt"
                  handleRequestSort={handleRequestSort}
                >
                  {t(
                    "admin-panel-students-registrations:table.columns.registeredDate"
                  )}
                </TableSortCellWrapper>
                <TableHead style={{ width: 60 }}>
                  {t(
                    "admin-panel-students-registrations:table.columns.actions"
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !paginatedData || paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-students-registrations:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((student) => {
                  const initials =
                    `${(student.firstName ?? "")[0] ?? ""}${(student.lastName ?? "")[0] ?? ""}`.toUpperCase();
                  const classSection = [student.className, student.sectionName]
                    .filter(Boolean)
                    .join(" - ");

                  return (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-bg-weak-50"
                      onClick={() => setDetailStudentId(student.id)}
                    >
                      <TableCell>
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials || "?"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-text-sub-600">
                        {student.rollNumber || student.studentId || "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        <p className="text-paragraph-sm text-text-strong-950">
                          {student.firstName} {student.lastName}
                        </p>
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {student.email || "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {classSection || "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {student.phone || "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {student.guardianName || "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {formatDate(student.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <RiMoreLine className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailStudentId(student.id);
                              }}
                            >
                              <RiEyeLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-students-registrations:actions.view"
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(student);
                              }}
                            >
                              <RiEditLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-students-registrations:actions.edit"
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEnrollStudent(student);
                              }}
                            >
                              <RiUserAddLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-students-registrations:actions.enroll"
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailStudentId(student.id);
                              }}
                            >
                              <RiFileTextLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-students-registrations:actions.uploadDocument"
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error-base focus:text-error-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDelete(student);
                              }}
                            >
                              <RiDeleteBinLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-students-registrations:actions.delete"
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {paginatedData.length > 0 && (
          <div data-testid="admin-students-registrations-page" className="flex items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
              <span>
                {t("admin-panel-students-registrations:pagination.rowsPerPage")}
              </span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
              <span>
                {t("admin-panel-students-registrations:pagination.pageLabel", {
                  current: page + 1,
                })}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                >
                  <RiSkipBackLine className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                >
                  <RiArrowLeftSLine className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={!hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <RiArrowRightSLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        open={addModalOpen}
        onOpenChange={handleCloseAddModal}
        editData={editStudent}
      />

      {detailStudentId !== null && (
        <StudentDetailModal
          open={detailStudentId !== null}
          onOpenChange={(open) => {
            if (!open) setDetailStudentId(null);
          }}
          studentId={detailStudentId}
          onEdit={handleDetailEdit}
        />
      )}

      {enrollStudent && (
        <EnrollStudentModal
          open={enrollStudent !== null}
          onOpenChange={(open) => {
            if (!open) setEnrollStudent(null);
          }}
          studentId={enrollStudent.id}
          studentName={`${enrollStudent.firstName ?? ""} ${enrollStudent.lastName ?? ""}`.trim()}
        />
      )}

      <BulkImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
  );
}

export default withPageRequiredAuth(StudentRegistrations, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});
