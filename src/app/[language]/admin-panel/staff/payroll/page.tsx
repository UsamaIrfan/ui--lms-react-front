import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import PageContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(
    language,
    "admin-panel-staff-payroll"
  );
  return { title: t("admin-panel-staff-payroll:title") };
}

export default function Page() {
  return <PageContent />;
}
