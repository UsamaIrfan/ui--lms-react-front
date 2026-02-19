"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useClassesListQuery,
  useSectionsListQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useCreateSectionMutation,
  useDeleteSectionMutation,
} from "./queries/queries";
import type { GradeClassItem, SectionItem } from "./queries/queries";
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
  RiAddLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import useTenant from "@/services/tenant/use-tenant";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function AcademicClasses() {
  const { t } = useTranslation("admin-panel-academics-classes");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const { tenantId } = useTenant();

  const createClassMutation = useCreateClassMutation();
  const updateClassMutation = useUpdateClassMutation();
  const deleteClassMutation = useDeleteClassMutation();
  const createSectionMutation = useCreateSectionMutation();
  const deleteSectionMutation = useDeleteSectionMutation();

  const { data: classes, isLoading: classesLoading } = useClassesListQuery();
  const { data: sections, isLoading: sectionsLoading } = useSectionsListQuery();

  // Class modal
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<GradeClassItem | null>(null);
  const [className, setClassName] = useState("");
  const [classNumericGrade, setClassNumericGrade] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [classInstitutionId, setClassInstitutionId] = useState("");

  // Section modal
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionCapacity, setSectionCapacity] = useState("30");
  const [sectionGradeClassId, setSectionGradeClassId] = useState("");

  const resetClassForm = useCallback(() => {
    setClassName("");
    setClassNumericGrade("");
    setClassDescription("");
    setClassInstitutionId("");
  }, []);

  const resetSectionForm = useCallback(() => {
    setSectionName("");
    setSectionCapacity("30");
    setSectionGradeClassId("");
  }, []);

  const handleOpenCreateClass = useCallback(() => {
    setEditClass(null);
    resetClassForm();
    setClassModalOpen(true);
  }, [resetClassForm]);

  const handleOpenEditClass = useCallback((item: GradeClassItem) => {
    setEditClass(item);
    setClassName(item.name);
    setClassNumericGrade(
      item.numericGrade !== null && item.numericGrade !== undefined
        ? String(item.numericGrade)
        : ""
    );
    setClassDescription(item.description ?? "");
    setClassInstitutionId(String(item.institutionId));
    setClassModalOpen(true);
  }, []);

  const handleSubmitClass = useCallback(async () => {
    if (!className || !classInstitutionId) {
      enqueueSnackbar(
        t("admin-panel-academics-classes:form.validation.nameRequired"),
        { variant: "error" }
      );
      return;
    }
    try {
      if (editClass) {
        await updateClassMutation.mutateAsync({
          id: editClass.id,
          data: {
            name: className,
            numericGrade: classNumericGrade
              ? (Number(classNumericGrade) as any)
              : undefined,
            description: (classDescription || undefined) as any,
            institutionId: Number(classInstitutionId),
          },
        });
        enqueueSnackbar(
          t("admin-panel-academics-classes:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createClassMutation.mutateAsync({
          tenantId: tenantId ?? "",
          name: className,
          numericGrade: classNumericGrade
            ? (Number(classNumericGrade) as any)
            : undefined,
          description: (classDescription || undefined) as any,
          institutionId: Number(classInstitutionId),
        });
        enqueueSnackbar(
          t("admin-panel-academics-classes:notifications.created"),
          { variant: "success" }
        );
      }
      setClassModalOpen(false);
      resetClassForm();
    } catch {
      enqueueSnackbar(t("admin-panel-academics-classes:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    className,
    classNumericGrade,
    classDescription,
    classInstitutionId,
    editClass,
    tenantId,
    createClassMutation,
    updateClassMutation,
    enqueueSnackbar,
    t,
    resetClassForm,
  ]);

  const handleDeleteClass = useCallback(
    async (item: GradeClassItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-classes:confirm.deleteTitle"),
        message: t("admin-panel-academics-classes:confirm.delete"),
      });
      if (isConfirmed) {
        try {
          await deleteClassMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-classes:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-academics-classes:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteClassMutation, enqueueSnackbar, t]
  );

  const handleOpenCreateSection = useCallback(() => {
    resetSectionForm();
    setSectionModalOpen(true);
  }, [resetSectionForm]);

  const handleSubmitSection = useCallback(async () => {
    if (!sectionName || !sectionGradeClassId) return;
    try {
      await createSectionMutation.mutateAsync({
        tenantId: tenantId ?? "",
        name: sectionName,
        gradeClassId: Number(sectionGradeClassId),
        capacity: Number(sectionCapacity),
      });
      enqueueSnackbar(
        t("admin-panel-academics-classes:notifications.sectionCreated"),
        { variant: "success" }
      );
      setSectionModalOpen(false);
      resetSectionForm();
    } catch {
      enqueueSnackbar(t("admin-panel-academics-classes:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    sectionName,
    sectionGradeClassId,
    sectionCapacity,
    tenantId,
    createSectionMutation,
    enqueueSnackbar,
    t,
    resetSectionForm,
  ]);

  const handleDeleteSection = useCallback(
    async (item: SectionItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-classes:confirm.deleteTitle"),
        message: t("admin-panel-academics-classes:confirm.deleteSection"),
      });
      if (isConfirmed) {
        try {
          await deleteSectionMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-classes:notifications.sectionDeleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-academics-classes:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteSectionMutation, enqueueSnackbar, t]
  );

  const getSectionsForClass = useCallback(
    (classId: number) => {
      return (sections ?? []).filter((s) => s.gradeClassId === classId);
    },
    [sections]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-academics-classes:title")}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleOpenCreateSection}>
              <RiAddLine className="mr-1 h-4 w-4" />
              {t("admin-panel-academics-classes:sections.actions.create")}
            </Button>
            <Button onClick={handleOpenCreateClass}>
              <RiAddLine className="mr-1 h-4 w-4" />
              {t("admin-panel-academics-classes:actions.create")}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-academics-classes:table.columns.name")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t(
                    "admin-panel-academics-classes:table.columns.numericGrade"
                  )}
                </TableHead>
                <TableHead style={{ width: 250 }}>
                  {t("admin-panel-academics-classes:table.columns.description")}
                </TableHead>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-academics-classes:sections.title")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-academics-classes:table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classesLoading || sectionsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !classes || classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-academics-classes:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((item) => {
                  const classSections = getSectionsForClass(item.id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.numericGrade ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {classSections.length > 0 ? (
                            classSections.map((sec) => (
                              <Badge
                                key={sec.id}
                                variant="outline"
                                className="gap-1"
                              >
                                {sec.name}
                                <button
                                  className="ml-1 text-error-base hover:text-error-dark"
                                  onClick={() => void handleDeleteSection(sec)}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-paragraph-sm text-text-soft-400">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                            >
                              <RiMoreLine className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditClass(item)}
                            >
                              <RiEditLine className="mr-2 h-4 w-4" />
                              {t("admin-panel-academics-classes:actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error-base focus:text-error-base"
                              onClick={() => void handleDeleteClass(item)}
                            >
                              <RiDeleteBinLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-academics-classes:actions.delete"
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
      </div>

      {/* Class Modal */}
      <Dialog.Dialog open={classModalOpen} onOpenChange={setClassModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editClass
                ? t("admin-panel-academics-classes:actions.edit")
                : t("admin-panel-academics-classes:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-academics-classes:form.name")}</Label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-classes:form.institutionId")}
              </Label>
              <Input
                type="number"
                value={classInstitutionId}
                onChange={(e) => setClassInstitutionId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-classes:form.numericGrade")}
              </Label>
              <Input
                type="number"
                value={classNumericGrade}
                onChange={(e) => setClassNumericGrade(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-classes:form.description")}
              </Label>
              <Input
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setClassModalOpen(false)}>
              {t("admin-panel-academics-classes:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitClass()}
              disabled={
                createClassMutation.isPending || updateClassMutation.isPending
              }
            >
              {(createClassMutation.isPending ||
                updateClassMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-classes:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Section Modal */}
      <Dialog.Dialog open={sectionModalOpen} onOpenChange={setSectionModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[400px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-academics-classes:sections.actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-classes:sections.form.name")}
              </Label>
              <Input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-classes:sections.form.gradeClassId")}
              </Label>
              <Input
                type="number"
                value={sectionGradeClassId}
                onChange={(e) => setSectionGradeClassId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-classes:sections.form.capacity")}
              </Label>
              <Input
                type="number"
                value={sectionCapacity}
                onChange={(e) => setSectionCapacity(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSectionModalOpen(false)}
            >
              {t("admin-panel-academics-classes:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitSection()}
              disabled={createSectionMutation.isPending}
            >
              {createSectionMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-classes:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AcademicClasses, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
