"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";

function AdminPanel() {
  const { t } = useTranslation("admin-panel-home");

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="flex flex-col gap-6 pt-6">
        <div>
          <h3 className="mb-2 text-3xl font-bold tracking-tight">
            {t("title")}
          </h3>
          <p className="text-base text-text-sub-600">{t("description")}</p>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AdminPanel, { roles: [RoleEnum.ADMIN] });
