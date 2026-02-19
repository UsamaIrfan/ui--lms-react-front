"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/services/i18n/client";
import { EnrollmentStatus } from "../types";

const statusStyles: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ACTIVE]:
    "bg-success-lighter text-success-base border-success-base/20",
  [EnrollmentStatus.INACTIVE]: "bg-gray-100 text-gray-600 border-gray-300/20",
  [EnrollmentStatus.GRADUATED]:
    "bg-primary-lighter text-primary-base border-primary-base/20",
  [EnrollmentStatus.TRANSFERRED]:
    "bg-warning-lighter text-warning-base border-warning-base/20",
  [EnrollmentStatus.DROPPED]:
    "bg-error-lighter text-error-base border-error-base/20",
  [EnrollmentStatus.SUSPENDED]:
    "bg-orange-50 text-orange-600 border-orange-300/20",
};

interface StatusBadgeProps {
  status: EnrollmentStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const style =
    statusStyles[status as EnrollmentStatus] ??
    "bg-gray-100 text-gray-600 border-gray-300/20";

  return (
    <Badge variant="outline" className={style}>
      {t(
        `admin-panel-students-registrations:enrollmentStatus.${status}`,
        status
      )}
    </Badge>
  );
}
