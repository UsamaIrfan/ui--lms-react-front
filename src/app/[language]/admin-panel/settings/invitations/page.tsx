import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import InvitationsSettingsContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(language, "admin-panel-invitations");
  return { title: t("admin-panel-invitations:title") };
}

export default function InvitationsSettingsPage() {
  return <InvitationsSettingsContent />;
}
