import Link from "next/link";
import {
  BadgeDollarSign,
  Bike,
  Building,
  Car,
  CircleDot,
  Heart,
  Home,
  Monitor,
  Ship,
  Truck,
  Umbrella,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { breadcrumbSchema } from "@/lib/schema";

const QUOTE_LINES = [
  {
    title: "Auto & home (detailed)",
    description:
      "Drivers, vehicles, discounts — full personal-lines questionnaire with optional document upload.",
    href: "/get-auto-quote",
    icon: Car,
    badge: "Full form",
  },
  {
    title: "Homeowners / renters",
    description: "Property type, occupancy, and the coverage you need.",
    href: "/get-home-quote",
    icon: Home,
  },
  {
    title: "Umbrella liability",
    description: "Extra liability limits above your underlying policies.",
    href: "/get-umbrella-quote",
    icon: Umbrella,
  },
  {
    title: "Boat",
    description: "Hull, motor, and where you use the vessel.",
    href: "/get-boat-quote",
    icon: Ship,
  },
  {
    title: "RV",
    description: "Motorhome, travel trailer, or fifth wheel.",
    href: "/get-rv-quote",
    icon: Truck,
  },
  {
    title: "ATV / off-road",
    description: "Side-by-side, ATV, or similar off-road units.",
    href: "/get-atv-quote",
    icon: CircleDot,
  },
  {
    title: "Motorcycle",
    description: "Street bike, cruiser, or sport — usage and safety courses.",
    href: "/get-motorcycle-quote",
    icon: Bike,
  },
  {
    title: "Commercial",
    description: "Business liability, property, workers’ comp, and more.",
    href: "/get-commercial-quote",
    icon: Building,
  },
  {
    title: "Life insurance",
    description: "Term, whole, or universal — goals and benefit range.",
    href: "/get-life-quote",
    icon: Heart,
  },
  {
    title: "Cyber insurance",
    description: "Breach response, ransomware, and business interruption.",
    href: "/get-cyber-quote",
    icon: Monitor,
  },
  {
    title: "Performance & bid bonds",
    description: "Bid, performance, payment, and contract surety.",
    href: "/get-performance-and-bid-bonds-quote",
    icon: BadgeDollarSign,
  },
] as const;

export default function GetAQuotePage() {
  const schema = breadcrumbSchema([
    { name: "Home", url: "https://clearforkinsurance.com/" },
    { name: "Get a quote", url: "https://clearforkinsurance.com/get-a-quote" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Get a quote" }]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Get a quote
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Choose a line of business. Each option opens a short form tailored to
            that coverage; requests go to our team and appear in the admin queue
            by type.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            What type of insurance do you need?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {QUOTE_LINES.map((line) => (
              <Link
                key={line.href}
                href={line.href}
                className="service-card group rounded-xl border border-transparent bg-gray-50 p-6 transition-colors hover:border-primary/20 hover:bg-gray-50/80"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <line.icon
                      className="h-6 w-6 text-primary"
                      aria-hidden
                    />
                  </div>
                  {"badge" in line && line.badge ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {line.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
                  {line.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {line.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                  Continue
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Prefer to talk? Call{" "}
            <a
              href="tel:8172498683"
              className="font-semibold text-primary hover:underline"
            >
              (817) 249-8683
            </a>{" "}
            or use{" "}
            <Link href="/#contact" className="font-semibold text-primary hover:underline">
              the contact form
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
