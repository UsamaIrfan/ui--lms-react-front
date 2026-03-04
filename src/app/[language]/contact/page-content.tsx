"use client";

import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .defined(),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email")
    .defined(),
  subject: yup.string().required("Subject is required").defined(),
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters")
    .defined(),
});

const contactInfo = [
  { title: "Email", detail: "hello@eduflow.com" },
  { title: "Phone", detail: "+1 (555) 123-4567" },
  { title: "Office", detail: "123 Education Lane" },
];

export default function ContactPageContent() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, control } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
  });

  const { errors } = useFormState({ control });

  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <MarketingLayout>
      <div data-testid="contact-page">
        {/* Hero */}
        <section className="bg-bg-white-0 py-20 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-title-h1 text-text-strong-950">Get in Touch</h1>
            <p className="mt-4 text-paragraph-lg text-text-sub-600">
              Have a question or want to learn more? We&apos;d love to hear from
              you.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="bg-bg-weak-50 py-16">
          <div className="mx-auto grid max-w-4xl gap-6 px-6 md:grid-cols-3">
            {contactInfo.map((info) => (
              <Card key={info.title}>
                <CardHeader>
                  <CardTitle>{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-paragraph-sm text-text-sub-600">
                    {info.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-bg-white-0 py-16">
          <div className="mx-auto max-w-xl px-6">
            {submitted ? (
              <div className="text-center">
                <h2 className="text-title-h3 text-text-strong-950">
                  Thank you!
                </h2>
                <p className="mt-4 text-paragraph-md text-text-sub-600">
                  Your message has been received. We&apos;ll get back to you
                  shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
                noValidate
              >
                <div>
                  <Input
                    data-testid="contact-name"
                    placeholder="Name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-paragraph-xs text-error-base">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    data-testid="contact-email"
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-paragraph-xs text-error-base">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    data-testid="contact-subject"
                    placeholder="Subject"
                    {...register("subject")}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-paragraph-xs text-error-base">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <Textarea
                    data-testid="contact-message"
                    placeholder="Message"
                    rows={5}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-paragraph-xs text-error-base">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button type="submit" data-testid="contact-submit">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
