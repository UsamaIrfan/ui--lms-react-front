import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import StudentsMaterials from "./page-content";

type Props = { params: Promise<{ language: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(
    language,
    "admin-panel-students-materials"
  );
  return { title: t("admin-panel-students-materials:title") };
}

export default function Page() {
  return <StudentsMaterials />;
}
