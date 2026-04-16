import type { Metadata } from "next";
import Link from "next/link";
import {
  Lock,
  FileCode,
  Wifi,
  ShieldAlert,
  Users,
  Settings,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Cyber Insurance",
  description:
    "Protect your business from data breaches, ransomware, and cyber threats with comprehensive cyber insurance from SIG Clearfork Insurance Group.",
  alternates: {
    canonical: "https://clearforkinsurance.com/cyber-insurance",
  },
};

const COVERAGES = [
  {
    name: "Data Breach & Network Security",
    desc: "Coverage for notification costs, credit monitoring, forensic investigation, and public relations following a data breach or network security failure.",
    icon: Lock,
  },
  {
    name: "Tech E&O",
    desc: "Technology errors and omissions coverage protecting against claims of negligence, software failure, or inadequate technology services.",
    icon: FileCode,
  },
  {
    name: "Business Cyber Interruption",
    desc: "Coverage for lost income and extra expenses when a cyber event disrupts your business operations and revenue streams.",
    icon: Wifi,
  },
  {
    name: "Cyber Extortion & Ransomware",
    desc: "Financial protection against ransomware attacks and cyber extortion demands, including negotiation support and ransom payments.",
    icon: ShieldAlert,
  },
  {
    name: "Third-Party Liability",
    desc: "Protection against lawsuits from customers, partners, or regulators arising from a data breach or failure to protect sensitive information.",
    icon: Users,
  },
  {
    name: "Customizable Policies",
    desc: "Tailored cyber insurance solutions designed to match your industry, risk profile, and compliance requirements.",
    icon: Settings,
  },
];

export default function CyberInsurancePage() {
  const schemas = [
    serviceSchema(
      "Cyber Insurance",
      "Protection against data breaches, ransomware, and cyber threats for businesses in Benbrook, TX.",
      "https://clearforkinsurance.com/cyber-insurance",
    ),
    breadcrumbSchema([
      { name: "Home", url: "https://clearforkinsurance.com/" },
      {
        name: "Cyber Insurance",
        url: "https://clearforkinsurance.com/cyber-insurance",
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
              { label: "Cyber Insurance" },
            ]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Cyber Insurance for the Digital Age
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            In today&apos;s digital world, cyber threats are a growing risk for
            businesses of all sizes. Our cyber insurance solutions protect your
            business from the financial impact of data breaches, ransomware, and
            cyber attacks.
          </p>
        </div>
      </section>

      {/* Coverage Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Cyber Coverage Options
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COVERAGES.map((c) => (
              <div
                key={c.name}
                className="service-card rounded-xl bg-gray-50 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {c.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {c.desc}
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
            Don&apos;t Wait for a Cyber Attack
          </h2>
          <p className="mb-8 text-muted-foreground">
            Cyber threats are evolving every day. Let us help you build a
            comprehensive cyber insurance strategy before it&apos;s too late.
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
