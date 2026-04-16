"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import {
  BadgeDollarSign,
  Building,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Monitor,
  Ship,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 3200;

const SERVICES = [
  {
    title: "Home & Auto",
    intro:
      "Protect your home, car, and valuables — bundled for savings or separately, your call.",
    href: "/home-auto-insurance",
    icon: Home,
    coverages: [
      "Homeowners & renters",
      "Auto & umbrella",
      "Boat, RV & motorcycle",
      "Personal liability",
    ],
  },
  {
    title: "Commercial",
    intro:
      "General liability, property, workers' comp, cyber — we cover Fort Worth businesses of every size.",
    href: "/commercial-insurance",
    icon: Building,
    coverages: [
      "General liability",
      "Commercial property",
      "Commercial auto",
      "Workers' compensation",
    ],
  },
  {
    title: "Marine & Watercraft",
    intro:
      "Boats, yachts, and watercraft — liability, equipment, and seasonal options so you're covered on the water and off.",
    href: "/home-auto-insurance",
    icon: Ship,
    coverages: [
      "Boat & yacht coverage",
      "Watercraft liability",
      "Equipment & trailers",
      "Seasonal & year-round options",
    ],
  },
  {
    title: "Life Insurance",
    intro:
      "Term life, whole life, surety bonds — built around your family's future and your business requirements.",
    href: "/life-insurance",
    icon: Heart,
    coverages: [
      "Term & whole life",
      "Universal life",
      "Key person coverage",
      "Business & estate planning",
    ],
  },
  {
    title: "Cyber Insurance",
    intro:
      "Data breach response, ransomware, and business interruption — modern protection when digital risk becomes real.",
    href: "/cyber-insurance",
    icon: Monitor,
    coverages: [
      "Data breach response",
      "Business interruption",
      "Cyber extortion",
      "Third-party liability",
    ],
  },
  {
    title: "Performance & Bid Bonds",
    intro:
      "Surety bonds — built around your business requirements when contracts call for bid, performance, or payment guarantees.",
    href: "/bonds",
    icon: BadgeDollarSign,
    coverages: [
      "Bid & performance bonds",
      "Payment & maintenance",
      "Contract surety",
      "Fast turnaround",
    ],
  },
] as const;

export default function ServicesSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [paused, setPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || paused) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, paused]);

  return (
    <section
      id="services"
      className="bg-primary py-16 text-primary-foreground lg:py-24"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <PageShell>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.07em] text-primary-foreground/75">
              What we cover
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
              One agency for all your coverage needs
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/90">
              We work with multiple top-rated carriers so you get options — not
              just whatever one company sells.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={scrollPrev}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 transition hover:bg-white/20"
                aria-label="Previous services"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 transition hover:bg-white/20"
                aria-label="Next services"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y gap-4">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className={cn(
                      "min-w-0 flex-[0_0_85%] sm:flex-[0_0_55%] lg:flex-[0_0_42%]",
                    )}
                  >
                    <article
                      className={cn(
                        "flex h-full min-h-[440px] flex-col rounded-lg bg-white p-6 shadow-lg",
                        "text-foreground",
                      )}
                    >
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <h3 className="text-xl font-bold text-[var(--navy)]">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
                        {s.intro}
                      </p>
                      <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--slate)]">
                        {s.coverages.map((c) => (
                          <li key={c} className="flex gap-2">
                            <span className="text-primary">✓</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={s.href}
                        className="mt-6 inline-flex w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        Learn More
                      </Link>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  );
}
