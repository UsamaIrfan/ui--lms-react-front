import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import NotificationSettingsContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(language, "admin-panel-settings");
  return { title: t("admin-panel-settings:notifications.title") };
}

export default function NotificationSettingsPage() {
  return <NotificationSettingsContent />;
}
