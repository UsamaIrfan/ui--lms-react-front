"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { PropsWithChildren, useCallback, useState } from "react";
import {
  useEnquiriesListQuery,
  useDeleteEnquiryMutation,
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
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiArrowUpDownLine,
  RiAddLine,
  RiMoreLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiUserAddLine,
  RiChat3Line,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import EnquiryFilter from "./components/enquiry-filter";
import AddEnquiryModal from "./components/add-enquiry-modal";
import EnquiryDetailModal from "./components/enquiry-detail-modal";
import ConvertToStudentModal from "./components/convert-to-student-modal";
import { StatusBadge } from "./components/status-badge";
import {
  EnquiryStatus,
  type AdmissionEnquiry,
  type EnquiryFilterType,
  type EnquirySortType,
} from "./types";

type EnquiryKeys = keyof AdmissionEnquiry;

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: EnquiryKeys;
    order: "ASC" | "DESC";
    column: EnquiryKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: EnquiryKeys
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

function Enquiries() {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const deleteMutation = useDeleteEnquiryMutation();

  // Filter state
  const [filter, setFilter] = useState<EnquiryFilterType>({});

  // Sort state
  const [sort, setSort] = useState<EnquirySortType>({
    order: "DESC",
    orderBy: "createdAt",
  });

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editEnquiry, setEditEnquiry] = useState<
    AdmissionEnquiry | undefined
  >();
  const [detailEnquiryId, setDetailEnquiryId] = useState<number | null>(null);
  const [convertEnquiry, setConvertEnquiry] = useState<AdmissionEnquiry | null>(
    null
  );

  const { data, isLoading } = useEnquiriesListQuery(filter, sort);

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: EnquiryKeys) => {
      const isAsc = sort.orderBy === property && sort.order === "ASC";
      setSort({
        order: isAsc ? "DESC" : "ASC",
        orderBy: property,
      });
    },
    [sort]
  );

  const handleDelete = useCallback(
    async (enquiry: AdmissionEnquiry) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-students-enquiries:confirm.delete.title"),
        message: t("admin-panel-students-enquiries:confirm.delete.message"),
      });

      if (isConfirmed) {
        try {
          await deleteMutation.mutateAsync(enquiry.id);
          enqueueSnackbar(
            t("admin-panel-students-enquiries:confirm.delete.success"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar("Failed to delete enquiry", { variant: "error" });
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  const handleEdit = useCallback((enquiry: AdmissionEnquiry) => {
    setEditEnquiry(enquiry);
    setAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback((open: boolean) => {
    setAddModalOpen(open);
    if (!open) {
      setEditEnquiry(undefined);
    }
  }, []);

  const canConvert = useCallback((enquiry: AdmissionEnquiry) => {
    return [
      EnquiryStatus.APPLIED,
      EnquiryStatus.ACCEPTED,
      EnquiryStatus.VISIT_DONE,
    ].includes(enquiry.status);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-students-enquiries:title")}
          </h3>
          <div className="flex items-center gap-2">
            <EnquiryFilter filter={filter} onFilterChange={setFilter} />
            <Button onClick={() => setAddModalOpen(true)}>
              <RiAddLine className="mr-1 h-4 w-4" />
              {t("admin-panel-students-enquiries:actions.addEnquiry")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableSortCellWrapper
                  width={200}
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="studentName"
                  handleRequestSort={handleRequestSort}
                >
                  {t("admin-panel-students-enquiries:table.columns.name")}
                </TableSortCellWrapper>
                <TableHead style={{ width: 180 }}>
                  {t("admin-panel-students-enquiries:table.columns.email")}
                </TableHead>
                <TableHead style={{ width: 130 }}>
                  {t("admin-panel-students-enquiries:table.columns.phone")}
                </TableHead>
                <TableHead style={{ width: 150 }}>
                  {t(
                    "admin-panel-students-enquiries:table.columns.gradeApplyingFor"
                  )}
                </TableHead>
                <TableHead style={{ width: 130 }}>
                  {t("admin-panel-students-enquiries:table.columns.source")}
                </TableHead>
                <TableSortCellWrapper
                  width={140}
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="status"
                  handleRequestSort={handleRequestSort}
                >
                  {t("admin-panel-students-enquiries:table.columns.status")}
                </TableSortCellWrapper>
                <TableSortCellWrapper
                  width={130}
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="createdAt"
                  handleRequestSort={handleRequestSort}
                >
                  {t(
                    "admin-panel-students-enquiries:table.columns.enquiryDate"
                  )}
                </TableSortCellWrapper>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-students-enquiries:table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-students-enquiries:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((enquiry) => (
                  <TableRow
                    key={enquiry.id}
                    className="cursor-pointer hover:bg-bg-weak-50"
                    onClick={() => setDetailEnquiryId(enquiry.id)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-paragraph-sm text-text-strong-950">
                          {enquiry.studentName}
                        </p>
                        {enquiry.guardianName && (
                          <p className="text-label-xs text-text-soft-400">
                            {enquiry.guardianName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {enquiry.email || "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {enquiry.phone || "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {enquiry.gradeApplyingFor || "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {t(
                        `admin-panel-students-enquiries:source.${enquiry.source}`
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={enquiry.status} />
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {formatDate(enquiry.createdAt)}
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
                              setDetailEnquiryId(enquiry.id);
                            }}
                          >
                            <RiEyeLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-students-enquiries:actions.view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(enquiry);
                            }}
                          >
                            <RiEditLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-students-enquiries:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailEnquiryId(enquiry.id);
                            }}
                          >
                            <RiChat3Line className="mr-2 h-4 w-4" />
                            {t(
                              "admin-panel-students-enquiries:actions.followUp"
                            )}
                          </DropdownMenuItem>
                          {canConvert(enquiry) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConvertEnquiry(enquiry);
                                }}
                              >
                                <RiUserAddLine className="mr-2 h-4 w-4" />
                                {t(
                                  "admin-panel-students-enquiries:actions.convert"
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete(enquiry);
                            }}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-students-enquiries:actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {data && data.length > 0 && (
          <div className="text-paragraph-sm text-text-soft-400">
            {t("admin-panel-students-enquiries:pagination.showing", {
              from: 1,
              to: data.length,
              total: data.length,
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEnquiryModal
        open={addModalOpen}
        onOpenChange={handleCloseAddModal}
        editData={editEnquiry}
      />

      {detailEnquiryId !== null && (
        <EnquiryDetailModal
          open={detailEnquiryId !== null}
          onOpenChange={(open) => {
            if (!open) setDetailEnquiryId(null);
          }}
          enquiryId={detailEnquiryId}
          onEdit={(enquiry) => {
            setDetailEnquiryId(null);
            handleEdit(enquiry);
          }}
          onDeleted={() => setDetailEnquiryId(null)}
        />
      )}

      {convertEnquiry && (
        <ConvertToStudentModal
          open={convertEnquiry !== null}
          onOpenChange={(open) => {
            if (!open) setConvertEnquiry(null);
          }}
          enquiry={convertEnquiry}
        />
      )}
    </div>
  );
}

export default withPageRequiredAuth(Enquiries, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});
