import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Building2,
  HardHat,
  Truck,
  Wrench,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Commercial Insurance",
  description:
    "Protect your business with comprehensive commercial insurance — general liability, property, workers' comp, commercial auto, and more from SIG Clearfork Insurance Group.",
  alternates: {
    canonical: "https://clearforkinsurance.com/commercial-insurance",
  },
};

const COVERAGES = [
  {
    name: "General Liability",
    desc: "Protect your business against third-party claims of bodily injury, property damage, and personal injury.",
    icon: Shield,
  },
  {
    name: "Commercial Property",
    desc: "Coverage for your buildings, equipment, inventory, and other business property against fire, theft, and natural disasters.",
    icon: Building2,
  },
  {
    name: "Workers' Compensation",
    desc: "Required coverage that protects employees injured on the job and shields your business from related lawsuits.",
    icon: HardHat,
  },
  {
    name: "Commercial Auto",
    desc: "Protect vehicles used for business operations, including liability, collision, and physical damage coverage.",
    icon: Truck,
  },
  {
    name: "Equipment & Tools",
    desc: "Inland marine and equipment coverage for tools, machinery, and materials in transit or stored at job sites.",
    icon: Wrench,
  },
  {
    name: "Professional Liability (E&O)",
    desc: "Errors & omissions coverage protecting against claims of negligence, mistakes, or failure to deliver professional services.",
    icon: Scale,
  },
];

const INDUSTRIES = [
  "Contractors & Construction",
  "Restaurants & Food Service",
  "Retail & Wholesale",
  "Healthcare & Medical",
  "Real Estate & Property Management",
  "Manufacturing & Distribution",
  "Technology & IT Services",
  "Professional Services",
  "Non-Profits & Religious Organizations",
  "Transportation & Logistics",
];

export default function CommercialPage() {
  const schemas = [
    serviceSchema(
      "Commercial Insurance",
      "Full-range commercial insurance including GL, property, auto, workers' comp, and professional liability in Benbrook, TX.",
      "https://clearforkinsurance.com/commercial-insurance",
    ),
    breadcrumbSchema([
      { name: "Home", url: "https://clearforkinsurance.com/" },
      {
        name: "Commercial Insurance",
        url: "https://clearforkinsurance.com/commercial-insurance",
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
              { label: "Commercial Insurance" },
            ]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Comprehensive Protection for Your Business
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Running a business comes with risks. From protecting your property
            and equipment to safeguarding your reputation, we provide a full
            range of commercial insurance solutions tailored to your industry.
          </p>
        </div>
      </section>

      {/* Coverage Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Commercial Coverage Options
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

      {/* Industries */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Industries We Serve
          </h2>
          <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {INDUSTRIES.map((industry) => (
              <div key={industry} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-foreground">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Protect Your Business Today
          </h2>
          <p className="mb-8 text-muted-foreground">
            Every business is unique. Let our experienced agents build a custom
            insurance package that protects what you&apos;ve worked so hard to
            build.
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
