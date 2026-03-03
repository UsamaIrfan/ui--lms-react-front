import type { Metadata } from "next";
import {
  RiBookOpenLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiGroupLine,
  RiBarChartBoxLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiNotification3Line,
  RiParentLine,
  RiMailLine,
  RiDashboardLine,
  RiLineChartLine,
  RiUserStarLine,
  RiTeamLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { getServerTranslation } from "@/services/i18n";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "features");
  return { title: t("title"), description: t("metaDescription") };
}

const categories = [
  {
    id: "academic",
    title: "Academic Management",
    description:
      "Streamline every aspect of your academic operations, from enrollment to graduation.",
    features: [
      {
        icon: RiGroupLine,
        title: "Student Management",
        description:
          "Maintain comprehensive student profiles, enrollment records, and academic history in one place.",
      },
      {
        icon: RiCalendarCheckLine,
        title: "Attendance Tracking",
        description:
          "Automate attendance with real-time tracking, reports, and configurable policies per class.",
      },
      {
        icon: RiFileTextLine,
        title: "Exams & Results",
        description:
          "Create exam schedules, manage grading, and generate report cards with customizable templates.",
      },
      {
        icon: RiBookOpenLine,
        title: "Study Materials",
        description:
          "Upload, organize, and distribute learning materials to students by course and subject.",
      },
    ],
  },
  {
    id: "administrative",
    title: "Administrative",
    description:
      "Reduce manual work with tools built for the day-to-day of running an institution.",
    features: [
      {
        icon: RiTeamLine,
        title: "Staff Management",
        description:
          "Manage staff profiles, roles, departments, and employment records from a single dashboard.",
      },
      {
        icon: RiTimeLine,
        title: "Timetable",
        description:
          "Build conflict-free timetables and distribute them instantly to staff and students.",
      },
      {
        icon: RiMoneyDollarCircleLine,
        title: "Fee Management",
        description:
          "Configure fee structures, track payments, send reminders, and generate financial reports.",
      },
      {
        icon: RiCalendarLine,
        title: "Leave Management",
        description:
          "Process leave requests, set approval workflows, and maintain accurate leave balances.",
      },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    description:
      "Keep every stakeholder informed and engaged with built-in communication tools.",
    features: [
      {
        icon: RiNotification3Line,
        title: "Notices",
        description:
          "Publish institution-wide or targeted notices and ensure they reach the right audience.",
      },
      {
        icon: RiParentLine,
        title: "Parent Portal",
        description:
          "Give parents visibility into attendance, grades, fees, and school updates in real time.",
      },
      {
        icon: RiMailLine,
        title: "Messaging",
        description:
          "Enable direct communication between teachers, parents, and administrators securely.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Turn raw data into actionable insights that improve outcomes.",
    features: [
      {
        icon: RiDashboardLine,
        title: "Dashboards",
        description:
          "Get a bird's-eye view of your institution with role-specific dashboards for admins, teachers, and staff.",
      },
      {
        icon: RiLineChartLine,
        title: "Reports",
        description:
          "Generate detailed reports on attendance, finances, academic performance, and more.",
      },
      {
        icon: RiUserStarLine,
        title: "Performance Tracking",
        description:
          "Monitor student and staff performance trends over time to identify areas for improvement.",
      },
      {
        icon: RiBarChartBoxLine,
        title: "Custom Analytics",
        description:
          "Build custom queries and visualizations tailored to your institution's unique KPIs.",
      },
    ],
  },
];

export default async function FeaturesPage(props: Props) {
  const params = await props.params;
  const lang = params.language;
  return (
    <MarketingLayout>
      <div data-testid="features-page">
        {/* Hero */}
        <section
          data-testid="features-hero"
          className="bg-bg-white-0 px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-3xl">
            <h1 className="text-title-h1 text-text-strong-950">
              Powerful Features for Modern Education
            </h1>
            <p className="mt-4 text-paragraph-lg text-text-sub-600">
              Everything you need to manage academics, administration, and
              communication — in a single platform built for schools, colleges,
              and training centers.
            </p>
          </div>
        </section>

        {/* Feature Categories */}
        <section className="bg-bg-weak-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-20">
            {categories.map((category, categoryIndex) => (
              <div key={category.id} id={category.id}>
                <div
                  className={cn(
                    "mb-8 text-center md:text-left",
                    categoryIndex % 2 !== 0 && "md:text-right"
                  )}
                >
                  <h2 className="text-title-h3 text-text-strong-950">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-paragraph-md text-text-sub-600">
                    {category.description}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {category.features.map((feature) => (
                    <article
                      key={feature.title}
                      className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-xs transition-shadow hover:shadow-regular-sm"
                    >
                      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary-base">
                        <feature.icon
                          className="size-5 text-static-white"
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className="text-label-md text-text-strong-950">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-paragraph-sm text-text-sub-600">
                        {feature.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bg-white-0 px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-title-h3 text-text-strong-950">
              Start managing smarter today
            </h2>
            <p className="mt-4 text-paragraph-md text-text-sub-600">
              Join thousands of institutions already using EduFlow to simplify
              their operations and improve outcomes.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href={`/${lang}/sign-up`}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Get started free
                <RiArrowRightLine className="ml-2 size-4" aria-hidden="true" />
              </a>
              <a
                href={`/${lang}/pricing`}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" })
                )}
              >
                View pricing
              </a>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
