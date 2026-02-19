"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useNoticesListQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} from "./queries/queries";
import type { Notice } from "@/services/api/generated/models";
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
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import useTenant from "@/services/tenant/use-tenant";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function NoticesPage() {
  const { t } = useTranslation("admin-panel-notices");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const { tenantId } = useTenant();

  const { data: notices, isLoading } = useNoticesListQuery();
  const createMutation = useCreateNoticeMutation();
  const updateMutation = useUpdateNoticeMutation();
  const deleteMutation = useDeleteNoticeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Notice | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const resetForm = useCallback(() => {
    setTitle("");
    setContent("");
    setTargetRoles("");
    setIsPublished(false);
    setPublishDate("");
    setExpiresAt("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: Notice) => {
    setEditItem(item);
    setTitle(item.title);
    setContent(item.content);
    setTargetRoles(item.targetRoles?.join(", ") ?? "");
    setIsPublished(item.isPublished ?? false);
    setPublishDate(
      item.publishDate ? String(item.publishDate).split("T")[0] : ""
    );
    setExpiresAt(item.expiresAt ? String(item.expiresAt).split("T")[0] : "");
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title || !content) {
      enqueueSnackbar(t("admin-panel-notices:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      const roles = targetRoles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      const payload = {
        title,
        content,
        targetBranches: [] as string[],
        targetRoles: roles,
        isPublished,
        publishDate: publishDate || undefined,
        expiresAt: expiresAt || undefined,
      } as any;
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        enqueueSnackbar(t("admin-panel-notices:notifications.updated"), {
          variant: "success",
        });
      } else {
        await createMutation.mutateAsync({
          tenantId: tenantId ?? "",
          ...payload,
        });
        enqueueSnackbar(t("admin-panel-notices:notifications.created"), {
          variant: "success",
        });
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-notices:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    title,
    content,
    targetRoles,
    isPublished,
    publishDate,
    expiresAt,
    editItem,
    tenantId,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: Notice) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-notices:confirm.deleteTitle"),
        message: t("admin-panel-notices:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(t("admin-panel-notices:notifications.deleted"), {
            variant: "success",
          });
        } catch {
          enqueueSnackbar(t("admin-panel-notices:notifications.error"), {
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
            {t("admin-panel-notices:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-notices:actions.create")}
          </Button>
        </div>
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("admin-panel-notices:table.columns.title")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-notices:table.columns.targetRoles")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-notices:table.columns.published")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-notices:table.columns.publishDate")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-notices:table.columns.expiresAt")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-notices:table.columns.actions")}
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
              ) : !notices || notices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-notices:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                notices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950 max-w-[200px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.targetRoles?.join(", ") ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isPublished ? "default" : "outline"}>
                        {item.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.publishDate
                        ? new Date(
                            String(item.publishDate)
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.expiresAt
                        ? new Date(String(item.expiresAt)).toLocaleDateString()
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
                            {t("admin-panel-notices:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-notices:actions.delete")}
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
                ? t("admin-panel-notices:actions.edit")
                : t("admin-panel-notices:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-notices:form.title")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-notices:form.content")}</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-notices:form.targetRoles")}</Label>
              <Input
                placeholder="admin, teacher, staff"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-notices:form.publishDate")}</Label>
                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-notices:form.expiresAt")}</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-stroke-soft-200"
              />
              <Label htmlFor="isPublished">
                {t("admin-panel-notices:form.isPublished")}
              </Label>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-notices:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-notices:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(NoticesPage, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
