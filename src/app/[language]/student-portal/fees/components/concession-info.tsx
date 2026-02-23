"use client";

import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import type { FeeConcession, ConcessionType } from "../types";

interface ConcessionInfoProps {
  concession: FeeConcession | null;
}

const CONCESSION_TYPE_VARIANTS: Record<
  ConcessionType,
  "default" | "success" | "warning" | "secondary"
> = {
  scholarship: "default",
  merit: "default",
  sibling: "secondary",
  staff_child: "secondary",
  financial_aid: "success",
};

export function ConcessionInfo({ concession }: ConcessionInfoProps) {
  const { t } = useTranslation("student-portal-fees");

  if (!concession) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("concession.title")}
        </h3>
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("concession.noConcession")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-label-lg text-text-strong-950">
          {t("concession.title")}
        </h3>
        <Badge variant={CONCESSION_TYPE_VARIANTS[concession.type] ?? "default"}>
          {t(`concession.types.${concession.type}`)}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Discount percentage highlight */}
        <div className="flex items-center justify-center rounded-16 bg-success-lighter p-5">
          <div className="text-center">
            <p className="text-title-h3 font-bold text-success-base">
              {concession.discountPercentage}%
            </p>
            <p className="text-paragraph-sm text-text-sub-600">
              {t("concession.discountOff")}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-label-sm text-text-sub-600">
              {t("concession.type")}
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              {t(`concession.types.${concession.type}`)}
            </p>
          </div>

          {concession.reason && (
            <div className="col-span-2">
              <p className="text-label-sm text-text-sub-600">
                {t("concession.reason")}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {concession.reason}
              </p>
            </div>
          )}

          {concession.validFrom && (
            <div>
              <p className="text-label-sm text-text-sub-600">
                {t("concession.validFrom")}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {new Date(concession.validFrom).toLocaleDateString()}
              </p>
            </div>
          )}

          {concession.validTo && (
            <div>
              <p className="text-label-sm text-text-sub-600">
                {t("concession.validTo")}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {new Date(concession.validTo).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConcessionInfoSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-36 animate-pulse rounded-8 bg-bg-weak-50" />
        <div className="h-5 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
      </div>
      <div className="mb-4 h-24 animate-pulse rounded-16 bg-bg-weak-50" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
