import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Landmark,
  Package,
  Award,
  Gavel,
  Wrench,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Performance & Bid Bonds",
  description:
    "Secure performance bonds, bid bonds, payment bonds, and surety bonds for contractors and businesses from SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: { canonical: "https://clearforkinsurance.com/bonds" },
};

const BOND_TYPES = [
  {
    name: "Payment Bonds",
    desc: "Guarantee that subcontractors, laborers, and material suppliers will be paid for their work and materials on the project.",
    icon: Banknote,
  },
  {
    name: "Subdivision Bonds",
    desc: "Required by municipalities to guarantee that a developer will complete public improvements such as roads, sidewalks, and utilities.",
    icon: Landmark,
  },
  {
    name: "Supply Bonds",
    desc: "Guarantee that a supplier will deliver materials or equipment according to the terms of the supply contract.",
    icon: Package,
  },
  {
    name: "Performance Bonds",
    desc: "Assure the project owner that the work will be completed according to the contract terms, specifications, and timeline.",
    icon: Award,
  },
  {
    name: "Bid Bonds",
    desc: "Guarantee that you will enter into a contract at the bid price if awarded the project. Required for most public construction projects.",
    icon: Gavel,
  },
  {
    name: "Maintenance Bonds",
    desc: "Protect the project owner against defects in materials and workmanship for a specified period after project completion.",
    icon: Wrench,
  },
];

export default function BondsPage() {
  const schemas = [
    serviceSchema(
      "Performance & Bid Bonds",
      "Performance bonds, bid bonds, payment bonds, and surety bonds for contractors and businesses in Benbrook, TX.",
      "https://clearforkinsurance.com/bonds",
    ),
    breadcrumbSchema([
      { name: "Home", url: "https://clearforkinsurance.com/" },
      {
        name: "Performance & Bid Bonds",
        url: "https://clearforkinsurance.com/bonds",
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
              { label: "Performance & Bid Bonds" },
            ]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Performance &amp; Bid Bonds
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Whether you&apos;re bidding on a government contract or guaranteeing
            project completion, our bonding solutions help you win more work and
            build trust with clients.
          </p>
        </div>
      </section>

      {/* Bond Type Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Bond Types We Offer
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BOND_TYPES.map((bond) => (
              <div
                key={bond.name}
                className="service-card rounded-xl bg-gray-50 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <bond.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {bond.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {bond.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Need a Bond? We Can Help.
          </h2>
          <p className="mb-8 text-muted-foreground">
            Our team has deep experience in surety bonding for contractors of all
            sizes. Get pre-qualified quickly and competitively.
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
