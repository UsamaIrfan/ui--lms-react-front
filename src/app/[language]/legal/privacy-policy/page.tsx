import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { MarketingLayout } from "@/components/marketing/marketing-layout";

type Props = { params: Promise<{ language: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(
    params.language,
    "legal-privacy-policy"
  );
  return { title: t("title"), description: t("metaDescription") };
}

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us when you create an account, fill out forms, or communicate with us. This includes your name, email address, institutional affiliation, role, and any other information you choose to provide. We also automatically collect certain information when you use the Service, including your IP address, browser type, device information, and usage patterns through log data and analytics.",
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    content:
      "We use the information we collect to provide, maintain, and improve the Service, to process transactions and send related information, to communicate with you about products, services, and events, and to monitor and analyze trends and usage. We also use your information to personalize the Service, to detect and prevent fraud or abuse, and to comply with legal obligations. We will not use your personal information for purposes incompatible with those disclosed to you.",
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content:
      "We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating the Service, such as hosting providers, analytics services, and email delivery services. These providers are contractually obligated to protect your data and use it only for the purposes we specify. We may also share information when required by law, to protect our rights, or in connection with a merger or acquisition.",
  },
  {
    id: "data-security",
    title: "Data Security",
    content:
      "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, regular security audits, access controls, and employee training. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security. We encourage you to use strong passwords and protect your account credentials.",
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content:
      "Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may also have the right to object to or restrict certain processing activities, and to withdraw consent where processing is based on consent. To exercise any of these rights, please contact us at privacy@eduflow.com. We will respond to your request within the timeframe required by applicable law. You will not be discriminated against for exercising your privacy rights.",
  },
  {
    id: "cookies",
    title: "Cookies",
    content:
      "We use cookies and similar tracking technologies to collect and store information about your interactions with the Service. Cookies help us provide essential functionality such as authentication and session management, as well as optional features like remembering your preferences. You can control cookie settings through your browser preferences. Please note that disabling certain cookies may limit your ability to use some features of the Service.",
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content:
      "EduFlow is designed for use by educational institutions and their authorized users. We do not knowingly collect personal information from children under the age of 13 without verifiable parental consent. If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us immediately. We comply with applicable child privacy laws, including COPPA, and work with institutions to ensure appropriate consent mechanisms are in place.",
  },
  {
    id: "changes-to-policy",
    title: "Changes to Policy",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on the Service and, where appropriate, by sending you an email notification. We encourage you to review this Privacy Policy periodically. Your continued use of the Service after changes are posted constitutes your acceptance of the revised policy.",
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content:
      "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Team at privacy@eduflow.com. You may also reach us by mail at EduFlow Inc., 100 Education Way, Suite 400, San Francisco, CA 94105. We are committed to resolving any complaints about our collection or use of your personal information.",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function LegalPrivacyPolicyPage(_props: Props) {
  return (
    <MarketingLayout>
      <div data-testid="legal-privacy-page">
        <section className="bg-bg-white-0 py-20 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-title-h1 text-text-strong-950">
              Privacy Policy
            </h1>
            <p className="mt-4 text-paragraph-md text-text-sub-600">
              Last Updated: June 1, 2025
            </p>
          </div>
        </section>

        <section className="bg-bg-weak-50 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 lg:flex-row">
            {/* Sidebar TOC */}
            <nav className="lg:sticky lg:top-8 lg:w-64 lg:shrink-0 lg:self-start">
              <h2 className="text-label-md text-text-strong-950">
                Table of Contents
              </h2>
              <ul className="mt-3 space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-paragraph-sm text-text-sub-600 transition-colors hover:text-primary-base"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-10">
              {sections.map((section) => (
                <div key={section.id} id={section.id} className="scroll-mt-8">
                  <h2 className="text-title-h4 text-text-strong-950">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-paragraph-md leading-relaxed text-text-sub-600">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
