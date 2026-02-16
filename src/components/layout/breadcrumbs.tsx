"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { RiArrowRightSLine, RiHomeLine } from "@remixicon/react";

import Link from "@/components/link";
import useLanguage from "@/services/i18n/use-language";
import { useTranslation } from "@/services/i18n/client";

type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrentPage: boolean;
};

// Map route segments to translation keys
const segmentLabelMap: Record<string, string> = {
  "admin-panel": "breadcrumb.adminPanel",
  students: "breadcrumb.students",
  staff: "breadcrumb.staff",
  academics: "breadcrumb.academics",
  accounts: "breadcrumb.accounts",
  notices: "breadcrumb.notices",
  settings: "breadcrumb.settings",
  enquiries: "breadcrumb.enquiries",
  registrations: "breadcrumb.registrations",
  attendance: "breadcrumb.attendance",
  fees: "breadcrumb.fees",
  exams: "breadcrumb.exams",
  materials: "breadcrumb.materials",
  list: "breadcrumb.list",
  leaves: "breadcrumb.leaves",
  payroll: "breadcrumb.payroll",
  timetable: "breadcrumb.timetable",
  courses: "breadcrumb.courses",
  classes: "breadcrumb.classes",
  subjects: "breadcrumb.subjects",
  year: "breadcrumb.year",
  income: "breadcrumb.income",
  expenses: "breadcrumb.expenses",
  reports: "breadcrumb.reports",
  create: "breadcrumb.create",
  edit: "breadcrumb.edit",
  users: "breadcrumb.users",
  profile: "breadcrumb.profile",
};

function capitalize(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const language = useLanguage();
  const { t } = useTranslation("common");

  const items = useMemo<BreadcrumbItem[]>(() => {
    // Remove language prefix
    const cleanPath = pathname.replace(`/${language}`, "");
    const segments = cleanPath.split("/").filter(Boolean);

    // Don't show breadcrumbs on root pages
    if (segments.length <= 1) return [];

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Skip UUID/numeric segments — they are IDs, not meaningful labels
      if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
        continue;
      }

      const labelKey = segmentLabelMap[segment];
      const label = labelKey ? t(`common:${labelKey}`) : capitalize(segment);
      const isCurrentPage = i === segments.length - 1;

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage,
      });
    }

    return breadcrumbs;
  }, [pathname, language, t]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-paragraph-sm">
        {/* Home */}
        <li>
          <Link
            href="/admin-panel"
            className="flex items-center text-text-soft-400 no-underline transition-colors hover:text-text-sub-600"
          >
            <RiHomeLine className="h-4 w-4" />
          </Link>
        </li>

        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-1">
            <RiArrowRightSLine className="h-4 w-4 text-text-disabled-300" />
            {item.isCurrentPage ? (
              <span className="text-label-sm text-text-strong-950">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-text-sub-600 no-underline transition-colors hover:text-text-strong-950"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
