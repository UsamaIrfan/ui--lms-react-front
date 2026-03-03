import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { MarketingLayout } from "@/components/marketing/marketing-layout";

type Props = { params: Promise<{ language: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "terms-of-service");
  return { title: t("title"), description: t("metaDescription") };
}

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content:
      'By accessing or using EduFlow ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not access or use the Service. These terms apply to all visitors, users, and others who access the Service.',
  },
  {
    id: "description",
    title: "Description of Service",
    content:
      "EduFlow is a cloud-based learning management system designed to help educational institutions manage students, staff, academics, and administration. The Service includes features such as attendance tracking, grade management, timetable scheduling, fee management, and communication tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.",
  },
  {
    id: "accounts",
    title: "User Accounts",
    content:
      "To use certain features of the Service, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms or that have been inactive for an extended period.",
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content:
      "You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not use the Service to transmit harmful, offensive, or illegal content, attempt to gain unauthorized access to any part of the Service, interfere with other users' enjoyment of the Service, or use the Service for any purpose other than its intended educational use. Violation of these terms may result in immediate termination of your access.",
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content:
      "The Service, including its original content, features, and functionality, is owned by EduFlow and is protected by international copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent. Content you upload to the Service remains yours, but you grant us a limited license to use, store, and display it as necessary to provide the Service.",
  },
  {
    id: "privacy",
    title: "Privacy",
    content:
      "Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of information as described in our Privacy Policy. We are committed to protecting the privacy of students and educators in compliance with applicable data protection regulations.",
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content:
      'The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. In no event shall EduFlow, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service. Our total liability for any claim arising from these terms shall not exceed the amount you paid us in the twelve months preceding the claim.',
  },
  {
    id: "termination",
    title: "Termination",
    content:
      "We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion. Upon termination, your right to use the Service will cease immediately. You may export your data before termination, and we will retain your data for a reasonable period to facilitate data portability.",
  },
  {
    id: "changes",
    title: "Changes to Terms",
    content:
      "We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated terms on the Service and updating the effective date. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically to stay informed of any updates.",
  },
  {
    id: "contact",
    title: "Contact Information",
    content:
      "If you have any questions about these Terms of Service, please contact us at legal@eduflow.com. You may also reach us by mail at EduFlow Inc., 100 Education Way, Suite 400, San Francisco, CA 94105.",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function TermsOfServicePage(_props: Props) {
  return (
    <MarketingLayout>
      <div data-testid="terms-page">
        <section className="bg-bg-white-0 py-20 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-title-h1 text-text-strong-950">
              Terms of Service
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
