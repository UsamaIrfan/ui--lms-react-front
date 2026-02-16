"use client";

import { PropsWithChildren, useContext, useMemo, useState } from "react";
import {
  LeavePageActionsContext,
  LeavePageContext,
  LeavePageContextParamsType,
  LeavePageInfoContext,
  LeavePageModalContext,
} from "./leave-page-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Need for leave page logic
// eslint-disable-next-line no-restricted-imports
import NextLink from "next/link";
import { useTranslation } from "../i18n/client";

function Provider(props: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [leavePage, setLeavePage] = useState<LeavePageContextParamsType>(null);
  const [leavePageCounter, setIsLeavePage] = useState(0);

  const contextModalValue = useMemo(
    () => ({
      isOpen,
    }),
    [isOpen]
  );

  const contextValue = useMemo(
    () => ({
      isLeavePage: leavePageCounter !== 0,
    }),
    [leavePageCounter]
  );

  const contextInfoValue = useMemo(
    () => ({
      leavePage,
    }),
    [leavePage]
  );

  const contextActionsValue = useMemo(
    () => ({
      trackLeavePage: () => {
        setIsLeavePage((prevValue) => prevValue + 1);
      },
      setLeavePage: (params: LeavePageContextParamsType) => {
        setLeavePage(params);
      },
      untrackLeavePage: () => {
        setLeavePage(null);
        setIsLeavePage((prevValue) => prevValue - 1);
      },
      openModal: () => {
        setIsOpen(true);
      },
      closeModal: () => {
        setIsOpen(false);
      },
    }),
    []
  );

  return (
    <LeavePageContext.Provider value={contextValue}>
      <LeavePageModalContext.Provider value={contextModalValue}>
        <LeavePageActionsContext.Provider value={contextActionsValue}>
          <LeavePageInfoContext.Provider value={contextInfoValue}>
            {props.children}
          </LeavePageInfoContext.Provider>
        </LeavePageActionsContext.Provider>
      </LeavePageModalContext.Provider>
    </LeavePageContext.Provider>
  );
}

function Modal() {
  const { t } = useTranslation("common");
  const { isOpen } = useContext(LeavePageModalContext);
  const { leavePage } = useContext(LeavePageInfoContext);
  const { closeModal } = useContext(LeavePageActionsContext);

  const href = (leavePage?.push ?? leavePage?.replace) || "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="want-to-leave-modal">
        <DialogHeader>
          <DialogTitle>{t("common:leavePage.title")}</DialogTitle>
          <DialogDescription>{t("common:leavePage.message")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeModal}
            autoFocus
            data-testid="stay"
          >
            {t("common:leavePage.stay")}
          </Button>
          <Button asChild onClick={closeModal} data-testid="leave">
            <NextLink href={href} replace={!!leavePage?.replace}>
              {t("common:leavePage.leave")}
            </NextLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LeavePageProvider(props: PropsWithChildren) {
  return (
    <Provider>
      {props.children}
      <Modal />
    </Provider>
  );
}
