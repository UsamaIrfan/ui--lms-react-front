"use client";

import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { EnquiryStatus } from "../types";

const statusColorMap: Record<
  EnquiryStatus,
  {
    bg: string;
    text: string;
  }
> = {
  [EnquiryStatus.NEW]: {
    bg: "bg-primary-base",
    text: "text-static-white",
  },
  [EnquiryStatus.CONTACTED]: {
    bg: "bg-warning-base",
    text: "text-static-white",
  },
  [EnquiryStatus.SCHEDULED_VISIT]: {
    bg: "bg-information-base",
    text: "text-static-white",
  },
  [EnquiryStatus.VISIT_DONE]: {
    bg: "bg-information-dark",
    text: "text-static-white",
  },
  [EnquiryStatus.APPLIED]: {
    bg: "bg-success-base",
    text: "text-static-white",
  },
  [EnquiryStatus.ACCEPTED]: {
    bg: "bg-success-dark",
    text: "text-static-white",
  },
  [EnquiryStatus.ENROLLED]: {
    bg: "bg-primary-dark",
    text: "text-static-white",
  },
  [EnquiryStatus.REJECTED]: {
    bg: "bg-error-base",
    text: "text-static-white",
  },
  [EnquiryStatus.WITHDRAWN]: {
    bg: "bg-bg-weak-50",
    text: "text-text-sub-600",
  },
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const colors = statusColorMap[status] ?? statusColorMap[EnquiryStatus.NEW];

  return (
    <Badge
      className={cn("border-transparent text-label-xs", colors.bg, colors.text)}
    >
      {t(`admin-panel-students-enquiries:status.${status}`)}
    </Badge>
  );
}
