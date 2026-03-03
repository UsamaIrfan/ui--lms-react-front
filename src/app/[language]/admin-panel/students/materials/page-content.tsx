"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useMaterialsListQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useAssignmentsListQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
} from "./queries/queries";
import type {
  MaterialItem,
  AssignmentItem,
  SubmissionItem,
} from "./queries/queries";
import { useSubjectsListQuery } from "../../academics/subjects/queries/queries";
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
import { Badge } from "@/components/ui/badge";
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
  RiEyeLine,
  RiCheckLine,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MATERIAL_TYPES = [
  "document",
  "video",
  "assignment",
  "link",
  "presentation",
];

function StudentsMaterials() {
  const { t } = useTranslation("admin-panel-students-materials");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<"materials" | "assignments">(
    "materials"
  );

  // Materials
  const { data: materials, isLoading: matLoading } = useMaterialsListQuery();
  const { data: subjects } = useSubjectsListQuery();
  const createMaterialMut = useCreateMaterialMutation();
  const updateMaterialMut = useUpdateMaterialMutation();
  const deleteMaterialMut = useDeleteMaterialMutation();

  const [matModalOpen, setMatModalOpen] = useState(false);
  const [editMat, setEditMat] = useState<MaterialItem | null>(null);
  const [matTitle, setMatTitle] = useState("");
  const [matSubjectId, setMatSubjectId] = useState("");
  const [matType, setMatType] = useState("document");
  const [matDescription, setMatDescription] = useState("");
  const [matExternalUrl, setMatExternalUrl] = useState("");
  const [matIsActive, setMatIsActive] = useState(true);

  // Assignments
  const { data: assignments, isLoading: assignLoading } =
    useAssignmentsListQuery();
  const createAssignmentMut = useCreateAssignmentMutation();
  const updateAssignmentMut = useUpdateAssignmentMutation();
  const deleteAssignmentMut = useDeleteAssignmentMutation();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editAssign, setEditAssign] = useState<AssignmentItem | null>(null);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");
  const [assignDescription, setAssignDescription] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignTotalMarks, setAssignTotalMarks] = useState("");
  const [assignIsActive, setAssignIsActive] = useState(true);

  // Submissions & Grading
  const [submissionsAssignmentId, setSubmissionsAssignmentId] = useState<
    number | null
  >(null);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] =
    useState<SubmissionItem | null>(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeGrade, setGradeGrade] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  const { data: submissions, isLoading: submissionsLoading } =
    useAssignmentSubmissionsQuery(submissionsAssignmentId);
  const gradeSubmissionMut = useGradeSubmissionMutation();

  const resetMatForm = useCallback(() => {
    setMatTitle("");
    setMatSubjectId("");
    setMatType("document");
    setMatDescription("");
    setMatExternalUrl("");
    setMatIsActive(true);
  }, []);

  const resetAssignForm = useCallback(() => {
    setAssignTitle("");
    setAssignSubjectId("");
    setAssignDescription("");
    setAssignDueDate("");
    setAssignTotalMarks("");
    setAssignIsActive(true);
  }, []);

  // Material handlers
  const handleOpenCreateMat = useCallback(() => {
    setEditMat(null);
    resetMatForm();
    setMatModalOpen(true);
  }, [resetMatForm]);

  const handleOpenEditMat = useCallback((item: MaterialItem) => {
    setEditMat(item);
    setMatTitle(item.title);
    setMatSubjectId(String(item.subjectId));
    setMatType(item.type ?? "document");
    setMatDescription(item.description ?? "");
    setMatExternalUrl(item.externalUrl ?? "");
    setMatIsActive(item.isActive ?? true);
    setMatModalOpen(true);
  }, []);

  const handleSubmitMat = useCallback(async () => {
    if (!matTitle || !matSubjectId) {
      enqueueSnackbar(
        t("admin-panel-students-materials:form.validation.required"),
        { variant: "error" }
      );
      return;
    }
    try {
      const payload = {
        title: matTitle,
        subjectId: Number(matSubjectId),
        type: matType,
        description: matDescription || undefined,
        externalUrl: matExternalUrl || undefined,
        isActive: matIsActive,
      };
      if (editMat) {
        await updateMaterialMut.mutateAsync({ id: editMat.id, data: payload });
        enqueueSnackbar(
          t("admin-panel-students-materials:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMaterialMut.mutateAsync({
          ...payload,
        } as any);
        enqueueSnackbar(
          t("admin-panel-students-materials:notifications.created"),
          { variant: "success" }
        );
      }
      setMatModalOpen(false);
      resetMatForm();
    } catch {
      enqueueSnackbar(t("admin-panel-students-materials:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    matTitle,
    matSubjectId,
    matType,
    matDescription,
    matExternalUrl,
    matIsActive,
    editMat,
    createMaterialMut,
    updateMaterialMut,
    enqueueSnackbar,
    t,
    resetMatForm,
  ]);

  const handleDeleteMat = useCallback(
    async (item: MaterialItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-students-materials:confirm.deleteTitle"),
        message: t("admin-panel-students-materials:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMaterialMut.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-students-materials:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-students-materials:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMaterialMut, enqueueSnackbar, t]
  );

  // Assignment handlers
  const handleOpenCreateAssign = useCallback(() => {
    setEditAssign(null);
    resetAssignForm();
    setAssignModalOpen(true);
  }, [resetAssignForm]);

  const handleOpenEditAssign = useCallback((item: AssignmentItem) => {
    setEditAssign(item);
    setAssignTitle(item.title);
    setAssignSubjectId(String(item.subjectId));
    setAssignDescription(
      typeof item.description === "string" ? item.description : ""
    );
    setAssignDueDate(item.dueDate?.split("T")[0] ?? "");
    setAssignTotalMarks(String(item.totalMarks));
    setAssignIsActive(item.isActive ?? true);
    setAssignModalOpen(true);
  }, []);

  const handleSubmitAssign = useCallback(async () => {
    if (
      !assignTitle ||
      !assignSubjectId ||
      !assignDueDate ||
      !assignTotalMarks
    ) {
      enqueueSnackbar(
        t("admin-panel-students-materials:form.validation.required"),
        { variant: "error" }
      );
      return;
    }
    try {
      const payload = {
        title: assignTitle,
        subjectId: Number(assignSubjectId),
        dueDate: assignDueDate,
        totalMarks: Number(assignTotalMarks),
        description: assignDescription || undefined,
        isActive: assignIsActive,
      };
      if (editAssign) {
        await updateAssignmentMut.mutateAsync({
          id: editAssign.id,
          data: payload,
        });
        enqueueSnackbar(
          t("admin-panel-students-materials:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createAssignmentMut.mutateAsync({
          ...payload,
        } as any);
        enqueueSnackbar(
          t("admin-panel-students-materials:notifications.created"),
          { variant: "success" }
        );
      }
      setAssignModalOpen(false);
      resetAssignForm();
    } catch {
      enqueueSnackbar(t("admin-panel-students-materials:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    assignTitle,
    assignSubjectId,
    assignDueDate,
    assignTotalMarks,
    assignDescription,
    assignIsActive,
    editAssign,
    createAssignmentMut,
    updateAssignmentMut,
    enqueueSnackbar,
    t,
    resetAssignForm,
  ]);

  const handleDeleteAssign = useCallback(
    async (item: AssignmentItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-students-materials:confirm.deleteTitle"),
        message: t("admin-panel-students-materials:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteAssignmentMut.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-students-materials:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-students-materials:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteAssignmentMut, enqueueSnackbar, t]
  );

  // Submissions & Grading handlers
  const handleViewSubmissions = useCallback((item: AssignmentItem) => {
    setSubmissionsAssignmentId(item.id);
    setSubmissionsModalOpen(true);
  }, []);

  const handleOpenGrade = useCallback((sub: SubmissionItem) => {
    setGradingSubmission(sub);
    setGradeMarks(sub.marks != null ? String(sub.marks) : "");
    setGradeGrade(sub.grade ?? "");
    setGradeFeedback(sub.feedback ?? "");
    setGradeModalOpen(true);
  }, []);

  const handleSubmitGrade = useCallback(async () => {
    if (!gradingSubmission || !gradeMarks) {
      enqueueSnackbar(
        t("admin-panel-students-materials:form.validation.required"),
        { variant: "error" }
      );
      return;
    }
    try {
      await gradeSubmissionMut.mutateAsync({
        id: gradingSubmission.id,
        marks: Number(gradeMarks),
        grade: gradeGrade || undefined,
        feedback: gradeFeedback || undefined,
      });
      enqueueSnackbar(
        t("admin-panel-students-materials:notifications.graded"),
        { variant: "success" }
      );
      setGradeModalOpen(false);
      setGradingSubmission(null);
    } catch {
      enqueueSnackbar(t("admin-panel-students-materials:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    gradingSubmission,
    gradeMarks,
    gradeGrade,
    gradeFeedback,
    gradeSubmissionMut,
    enqueueSnackbar,
    t,
  ]);

  const tabClass = (tab: string) =>
    `px-4 py-2 text-paragraph-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50"}`;

  return (
    <div
      data-testid="admin-students-materials-page"
      className="mx-auto max-w-7xl px-4"
    >
      <div className="grid gap-6 pt-6">
        <h3 className="text-3xl font-bold tracking-tight">
          {t("admin-panel-students-materials:title")}
        </h3>

        <div className="flex gap-2">
          <button
            className={tabClass("materials")}
            onClick={() => setActiveTab("materials")}
          >
            {t("admin-panel-students-materials:tabs.materials")}
          </button>
          <button
            className={tabClass("assignments")}
            onClick={() => setActiveTab("assignments")}
          >
            {t("admin-panel-students-materials:tabs.assignments")}
          </button>
        </div>

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <>
            <div className="flex justify-end">
              <Button onClick={handleOpenCreateMat}>
                <RiAddLine className="mr-1 h-4 w-4" />
                {t("admin-panel-students-materials:actions.createMaterial")}
              </Button>
            </div>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-students-materials:table.title")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.type")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.subjectId")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.status")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.downloads")}
                    </TableHead>
                    <TableHead style={{ width: 60 }}>
                      {t("admin-panel-students-materials:table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : !materials || materials.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("admin-panel-students-materials:table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                          {item.title}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.type ?? "—"}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.subjectId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.isActive ? "default" : "outline"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.downloadCount ?? 0}
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
                                onClick={() => handleOpenEditMat(item)}
                              >
                                <RiEditLine className="mr-2 h-4 w-4" />
                                {t(
                                  "admin-panel-students-materials:actions.edit"
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error-base focus:text-error-base"
                                onClick={() => void handleDeleteMat(item)}
                              >
                                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                                {t(
                                  "admin-panel-students-materials:actions.delete"
                                )}
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
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <>
            <div className="flex justify-end">
              <Button onClick={handleOpenCreateAssign}>
                <RiAddLine className="mr-1 h-4 w-4" />
                {t("admin-panel-students-materials:actions.createAssignment")}
              </Button>
            </div>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-students-materials:table.title")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.subjectId")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.dueDate")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.totalMarks")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-materials:table.status")}
                    </TableHead>
                    <TableHead style={{ width: 60 }}>
                      {t("admin-panel-students-materials:table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : !assignments || assignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("admin-panel-students-materials:table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                          {item.title}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.subjectId}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.totalMarks}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.isActive ? "default" : "outline"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
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
                                onClick={() => handleViewSubmissions(item)}
                              >
                                <RiEyeLine className="mr-2 h-4 w-4" />
                                {t(
                                  "admin-panel-students-materials:actions.viewSubmissions"
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenEditAssign(item)}
                              >
                                <RiEditLine className="mr-2 h-4 w-4" />
                                {t(
                                  "admin-panel-students-materials:actions.edit"
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error-base focus:text-error-base"
                                onClick={() => void handleDeleteAssign(item)}
                              >
                                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                                {t(
                                  "admin-panel-students-materials:actions.delete"
                                )}
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
          </>
        )}
      </div>

      {/* Create/Edit Material Modal */}
      <Dialog.Dialog open={matModalOpen} onOpenChange={setMatModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[550px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editMat
                ? t("admin-panel-students-materials:actions.edit")
                : t("admin-panel-students-materials:actions.createMaterial")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-materials:form.title")}</Label>
              <Input
                value={matTitle}
                onChange={(e) => setMatTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-students-materials:form.subjectId")}
                </Label>
                <Select
                  value={matSubjectId}
                  onValueChange={(v) => setMatSubjectId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjects ?? []).map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-students-materials:form.type")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                  value={matType}
                  onChange={(e) => setMatType(e.target.value)}
                >
                  {MATERIAL_TYPES.map((mt) => (
                    <option key={mt} value={mt}>
                      {mt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-materials:form.description")}
              </Label>
              <Input
                value={matDescription}
                onChange={(e) => setMatDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-materials:form.externalUrl")}
              </Label>
              <Input
                value={matExternalUrl}
                onChange={(e) => setMatExternalUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mat-active"
                checked={matIsActive}
                onChange={(e) => setMatIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-stroke-soft-200"
              />
              <Label htmlFor="mat-active">
                {t("admin-panel-students-materials:form.isActive")}
              </Label>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setMatModalOpen(false)}>
              {t("admin-panel-students-materials:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitMat()}
              disabled={
                createMaterialMut.isPending || updateMaterialMut.isPending
              }
            >
              {(createMaterialMut.isPending || updateMaterialMut.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-students-materials:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Create/Edit Assignment Modal */}
      <Dialog.Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[550px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editAssign
                ? t("admin-panel-students-materials:actions.edit")
                : t("admin-panel-students-materials:actions.createAssignment")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-materials:form.title")}</Label>
              <Input
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-students-materials:form.subjectId")}
                </Label>
                <Select
                  value={assignSubjectId}
                  onValueChange={(v) => setAssignSubjectId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjects ?? []).map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-students-materials:form.totalMarks")}
                </Label>
                <Input
                  type="number"
                  value={assignTotalMarks}
                  onChange={(e) => setAssignTotalMarks(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-materials:form.dueDate")}</Label>
              <Input
                type="date"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-materials:form.description")}
              </Label>
              <Input
                value={assignDescription}
                onChange={(e) => setAssignDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="assign-active"
                checked={assignIsActive}
                onChange={(e) => setAssignIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-stroke-soft-200"
              />
              <Label htmlFor="assign-active">
                {t("admin-panel-students-materials:form.isActive")}
              </Label>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              {t("admin-panel-students-materials:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitAssign()}
              disabled={
                createAssignmentMut.isPending || updateAssignmentMut.isPending
              }
            >
              {(createAssignmentMut.isPending ||
                updateAssignmentMut.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-students-materials:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* View Submissions Modal */}
      <Dialog.Dialog
        open={submissionsModalOpen}
        onOpenChange={setSubmissionsModalOpen}
      >
        <Dialog.DialogContent className="sm:max-w-[700px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-students-materials:submissions.title")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="max-h-[400px] overflow-auto rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t(
                      "admin-panel-students-materials:submissions.studentName"
                    )}
                  </TableHead>
                  <TableHead>
                    {t(
                      "admin-panel-students-materials:submissions.submittedAt"
                    )}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-students-materials:submissions.marks")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-students-materials:submissions.grade")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-students-materials:submissions.remarks")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-students-materials:table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !submissions || submissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-students-materials:submissions.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  (submissions as SubmissionItem[]).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-paragraph-sm">
                        {sub.student?.name ??
                          `Student #${sub.studentId ?? sub.id}`}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {sub.marks != null ? sub.marks : "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {sub.grade ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {sub.remarks ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenGrade(sub)}
                        >
                          <RiCheckLine className="mr-1 h-3.5 w-3.5" />
                          {t("admin-panel-students-materials:actions.grade")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Dialog.DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmissionsModalOpen(false)}
            >
              {t("admin-panel-students-materials:actions.cancel")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Grade Submission Modal */}
      <Dialog.Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[450px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-students-materials:grading.title")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-materials:grading.marks")}
              </Label>
              <Input
                type="number"
                min="0"
                value={gradeMarks}
                onChange={(e) => setGradeMarks(e.target.value)}
                data-testid="grade-marks"
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-materials:grading.grade")}
              </Label>
              <Input
                value={gradeGrade}
                onChange={(e) => setGradeGrade(e.target.value)}
                placeholder="A+, A, B+, ..."
                data-testid="grade-grade"
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-materials:grading.feedback")}
              </Label>
              <Textarea
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder={t(
                  "admin-panel-students-materials:grading.feedbackPlaceholder"
                )}
                rows={3}
                data-testid="grade-feedback"
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGradeModalOpen(false)}
            >
              {t("admin-panel-students-materials:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitGrade()}
              disabled={gradeSubmissionMut.isPending}
            >
              {gradeSubmissionMut.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-students-materials:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StudentsMaterials, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
