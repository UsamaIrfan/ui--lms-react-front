import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type Props = { params: Promise<{ language: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "about");
  return { title: t("title"), description: t("metaDescription") };
}

const stats = [
  { label: "Founded", value: "2023" },
  { label: "Institutions", value: "500+" },
  { label: "Students", value: "50k+" },
  { label: "Countries", value: "15" },
];

const values = [
  {
    title: "Innovation",
    description:
      "We continuously push boundaries to deliver cutting-edge educational technology that keeps pace with the evolving needs of modern learners.",
  },
  {
    title: "Accessibility",
    description:
      "Education should be available to everyone. We design inclusive tools that work across devices, languages, and abilities.",
  },
  {
    title: "Security",
    description:
      "We safeguard student and institutional data with enterprise-grade security, ensuring privacy and compliance at every level.",
  },
  {
    title: "Support",
    description:
      "Our dedicated team is always ready to help. We provide responsive, knowledgeable support to every institution we serve.",
  },
];

export default async function AboutPage(props: Props) {
  const params = await props.params;
  const lang = params.language;
  return (
    <MarketingLayout>
      <div data-testid="about-page">
        {/* Hero */}
        <section
          data-testid="about-hero"
          className="bg-bg-white-0 py-20 text-center"
        >
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-title-h1 text-text-strong-950">
              About EduFlow
            </h1>
            <p className="mt-4 text-paragraph-lg text-text-sub-600">
              Our mission is to transform education through modern technology,
              empowering institutions and learners to achieve their full
              potential.
            </p>
          </div>
        </section>

        {/* Mission / Vision */}
        <section className="bg-bg-weak-50 py-16">
          <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
            <div>
              <h2 className="text-title-h3 text-text-strong-950">
                Our Mission
              </h2>
              <p className="mt-4 text-paragraph-md text-text-sub-600">
                EduFlow is built to simplify and elevate the management of
                educational institutions. We provide a comprehensive platform
                that unifies administration, teaching, and learning into a
                seamless experience — so educators can focus on what matters
                most.
              </p>
            </div>
            <div>
              <h2 className="text-title-h3 text-text-strong-950">Our Vision</h2>
              <p className="mt-4 text-paragraph-md text-text-sub-600">
                We envision a world where every institution, regardless of size
                or location, has access to world-class tools that make education
                more effective, engaging, and equitable for all.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-bg-white-0 py-16">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-title-h2 text-primary-base">{stat.value}</p>
                <p className="mt-1 text-label-md text-text-sub-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="bg-bg-weak-50 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-title-h3 text-text-strong-950">
              Our Values
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {values.map((v) => (
                <Card key={v.title}>
                  <CardHeader>
                    <CardTitle>{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-paragraph-sm text-text-sub-600">
                      {v.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bg-white-0 py-20 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-title-h3 text-text-strong-950">
              Join the EduFlow community
            </h2>
            <p className="mt-4 text-paragraph-md text-text-sub-600">
              Discover how EduFlow can help your institution thrive.
            </p>
            <div className="mt-8">
              <a href={`/${lang}/contact`} className={cn(buttonVariants())}>
                Get Started
              </a>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
