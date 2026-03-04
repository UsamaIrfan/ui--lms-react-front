"use client";

import { useState } from "react";
import {
  useForm,
  useFormContext,
  FormProvider,
  useFormState,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DemoFormData = {
  name: string;
  email: string;
  institution: string;
  role: string;
  message: string;
};

const validationSchema = yup.object().shape({
  name: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  institution: yup.string().required("Institution name is required"),
  role: yup.string().required("Please select a role"),
  message: yup.string().defined().default(""),
});

const timelineSteps = [
  {
    step: "1",
    title: "We'll reach out within 24 hours",
    description:
      "A member of our team will contact you to understand your needs and schedule a convenient time.",
  },
  {
    step: "2",
    title: "Personalized demo of EduFlow",
    description:
      "Get a tailored walkthrough of the platform focused on the features that matter most to your institution.",
  },
  {
    step: "3",
    title: "Get your custom onboarding plan",
    description:
      "Receive a detailed plan to get your institution up and running with EduFlow quickly and smoothly.",
  },
];

function SubmitButton() {
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      size="lg"
      data-testid="demo-submit"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Requesting…
        </span>
      ) : (
        "Request Demo"
      )}
    </Button>
  );
}

function DemoFormFields() {
  const { register } = useFormContext<DemoFormData>();
  const { errors } = useFormState<DemoFormData>();

  return (
    <>
      <h2 className="text-title-h4 text-text-strong-950">
        Tell us about yourself
      </h2>

      <div>
        <label
          htmlFor="demo-name"
          className="mb-1.5 block text-label-sm text-text-strong-950"
        >
          Full Name <span className="text-error-base">*</span>
        </label>
        <Input
          id="demo-name"
          data-testid="demo-name"
          placeholder="John Smith"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-paragraph-xs text-error-base">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="demo-email"
          className="mb-1.5 block text-label-sm text-text-strong-950"
        >
          Email <span className="text-error-base">*</span>
        </label>
        <Input
          id="demo-email"
          data-testid="demo-email"
          type="email"
          placeholder="you@institution.edu"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-paragraph-xs text-error-base">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="demo-institution"
          className="mb-1.5 block text-label-sm text-text-strong-950"
        >
          Institution Name <span className="text-error-base">*</span>
        </label>
        <Input
          id="demo-institution"
          data-testid="demo-institution"
          placeholder="University of Example"
          {...register("institution")}
        />
        {errors.institution && (
          <p className="mt-1 text-paragraph-xs text-error-base">
            {errors.institution.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="demo-role"
          className="mb-1.5 block text-label-sm text-text-strong-950"
        >
          Role <span className="text-error-base">*</span>
        </label>
        <select
          id="demo-role"
          data-testid="demo-role"
          className="flex h-10 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm text-text-strong-950 shadow-regular-xs transition duration-200 ease-out hover:border-stroke-sub-300 focus-visible:border-stroke-strong-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-bg-weak-50"
          defaultValue=""
          {...register("role")}
        >
          <option value="" disabled>
            Select your role
          </option>
          <option value="administrator">Administrator</option>
          <option value="principal">Principal</option>
          <option value="teacher">Teacher</option>
          <option value="it-staff">IT Staff</option>
          <option value="other">Other</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-paragraph-xs text-error-base">
            {errors.role.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="demo-message"
          className="mb-1.5 block text-label-sm text-text-strong-950"
        >
          Message / Notes
        </label>
        <Textarea
          id="demo-message"
          data-testid="demo-message"
          placeholder="Tell us about your needs or any questions you have…"
          rows={4}
          {...register("message")}
        />
      </div>

      <SubmitButton />
    </>
  );
}

export default function DemoPageContent() {
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<DemoFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      email: "",
      institution: "",
      role: "",
      message: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitted(true);
  });

  return (
    <MarketingLayout>
      <div data-testid="demo-page">
        {/* Hero */}
        <section className="bg-bg-white-0 py-20 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-title-h1 text-text-strong-950">
              Request a Demo
            </h1>
            <p className="mt-4 text-paragraph-lg text-text-sub-600">
              See EduFlow in action with a personalized walkthrough tailored to
              your institution&apos;s needs.
            </p>
          </div>
        </section>

        <section className="bg-bg-weak-50 py-16">
          <div className="mx-auto grid max-w-5xl gap-12 px-6 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-8 shadow-regular-md">
              {submitted ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-testid="demo-success"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-lighter">
                    <svg
                      className="h-8 w-8 text-success-base"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-title-h3 text-text-strong-950">
                    Thank you!
                  </h2>
                  <p className="mt-2 text-paragraph-md text-text-sub-600">
                    Your demo request has been submitted successfully. Our team
                    will reach out to you within 24 hours.
                  </p>
                </div>
              ) : (
                <FormProvider {...methods}>
                  <form onSubmit={onSubmit} className="space-y-5">
                    <DemoFormFields />
                  </form>
                </FormProvider>
              )}
            </div>

            {/* Timeline */}
            <div className="flex flex-col justify-center">
              <h2 className="text-title-h3 text-text-strong-950">
                What Happens Next
              </h2>
              <div className="mt-8 space-y-8">
                {timelineSteps.map((item, index) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-base text-label-md text-static-white">
                        {item.step}
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div className="mt-2 h-full w-px bg-stroke-soft-200" />
                      )}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-label-lg text-text-strong-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-paragraph-sm text-text-sub-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
