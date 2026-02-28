"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialogActionsContext,
  ConfirmDialogOptions,
} from "./confirm-dialog-context";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/services/i18n/client";

function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("confirm-dialog");

  const defaultConfirmDialogInfo = useMemo<ConfirmDialogOptions>(
    () => ({
      title: t("title"),
      message: t("message"),
      successButtonText: t("actions.yes"),
      cancelButtonText: t("actions.no"),
    }),
    [t]
  );

  const [confirmDialogInfo, setConfirmDialogInfo] =
    useState<ConfirmDialogOptions>(defaultConfirmDialogInfo);
  const resolveRef = useRef<(value: boolean) => void>(undefined);

  const onCancel = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
  };

  const onSuccess = () => {
    setIsOpen(false);
    resolveRef.current?.(true);
  };

  const confirmDialog = useCallback(
    (options: Partial<ConfirmDialogOptions> = {}) => {
      return new Promise<boolean>((resolve) => {
        setConfirmDialogInfo({
          ...defaultConfirmDialogInfo,
          ...options,
        });
        setIsOpen(true);
        resolveRef.current = resolve;
      });
    },
    [defaultConfirmDialogInfo]
  );

  const contextActions = useMemo(
    () => ({
      confirmDialog,
    }),
    [confirmDialog]
  );

  return (
    <>
      <ConfirmDialogActionsContext.Provider value={contextActions}>
        {children}
      </ConfirmDialogActionsContext.Provider>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent data-testid="confirm-dialog">
          <DialogHeader>
            <DialogTitle>{confirmDialogInfo.title}</DialogTitle>
            <DialogDescription>{confirmDialogInfo.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onCancel}
              data-testid="confirm-dialog-cancel"
            >
              {confirmDialogInfo.cancelButtonText}
            </Button>
            <Button
              onClick={onSuccess}
              autoFocus
              data-testid="confirm-dialog-confirm"
            >
              {confirmDialogInfo.successButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConfirmDialogProvider;
