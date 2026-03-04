import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import ContactPageContent from "./page-content";

type Props = { params: Promise<{ language: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "contact");
  return { title: t("title"), description: t("metaDescription") };
}

export default function ContactPage() {
  return <ContactPageContent />;
}
