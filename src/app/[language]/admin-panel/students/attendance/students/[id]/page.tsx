import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import StudentAttendanceDetail from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const { t } = await getServerTranslation(
    language,
    "admin-panel-students-attendance"
  );
  return { title: t("studentDetail.title") };
}

export default function Page() {
  return <StudentAttendanceDetail />;
}
