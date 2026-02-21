"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useStaffListQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useUsersDropdownQuery,
} from "./queries/queries";
import type { StaffItem } from "./queries/queries";
import { useInstitutionsListQuery } from "../academics/courses/queries/queries";
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
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "visiting",
] as const;

function StaffManagement() {
  const { t } = useTranslation("admin-panel-staff");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: staffList, isLoading } = useStaffListQuery();
  const { data: users } = useUsersDropdownQuery();
  const { data: institutions } = useInstitutionsListQuery();
  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const deleteMutation = useDeleteStaffMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<StaffItem | null>(null);
  const [createNewUser, setCreateNewUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState<string>("staff");
  const [institutionId, setInstitutionId] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [employmentType, setEmploymentType] = useState<string>("full_time");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");

  const resetForm = useCallback(() => {
    setCreateNewUser(true);
    setUserId("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setUserRole("staff");
    setInstitutionId("");
    setDesignation("");
    setQualification("");
    setSpecialization("");
    setExperienceYears("");
    setJoiningDate("");
    setBasicSalary("");
    setEmploymentType("full_time");
    setEmergencyContact("");
    setAddress("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: StaffItem) => {
    setEditItem(item);
    setCreateNewUser(false);
    setUserId(String(item.userId));
    setInstitutionId(String(item.institutionId));
    setDesignation(item.designation ?? "");
    setQualification(item.qualification ?? "");
    setSpecialization(item.specialization ?? "");
    setExperienceYears(
      item.experienceYears !== null && item.experienceYears !== undefined
        ? String(item.experienceYears)
        : ""
    );
    setJoiningDate(item.joiningDate ?? "");
    setBasicSalary(String(item.basicSalary));
    setEmploymentType(item.employmentType);
    setEmergencyContact(item.emergencyContact ?? "");
    setAddress(item.address ?? "");
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!editItem && createNewUser) {
      if (!email || !password || !firstName || !lastName || !institutionId) {
        enqueueSnackbar(
          t("admin-panel-staff:form.validation.userFieldsRequired"),
          { variant: "error" }
        );
        return;
      }
    } else if (!userId || !institutionId) {
      enqueueSnackbar(t("admin-panel-staff:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      const staffFields = {
        institutionId: Number(institutionId),
        designation: designation || undefined,
        qualification: qualification || undefined,
        specialization: specialization || undefined,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        joiningDate: joiningDate || undefined,
        basicSalary: basicSalary ? Number(basicSalary) : undefined,
        employmentType: employmentType as
          | "full_time"
          | "part_time"
          | "contract"
          | "visiting",
        emergencyContact: emergencyContact || undefined,
        address: address || undefined,
      } as any;

      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: { ...staffFields, userId: Number(userId) },
        });
        enqueueSnackbar(t("admin-panel-staff:notifications.updated"), {
          variant: "success",
        });
      } else {
        const createPayload = createNewUser
          ? {
              ...staffFields,
              email,
              password,
              firstName,
              lastName,
              userRole,
            }
          : { ...staffFields, userId: Number(userId) };

        await createMutation.mutateAsync({
          ...createPayload,
        });
        enqueueSnackbar(t("admin-panel-staff:notifications.created"), {
          variant: "success",
        });
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-staff:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    createNewUser,
    email,
    password,
    firstName,
    lastName,
    userRole,
    userId,
    institutionId,
    designation,
    qualification,
    specialization,
    experienceYears,
    joiningDate,
    basicSalary,
    employmentType,
    emergencyContact,
    address,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: StaffItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-staff:confirm.deleteTitle"),
        message: t("admin-panel-staff:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(t("admin-panel-staff:notifications.deleted"), {
            variant: "success",
          });
        } catch {
          enqueueSnackbar(t("admin-panel-staff:notifications.error"), {
            variant: "error",
          });
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-staff:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-staff:actions.create")}
          </Button>
        </div>
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff:table.columns.staffId")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-staff:table.columns.designation")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-staff:table.columns.qualification")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff:table.columns.employmentType")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff:table.columns.basicSalary")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff:table.columns.joiningDate")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-staff:table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !staffList || staffList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-staff:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                staffList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.staffId}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.designation ?? "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.qualification ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.employmentType?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.basicSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.joiningDate
                        ? new Date(item.joiningDate).toLocaleDateString()
                        : "—"}
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
                            onClick={() => handleOpenEdit(item)}
                          >
                            <RiEditLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-staff:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-staff:actions.delete")}
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

      <Dialog.Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[600px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editItem
                ? t("admin-panel-staff:actions.edit")
                : t("admin-panel-staff:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* ── User section ─────────────────────────── */}
            {!editItem && (
              <div className="grid gap-4 rounded-lg border border-stroke-soft-200 p-4">
                <div className="flex items-center gap-3">
                  <Label className="text-label-sm font-semibold">
                    {t("admin-panel-staff:form.userSection")}
                  </Label>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1 text-paragraph-sm ${createNewUser ? "bg-primary-base text-static-white" : "bg-bg-weak-50 text-text-sub-600"}`}
                      onClick={() => setCreateNewUser(true)}
                    >
                      {t("admin-panel-staff:form.createNewUser")}
                    </button>
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1 text-paragraph-sm ${!createNewUser ? "bg-primary-base text-static-white" : "bg-bg-weak-50 text-text-sub-600"}`}
                      onClick={() => setCreateNewUser(false)}
                    >
                      {t("admin-panel-staff:form.useExistingUser")}
                    </button>
                  </div>
                </div>

                {createNewUser ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t("admin-panel-staff:form.firstName")}</Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t(
                            "admin-panel-staff:form.firstNamePlaceholder"
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("admin-panel-staff:form.lastName")}</Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t(
                            "admin-panel-staff:form.lastNamePlaceholder"
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t("admin-panel-staff:form.email")}</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t(
                            "admin-panel-staff:form.emailPlaceholder"
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("admin-panel-staff:form.password")}</Label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t(
                            "admin-panel-staff:form.passwordPlaceholder"
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("admin-panel-staff:form.userRoleLabel")}</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                      >
                        <option value="staff">
                          {t("admin-panel-staff:form.userRoles.staff")}
                        </option>
                        <option value="teacher">
                          {t("admin-panel-staff:form.userRoles.teacher")}
                        </option>
                        <option value="accountant">
                          {t("admin-panel-staff:form.userRoles.accountant")}
                        </option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Label>{t("admin-panel-staff:form.userId")}</Label>
                    <Select value={userId} onValueChange={(v) => setUserId(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {(users ?? []).map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.firstName} {u.lastName} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            {editItem && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("admin-panel-staff:form.userId")}</Label>
                  <Select value={userId} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {(users ?? []).map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.firstName} {u.lastName} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin-panel-staff:form.institutionId")}</Label>
                  <Select
                    value={institutionId}
                    onValueChange={(v) => setInstitutionId(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {(institutions ?? []).map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {!editItem && (
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.institutionId")}</Label>
                <Select
                  value={institutionId}
                  onValueChange={(v) => setInstitutionId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {(institutions ?? []).map((inst) => (
                      <SelectItem key={inst.id} value={String(inst.id)}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.designation")}</Label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.qualification")}</Label>
                <Input
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.specialization")}</Label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.experienceYears")}</Label>
                <Input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.joiningDate")}</Label>
                <Input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.basicSalary")}</Label>
                <Input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.employmentType")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  {EMPLOYMENT_TYPES.map((et) => (
                    <option key={et} value={et}>
                      {et.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff:form.emergencyContact")}</Label>
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff:form.address")}</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-staff:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StaffManagement, {
  roles: [RoleEnum.ADMIN],
});
