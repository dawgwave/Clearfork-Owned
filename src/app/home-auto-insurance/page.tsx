import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Car,
  Key,
  Umbrella,
  Shield,
  Heart,
  DollarSign,
  Users,
  Gift,
  Headphones,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Home & Auto Insurance",
  description:
    "Protect your home, car, and lifestyle with comprehensive personal lines insurance from SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: {
    canonical: "https://clearforkinsurance.com/home-auto-insurance",
  },
};

const COVERAGES = [
  {
    name: "Homeowners Insurance",
    desc: "Comprehensive protection for your home, personal property, and liability — giving you peace of mind against the unexpected.",
    icon: Home,
  },
  {
    name: "Auto Insurance",
    desc: "Full coverage for your vehicles including collision, comprehensive, liability, and uninsured motorist protection.",
    icon: Car,
  },
  {
    name: "Renters Insurance",
    desc: "Affordable coverage for your personal belongings and liability as a renter, so you're protected wherever you call home.",
    icon: Key,
  },
  {
    name: "Umbrella Insurance",
    desc: "Extra liability coverage beyond your standard policies for added protection against major claims and lawsuits.",
    icon: Umbrella,
  },
  {
    name: "Condo Insurance",
    desc: "Specialized coverage for condo owners — protecting your unit, personal property, and shared spaces.",
    icon: Shield,
  },
  {
    name: "Valuable Items Coverage",
    desc: "Extra protection for your jewelry, art, electronics, and other high-value possessions beyond standard policy limits.",
    icon: Heart,
  },
];

const WHY_CHOOSE = [
  {
    title: "Competitive Rates",
    desc: "We shop multiple carriers to find you the best coverage at the best price.",
    icon: DollarSign,
  },
  {
    title: "Personalized Service",
    desc: "A dedicated agent who knows you by name and understands your unique needs.",
    icon: Users,
  },
  {
    title: "Multi-Policy Discounts",
    desc: "Bundle your home, auto, and other policies for significant savings.",
    icon: Gift,
  },
  {
    title: "Claims Support",
    desc: "We advocate for you throughout the entire claims process from start to finish.",
    icon: Headphones,
  },
];

export default function HomeAutoPage() {
  const schemas = [
    serviceSchema(
      "Home & Auto Insurance",
      "Comprehensive personal lines insurance covering home, auto, renters, umbrella, condo, and valuables in Benbrook, TX.",
      "https://clearforkinsurance.com/home-auto-insurance",
    ),
    breadcrumbSchema([
      { name: "Home", url: "https://clearforkinsurance.com/" },
      {
        name: "Home & Auto Insurance",
        url: "https://clearforkinsurance.com/home-auto-insurance",
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
              { label: "Home & Auto Insurance" },
            ]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Protect What Matters Most: Your Home, Car, and Lifestyle
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            From your first apartment to your dream home, from daily commutes to
            weekend road trips — we provide personalized coverage that fits your
            life and your budget.
          </p>
        </div>
      </section>

      {/* Coverage Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Our Personal Lines Coverage
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

      {/* Why Choose Us */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Why Choose Clearfork?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE.map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-card p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Ready to Protect What Matters?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Get a personalized quote in minutes. Our agents are ready to help
            you find the perfect coverage.
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
