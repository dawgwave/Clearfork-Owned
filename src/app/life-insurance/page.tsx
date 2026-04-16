import type { Metadata } from "next";
import Link from "next/link";
import {
  HeartPulse,
  Shield,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Life Insurance",
  description:
    "Secure your family's future with term life, whole life, and key man life insurance plans from SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: {
    canonical: "https://clearforkinsurance.com/life-insurance",
  },
};

const PRODUCTS = [
  {
    name: "Term Life Insurance",
    desc: "Affordable coverage for a specific period — ideal for mortgage protection, income replacement, and growing families. Choose terms from 10 to 30 years with guaranteed level premiums.",
    icon: HeartPulse,
  },
  {
    name: "Whole Life Insurance",
    desc: "Permanent coverage that lasts your entire lifetime with a cash value component that grows tax-deferred. Build wealth while protecting your loved ones.",
    icon: Shield,
  },
  {
    name: "Key Man Life Insurance",
    desc: "Protect your business from the financial impact of losing a key employee, partner, or owner. Ensures business continuity and stability during difficult transitions.",
    icon: Briefcase,
  },
];

const BENEFITS = [
  "Replace lost income for your family",
  "Pay off mortgage and outstanding debts",
  "Fund your children's education",
  "Cover final expenses and estate taxes",
  "Leave a legacy for future generations",
  "Protect your business partners and employees",
];

export default function LifeInsurancePage() {
  const schemas = [
    serviceSchema(
      "Life Insurance",
      "Term, whole, and key man life insurance plans in Benbrook, TX.",
      "https://clearforkinsurance.com/life-insurance",
    ),
    breadcrumbSchema([
      { name: "Home", url: "https://clearforkinsurance.com/" },
      {
        name: "Life Insurance",
        url: "https://clearforkinsurance.com/life-insurance",
      },
    ]),
  ];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Life Insurance" },
            ]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Secure Your Family&apos;s Future
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Life insurance is one of the most important financial decisions
            you&apos;ll make. We help you find the right policy to protect your
            loved ones and give you peace of mind.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Life Insurance Products
          </h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="service-card rounded-xl bg-gray-50 p-8"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <p.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {p.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Why Life Insurance Matters
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Get the Protection Your Family Deserves
          </h2>
          <p className="mb-8 text-muted-foreground">
            Our agents will walk you through your options and help you find a
            plan that fits your needs and budget.
          </p>
          <Link
            href="/get-a-quote"
            className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Your Free Quote
          </Link>
        </div>
      </section>
    </>
  );
}
