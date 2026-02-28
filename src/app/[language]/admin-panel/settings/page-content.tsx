"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiSettings4Line,
  RiGitBranchLine,
  RiUserSettingsLine,
  RiBookOpenLine,
  RiMoneyDollarCircleLine,
  RiCalendarCheckLine,
  RiNotification3Line,
  RiArrowRightSLine,
  RiMailSendLine,
  RiBuildingLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

type SettingsSection = {
  id: string;
  icon: RemixiconComponentType;
  href: string;
  translationKey: string;
};

const settingsSections: SettingsSection[] = [
  {
    id: "tenants",
    icon: RiBuildingLine,
    href: "/admin-panel/settings/tenants",
    translationKey: "tenants",
  },
  {
    id: "general",
    icon: RiSettings4Line,
    href: "/admin-panel/settings/general",
    translationKey: "general",
  },
  {
    id: "branches",
    icon: RiGitBranchLine,
    href: "/admin-panel/settings/branches",
    translationKey: "branches",
  },
  {
    id: "users",
    icon: RiUserSettingsLine,
    href: "/admin-panel/users",
    translationKey: "users",
  },
  {
    id: "academics",
    icon: RiBookOpenLine,
    href: "/admin-panel/academics/courses",
    translationKey: "academics",
  },
  {
    id: "fees",
    icon: RiMoneyDollarCircleLine,
    href: "/admin-panel/settings/fees",
    translationKey: "fees",
  },
  {
    id: "attendance",
    icon: RiCalendarCheckLine,
    href: "/admin-panel/settings/attendance",
    translationKey: "attendance",
  },
  {
    id: "notifications",
    icon: RiNotification3Line,
    href: "/admin-panel/settings/notifications",
    translationKey: "notifications",
  },
  {
    id: "invitations",
    icon: RiMailSendLine,
    href: "/admin-panel/settings/invitations",
    translationKey: "invitations",
  },
];

function SettingsHub() {
  const { t } = useTranslation("admin-panel-settings");

  return (
    <div data-testid="admin-settings-page" className="mx-auto max-w-5xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div>
          <h3 className="text-title-h4 text-text-strong-950">
            {t("admin-panel-settings:title")}
          </h3>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {t("admin-panel-settings:description")}
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => (
            <Link key={section.id} href={section.href} className="group block">
              <Card className="h-full transition-colors hover:border-primary-base">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-label-md text-text-strong-950">
                        {t(
                          `admin-panel-settings:sections.${section.translationKey}.title`
                        )}
                      </h4>
                      <RiArrowRightSLine className="h-4 w-4 text-text-soft-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-paragraph-xs text-text-sub-600">
                      {t(
                        `admin-panel-settings:sections.${section.translationKey}.description`
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(SettingsHub, {
  roles: [RoleEnum.ADMIN],
});
