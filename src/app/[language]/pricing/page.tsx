import type { Metadata } from "next";
import { RiCheckLine, RiCloseLine, RiArrowRightLine } from "@remixicon/react";
import { getServerTranslation } from "@/services/i18n";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "pricing");
  return { title: t("title"), description: t("metaDescription") };
}

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description:
      "Perfect for small schools getting started with digital management.",
    highlighted: false,
    features: [
      "Up to 100 students",
      "Basic attendance tracking",
      "Fee management",
      "Email support",
      "1 admin account",
    ],
    cta: "Get started free",
    href: "/sign-up",
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    description:
      "For growing institutions that need advanced tools and insights.",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Up to 1,000 students",
      "Advanced analytics",
      "Exam management",
      "Staff portal",
      "Timetable builder",
      "Priority support",
      "5 admin accounts",
    ],
    cta: "Start free trial",
    href: "/sign-up",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "Tailored solutions for large institutions with complex needs.",
    highlighted: false,
    features: [
      "Unlimited students",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
      "Unlimited admin accounts",
    ],
    cta: "Contact sales",
    href: "mailto:sales@eduflow.com",
  },
];

const comparisonFeatures = [
  {
    name: "Students",
    starter: "Up to 100",
    professional: "Up to 1,000",
    enterprise: "Unlimited",
  },
  {
    name: "Admin accounts",
    starter: "1",
    professional: "5",
    enterprise: "Unlimited",
  },
  {
    name: "Attendance tracking",
    starter: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Fee management",
    starter: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Exam management",
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    name: "Advanced analytics",
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    name: "Staff portal",
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    name: "Timetable builder",
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    name: "Custom integrations",
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    name: "Dedicated account manager",
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    name: "SLA guarantee",
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    name: "On-premise deployment",
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    name: "Support",
    starter: "Email",
    professional: "Priority",
    enterprise: "Dedicated",
  },
];

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes. You can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately. When downgrading, the change takes effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial for the Professional plan?",
    answer:
      "Absolutely. The Professional plan comes with a 14-day free trial — no credit card required. You get full access to every Professional feature during the trial period.",
  },
  {
    question: "What happens if I exceed my student limit?",
    answer:
      "We will notify you when you are approaching your plan's student limit. You can upgrade at any time to accommodate more students without losing any data.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes. Annual billing gives you two months free compared to monthly billing. Contact our sales team for custom pricing on multi-year agreements.",
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-paragraph-sm text-text-strong-950">{value}</span>
    );
  }
  if (value) {
    return (
      <RiCheckLine
        className="mx-auto size-5 text-success-base"
        aria-label="Included"
      />
    );
  }
  return (
    <RiCloseLine
      className="mx-auto size-5 text-text-disabled-300"
      aria-label="Not included"
    />
  );
}

export default async function PricingPage(props: Props) {
  const params = await props.params;
  const lang = params.language;
  return (
    <MarketingLayout>
      <div data-testid="pricing-page">
        {/* Hero */}
        <section
          data-testid="pricing-hero"
          className="bg-bg-white-0 px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-3xl">
            <h1 className="text-title-h1 text-text-strong-950">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-paragraph-lg text-text-sub-600">
              Simple, transparent pricing that scales with your institution.
              Start free and upgrade when you are ready.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="bg-bg-weak-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col",
                  plan.highlighted &&
                    "relative border-primary-base ring-1 ring-primary-base"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-base px-4 py-1 text-label-xs text-static-white">
                    {plan.badge}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-label-lg text-text-strong-950">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-text-sub-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-title-h2 text-text-strong-950">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-paragraph-md text-text-sub-600">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3" role="list">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-paragraph-sm text-text-sub-600"
                      >
                        <RiCheckLine
                          className="mt-0.5 size-4 shrink-0 text-success-base"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <a
                    href={
                      plan.href.startsWith("/")
                        ? `/${lang}${plan.href}`
                        : plan.href
                    }
                    className={cn(
                      buttonVariants({
                        variant: plan.highlighted ? "default" : "outline",
                      }),
                      "w-full"
                    )}
                  >
                    {plan.cta}
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-bg-white-0 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-title-h3 text-text-strong-950">
              Compare Plans
            </h2>
            <div className="overflow-x-auto rounded-xl border border-stroke-soft-200">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
                    <th className="px-4 py-3 text-label-sm text-text-sub-600">
                      Feature
                    </th>
                    <th className="px-4 py-3 text-center text-label-sm text-text-sub-600">
                      Starter
                    </th>
                    <th className="px-4 py-3 text-center text-label-sm text-text-strong-950">
                      Professional
                    </th>
                    <th className="px-4 py-3 text-center text-label-sm text-text-sub-600">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr
                      key={row.name}
                      className={cn(
                        i < comparisonFeatures.length - 1 &&
                          "border-b border-stroke-soft-200"
                      )}
                    >
                      <td className="px-4 py-3 text-paragraph-sm text-text-strong-950">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FeatureValue value={row.starter} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FeatureValue value={row.professional} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FeatureValue value={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-bg-weak-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-title-h3 text-text-strong-950">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6"
                >
                  <dt className="text-label-md text-text-strong-950">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-paragraph-sm text-text-sub-600">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bg-white-0 px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-title-h3 text-text-strong-950">
              Start your free trial today
            </h2>
            <p className="mt-4 text-paragraph-md text-text-sub-600">
              No credit card required. Get up and running in minutes with the
              Starter plan, or try Professional free for 14 days.
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
                href={`/${lang}/features`}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" })
                )}
              >
                Explore features
              </a>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
