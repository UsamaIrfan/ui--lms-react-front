"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useMemo, useState } from "react";
import {
  useTimetablesQuery,
  usePeriodsQuery,
  useCreateTimetableMutation,
  useUpdateTimetableMutation,
  useDeleteTimetableMutation,
  useAddPeriodMutation,
  useDeletePeriodMutation,
} from "./queries/queries";
import type { TimetableItem } from "./queries/queries";
import {
  useClassesListQuery,
  useSectionsListQuery,
} from "@/app/[language]/admin-panel/academics/classes/queries/queries";
import { useAcademicYearsListQuery } from "@/app/[language]/admin-panel/academics/year/queries/queries";
import { useSubjectsListQuery } from "@/app/[language]/admin-panel/academics/subjects/queries/queries";
import { useTeachersQuery } from "./queries/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RiEyeLine,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Generate 30-minute interval time slots from 00:00 to 23:30
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const value = `${String(hours).padStart(2, "0")}:${minutes}`;
  const hour12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  const label = `${hour12}:${minutes} ${ampm}`;
  return { value, label };
});

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function StaffTimetable() {
  const { t } = useTranslation("admin-panel-staff-timetable");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: timetables, isLoading } = useTimetablesQuery();
  const { data: classes } = useClassesListQuery();
  const { data: sections } = useSectionsListQuery();
  const { data: academicYears } = useAcademicYearsListQuery();
  const { data: teachers } = useTeachersQuery();
  const { data: subjects } = useSubjectsListQuery();
  const createMutation = useCreateTimetableMutation();
  const updateMutation = useUpdateTimetableMutation();
  const deleteMutation = useDeleteTimetableMutation();
  const addPeriodMutation = useAddPeriodMutation();
  const deletePeriodMutation = useDeletePeriodMutation();

  // Timetable modal
  const [ttModalOpen, setTtModalOpen] = useState(false);
  const [editTt, setEditTt] = useState<TimetableItem | null>(null);
  const [ttName, setTtName] = useState("");
  const [ttClassId, setTtClassId] = useState<number>(0);
  const [ttSectionId, setTtSectionId] = useState<number>(0);
  const [ttAcademicYearId, setTtAcademicYearId] = useState<number>(0);

  // Filter sections by selected class (must be after ttClassId state declaration)
  const filteredSections = useMemo(
    () =>
      (sections ?? []).filter(
        (s) => ttClassId > 0 && s.gradeClassId === ttClassId
      ),
    [sections, ttClassId]
  );

  // Lookup maps for resolving IDs to names in periods table
  const subjectMap = useMemo(
    () => new Map((subjects ?? []).map((s) => [s.id, `${s.name} (${s.code})`])),
    [subjects]
  );
  const teacherMap = useMemo(
    () =>
      new Map(
        (teachers ?? []).map((t) => [t.id, `${t.firstName} ${t.lastName}`])
      ),
    [teachers]
  );

  // Periods view
  const [selectedTtId, setSelectedTtId] = useState<string | undefined>();
  const { data: periods } = usePeriodsQuery(selectedTtId);
  const [periodsViewOpen, setPeriodsViewOpen] = useState(false);

  // Add period modal
  const [periodOpen, setPeriodOpen] = useState(false);
  const [periodSubjectId, setPeriodSubjectId] = useState("");
  const [periodTeacherId, setPeriodTeacherId] = useState("");
  const [periodDay, setPeriodDay] = useState("1");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [periodRoom, setPeriodRoom] = useState("");

  const resetTtForm = useCallback(() => {
    setTtName("");
    setTtClassId(0);
    setTtSectionId(0);
    setTtAcademicYearId(0);
  }, []);

  const handleOpenCreateTt = useCallback(() => {
    setEditTt(null);
    resetTtForm();
    setTtModalOpen(true);
  }, [resetTtForm]);

  const handleOpenEditTt = useCallback((item: TimetableItem) => {
    setEditTt(item);
    setTtName(item.name ?? "");
    setTtClassId(item.classId);
    setTtSectionId(item.sectionId ?? 0);
    setTtAcademicYearId(item.academicYearId);
    setTtModalOpen(true);
  }, []);

  const handleSubmitTt = useCallback(async () => {
    if (!ttClassId || !ttAcademicYearId) {
      enqueueSnackbar(
        t("admin-panel-staff-timetable:form.validation.required"),
        { variant: "error" }
      );
      return;
    }
    try {
      const payload = {
        classId: ttClassId,
        academicYearId: ttAcademicYearId,
        sectionId: ttSectionId || undefined,
        name: ttName || undefined,
      } as any;
      if (editTt) {
        await updateMutation.mutateAsync({ id: editTt.id, data: payload });
        enqueueSnackbar(
          t("admin-panel-staff-timetable:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync({
          ...payload,
        });
        enqueueSnackbar(
          t("admin-panel-staff-timetable:notifications.created"),
          { variant: "success" }
        );
      }
      setTtModalOpen(false);
      resetTtForm();
    } catch {
      enqueueSnackbar(t("admin-panel-staff-timetable:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    ttClassId,
    ttSectionId,
    ttAcademicYearId,
    ttName,
    editTt,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetTtForm,
  ]);

  const handleDeleteTt = useCallback(
    async (item: TimetableItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-staff-timetable:confirm.deleteTitle"),
        message: t("admin-panel-staff-timetable:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-staff-timetable:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-staff-timetable:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  const handleViewPeriods = useCallback((ttId: string) => {
    setSelectedTtId(ttId);
    setPeriodsViewOpen(true);
  }, []);

  const handleAddPeriod = useCallback(async () => {
    if (
      !selectedTtId ||
      !periodSubjectId ||
      !periodTeacherId ||
      !periodStart ||
      !periodEnd
    ) {
      enqueueSnackbar(
        t("admin-panel-staff-timetable:form.validation.required"),
        { variant: "error" }
      );
      return;
    }
    try {
      await addPeriodMutation.mutateAsync({
        timetableId: selectedTtId,
        data: {
          timetableId: selectedTtId,
          subjectId: Number(periodSubjectId),
          teacherId: Number(periodTeacherId),
          dayOfWeek: Number(periodDay),
          startTime: periodStart,
          endTime: periodEnd,
          room: periodRoom || undefined,
        } as any,
      });
      enqueueSnackbar(
        t("admin-panel-staff-timetable:notifications.periodAdded"),
        { variant: "success" }
      );
      setPeriodOpen(false);
      setPeriodSubjectId("");
      setPeriodTeacherId("");
      setPeriodStart("");
      setPeriodEnd("");
      setPeriodRoom("");
    } catch {
      enqueueSnackbar(t("admin-panel-staff-timetable:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    selectedTtId,
    periodSubjectId,
    periodTeacherId,
    periodDay,
    periodStart,
    periodEnd,
    periodRoom,
    addPeriodMutation,
    enqueueSnackbar,
    t,
  ]);

  const handleDeletePeriod = useCallback(
    async (periodId: string) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-staff-timetable:confirm.deleteTitle"),
        message: t("admin-panel-staff-timetable:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deletePeriodMutation.mutateAsync(periodId);
          enqueueSnackbar(
            t("admin-panel-staff-timetable:notifications.periodDeleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-staff-timetable:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deletePeriodMutation, enqueueSnackbar, t]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-staff-timetable:title")}
          </h3>
          <Button onClick={handleOpenCreateTt}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-staff-timetable:actions.create")}
          </Button>
        </div>

        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-staff-timetable:table.columns.name")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-staff-timetable:table.columns.classId")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-staff-timetable:table.columns.section")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-staff-timetable:table.columns.academicYear")}
                </TableHead>
                <TableHead style={{ width: 80 }}>
                  {t("admin-panel-staff-timetable:table.columns.status")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-staff-timetable:table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !timetables || timetables.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-staff-timetable:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                timetables.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.className ?? item.classId}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.sectionName ?? "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.academicYearName ?? item.academicYearId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "outline"}>
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
                            onClick={() => handleViewPeriods(item.id)}
                          >
                            <RiEyeLine className="mr-2 h-4 w-4" />
                            {t(
                              "admin-panel-staff-timetable:actions.viewPeriods"
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditTt(item)}
                          >
                            <RiEditLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-staff-timetable:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDeleteTt(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-staff-timetable:actions.delete")}
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
      </div>

      {/* Timetable Create/Edit Modal */}
      <Dialog.Dialog open={ttModalOpen} onOpenChange={setTtModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editTt
                ? t("admin-panel-staff-timetable:actions.edit")
                : t("admin-panel-staff-timetable:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-timetable:form.name")}</Label>
              <Input
                value={ttName}
                onChange={(e) => setTtName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-timetable:form.classId")}</Label>
                <Select
                  value={ttClassId ? String(ttClassId) : undefined}
                  onValueChange={(v) => {
                    setTtClassId(Number(v) || 0);
                    setTtSectionId(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin-panel-staff-timetable:form.selectPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes ?? []).map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-timetable:form.section")}</Label>
                <Select
                  value={ttSectionId ? String(ttSectionId) : undefined}
                  onValueChange={(v) => setTtSectionId(Number(v) || 0)}
                  disabled={!ttClassId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin-panel-staff-timetable:form.selectPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSections.map((sec) => (
                      <SelectItem key={sec.id} value={String(sec.id)}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-staff-timetable:form.academicYearId")}
              </Label>
              <Select
                value={ttAcademicYearId ? String(ttAcademicYearId) : undefined}
                onValueChange={(v) => setTtAcademicYearId(Number(v) || 0)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "admin-panel-staff-timetable:form.selectPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(academicYears ?? []).map((ay) => (
                    <SelectItem key={ay.id} value={String(ay.id)}>
                      {ay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setTtModalOpen(false)}>
              {t("admin-panel-staff-timetable:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitTt()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-timetable:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Periods View Modal */}
      <Dialog.Dialog open={periodsViewOpen} onOpenChange={setPeriodsViewOpen}>
        <Dialog.DialogContent className="sm:max-w-[700px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-staff-timetable:periods.title")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" onClick={() => setPeriodOpen(true)}>
              <RiAddLine className="mr-1 h-4 w-4" />
              {t("admin-panel-staff-timetable:periods.actions.add")}
            </Button>
            <div className="rounded-lg border border-stroke-soft-200 max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-staff-timetable:periods.table.day")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-staff-timetable:periods.table.time")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-staff-timetable:periods.table.subject")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-staff-timetable:periods.table.teacher")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-staff-timetable:periods.table.room")}
                    </TableHead>
                    <TableHead style={{ width: 60 }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!periods || periods.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-20 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("admin-panel-staff-timetable:table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    periods.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-paragraph-sm">
                          {DAY_NAMES[p.dayOfWeek] ?? p.dayOfWeek}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {p.startTime} - {p.endTime}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {subjectMap.get(Number(p.subjectId)) ?? p.subjectId}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {teacherMap.get(Number(p.teacherId)) ?? p.teacherId}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {p.room ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-error-base"
                            onClick={() => void handleDeletePeriod(p.id)}
                          >
                            <RiDeleteBinLine className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Add Period Modal */}
      <Dialog.Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-staff-timetable:periods.actions.add")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-staff-timetable:periods.form.subjectId")}
                </Label>
                <Select
                  value={periodSubjectId || undefined}
                  onValueChange={(v) => setPeriodSubjectId(v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin-panel-staff-timetable:form.selectPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjects ?? []).map((subj) => (
                      <SelectItem key={subj.id} value={String(subj.id)}>
                        {subj.name} ({subj.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-staff-timetable:periods.form.teacherId")}
                </Label>
                <Select
                  value={periodTeacherId || undefined}
                  onValueChange={(v) => setPeriodTeacherId(v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin-panel-staff-timetable:form.selectPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(teachers ?? []).map((teacher) => (
                      <SelectItem key={teacher.id} value={String(teacher.id)}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-timetable:periods.form.day")}</Label>
              <Select value={periodDay} onValueChange={(v) => setPeriodDay(v)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "admin-panel-staff-timetable:form.selectPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-staff-timetable:periods.form.startTime")}
                </Label>
                <Select
                  value={periodStart || undefined}
                  onValueChange={(v) => setPeriodStart(v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin-panel-staff-timetable:form.selectPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-staff-timetable:periods.form.endTime")}
                </Label>
                <Select
                  value={periodEnd || undefined}
                  onValueChange={(v) => setPeriodEnd(v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin-panel-staff-timetable:form.selectPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-staff-timetable:periods.form.room")}
              </Label>
              <Input
                value={periodRoom}
                onChange={(e) => setPeriodRoom(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setPeriodOpen(false)}>
              {t("admin-panel-staff-timetable:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleAddPeriod()}
              disabled={addPeriodMutation.isPending}
            >
              {addPeriodMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-timetable:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StaffTimetable, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF, RoleEnum.TEACHER],
});
