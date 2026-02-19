import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import BulkAttendance from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(
    language,
    "admin-panel-students-attendance"
  );
  return { title: t("bulk.title") };
}

export default function Page() {
  return <BulkAttendance />;
}
