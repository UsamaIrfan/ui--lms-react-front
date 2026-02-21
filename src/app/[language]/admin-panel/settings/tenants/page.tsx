import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import TenantManagementContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(language, "admin-panel-settings");
  return { title: t("admin-panel-settings:tenants.title") };
}

export default function TenantManagementPage() {
  return <TenantManagementContent />;
}
