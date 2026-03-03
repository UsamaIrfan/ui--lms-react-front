import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "home");

  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

const stats = [
  { value: "500+", label: "Institutions" },
  { value: "50k+", label: "Students" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const features = [
  {
    icon: "🎓",
    title: "Student Management",
    description:
      "Manage enrollments, profiles, and academic records from a single dashboard.",
  },
  {
    icon: "📋",
    title: "Attendance Tracking",
    description:
      "Automated attendance with real-time reports for students and staff.",
  },
  {
    icon: "📝",
    title: "Exam Management",
    description:
      "Create, schedule, and grade exams with built-in analytics and reporting.",
  },
  {
    icon: "💰",
    title: "Fee Management",
    description:
      "Streamline fee collection, invoicing, and financial reporting.",
  },
  {
    icon: "👩‍🏫",
    title: "Staff Portal",
    description:
      "Dedicated portal for teachers and staff with leave, payroll, and scheduling.",
  },
  {
    icon: "🗓️",
    title: "Timetable Scheduling",
    description:
      "Intelligent timetable generation with conflict detection and room allocation.",
  },
];

const steps = [
  {
    step: 1,
    title: "Set Up Your Institution",
    description:
      "Configure your institution profile, academic year, and organizational structure in minutes.",
  },
  {
    step: 2,
    title: "Invite Your Team",
    description:
      "Add administrators, teachers, and staff with role-based access controls.",
  },
  {
    step: 3,
    title: "Start Managing",
    description:
      "Enroll students, track attendance, manage exams, and handle fees — all from one platform.",
  },
];

const benefits = [
  {
    icon: "⚡",
    title: "Save Hours Every Week",
    description:
      "Automate repetitive administrative tasks and focus on what matters — educating students.",
  },
  {
    icon: "📊",
    title: "Data-Driven Decisions",
    description:
      "Real-time dashboards and reports give you actionable insights to improve outcomes.",
  },
  {
    icon: "🔒",
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security with role-based access, audit logs, and 99.9% uptime guarantee.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for small institutions getting started.",
    features: [
      "Up to 100 students",
      "Basic attendance tracking",
      "Fee management",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    description: "For growing institutions that need more power.",
    features: [
      "Up to 1,000 students",
      "Advanced analytics",
      "Exam management",
      "Staff portal",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large institutions with custom needs.",
    features: [
      "Unlimited students",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
    ],
  },
];

const faqs = [
  {
    question: "How long does it take to set up EduFlow?",
    answer:
      "Most institutions are up and running within a day. Our guided setup wizard walks you through configuring your institution, importing student data, and inviting your team.",
  },
  {
    question: "Can I migrate data from my existing system?",
    answer:
      "Yes! EduFlow supports bulk data import via CSV and integrates with popular student information systems. Our support team can also assist with custom migrations.",
  },
  {
    question: "Is EduFlow suitable for K-12 and higher education?",
    answer:
      "Absolutely. EduFlow is designed to be flexible and works for K-12 schools, colleges, universities, and training institutes of any size.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We offer email support for all plans, priority support for Professional plans, and a dedicated account manager for Enterprise customers. Our help center is available 24/7.",
  },
  {
    question: "Can parents access the system?",
    answer:
      "Yes. Parents get their own portal where they can view their child's attendance, grades, fee status, and communicate with teachers.",
  },
];

export default async function Home(_props: Props) {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section
        data-testid="hero-section"
        className="bg-primary-base px-4 py-24 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <h1
            data-testid="home-title"
            className="text-title-h1 text-static-white sm:text-5xl"
          >
            Transform Your Institution with Modern Learning Management
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-paragraph-md text-static-white/80">
            EduFlow is the all-in-one learning management system that helps
            institutions streamline administration, engage students, and empower
            educators.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full text-static-white hover:bg-static-white/10 hover:text-static-white sm:w-auto"
              asChild
            >
              <Link href="/demo">Request Demo</Link>
            </Button>
          </div>
          <p className="mt-8 text-label-sm text-static-white/60">
            Trusted by 500+ institutions worldwide
          </p>
        </div>
      </section>

      {/* Stats */}
      <section
        data-testid="stats-section"
        className="border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-title-h2 text-primary-base">{stat.value}</p>
              <p className="mt-1 text-label-sm text-text-sub-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        data-testid="features-section"
        className="bg-bg-weak-50 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-title-h2 text-text-strong-950">
              Everything You Need to Manage Learning
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-paragraph-md text-text-sub-600">
              From enrollment to graduation, EduFlow covers every aspect of
              institutional management.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="text-3xl">{feature.icon}</div>
                  <CardTitle className="mt-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        data-testid="how-it-works-section"
        className="bg-bg-white-0 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-title-h2 text-text-strong-950">
            Get Started in 3 Simple Steps
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-base text-label-md text-static-white">
                  {step.step}
                </div>
                <h3 className="mt-6 text-label-md text-text-strong-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-paragraph-sm text-text-sub-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        data-testid="benefits-section"
        className="bg-bg-weak-50 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl space-y-16">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex flex-col items-center gap-8 md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-base/10 text-4xl">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-label-lg text-text-strong-950">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-paragraph-md text-text-sub-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section
        data-testid="pricing-preview-section"
        className="bg-bg-white-0 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-title-h2 text-text-strong-950">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-paragraph-md text-text-sub-600">
            Start free and scale as your institution grows.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "border-primary-base ring-2 ring-primary-base/20"
                    : ""
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-title-h2 text-text-strong-950">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-paragraph-sm text-text-sub-600">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-paragraph-sm text-text-sub-600"
                      >
                        <span className="text-success-base">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link
                      href={plan.name === "Enterprise" ? "/demo" : "/sign-up"}
                    >
                      {plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-paragraph-sm text-text-sub-600">
            <Link
              href="/pricing"
              className="text-primary-base underline hover:opacity-80"
            >
              View full pricing details →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        data-testid="cta-section"
        className="bg-primary-base px-4 py-24 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-title-h2 text-static-white">
            Ready to Transform Your Institution?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-paragraph-md text-static-white/80">
            Join hundreds of institutions already using EduFlow to deliver
            better educational experiences.
          </p>
          <div className="mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-up">Start Your Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        data-testid="faq-section"
        className="bg-bg-white-0 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-title-h2 text-text-strong-950">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-stroke-soft-200 bg-bg-white-0"
              >
                <summary className="cursor-pointer px-6 py-4 text-label-md text-text-strong-950 marker:[content:none] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    {faq.question}
                    <span className="ml-4 shrink-0 text-text-sub-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="px-6 pb-4 text-paragraph-sm text-text-sub-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
