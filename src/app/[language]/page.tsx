import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { Trans } from "react-i18next/TransWithoutContext";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "home");

  return {
    title: t("title"),
  };
}

export default async function Home(props: Props) {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "home");

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="flex min-h-[90vh] flex-col justify-between gap-6 pt-6">
        <div className="flex-1">
          <h3
            className="mb-2 text-3xl font-bold tracking-tight"
            data-testid="home-title"
          >
            {t("title")}
          </h3>
          <p className="text-base text-text-sub-600">
            <Trans
              i18nKey={`description`}
              t={t}
              components={[
                <a
                  key="1"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/brocoders/extensive-react-boilerplate/blob/main/docs/README.md"
                  className="text-primary-base underline hover:opacity-80"
                >
                  {}
                </a>,
              ]}
            />
          </p>
        </div>
        <div className="mx-auto pb-6">
          <Link
            href="/privacy-policy"
            className="text-primary-base underline hover:opacity-80"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
