"use client";

import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const BACKDROP = encodeURI("/images/backdrop photo_1761008288886.jpg");

const TRUST_ITEMS = [
  "Independent agency",
  "Multiple carriers compared",
  "Fort Worth locals",
] as const;

export default function HeroSection() {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        "h-[580px] sm:h-[640px] lg:h-[720px]",
      )}
    >
      <Image
        src={BACKDROP}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-[var(--navy-dark)]/75"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#8BC53F]/25 via-transparent to-[var(--navy)]/50"
        aria-hidden
      />
      <div className="relative z-10 flex h-full items-center pb-8 pt-10 sm:pb-10 sm:pt-12">
        <PageShell>
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 sm:text-[13px]">
              Fort Worth&apos;s local insurance team
            </p>
            <h1 className="mx-auto max-w-[34rem] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-snug">
              Insurance that actually protects what matters to you
            </h1>
            <p className="mx-auto mt-5 max-w-[29rem] text-base leading-relaxed text-white/90 sm:text-lg">
              Home, auto, commercial, life — we find you the right coverage at the right price.
              Local agents. Real advice. No runaround.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/get-a-quote"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
              >
                Get your free quote
              </Link>
              <a
                href="tel:8172498683"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/70 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-[2px] transition hover:border-white hover:bg-white/10"
              >
                Call us: (817) 249-8683
              </a>
            </div>

            <div
              className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-left sm:mt-10"
              aria-label="Why choose us"
            >
              {TRUST_ITEMS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-xs text-white/80 sm:text-sm"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-8 text-sm">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-medium text-white/90 underline-offset-4 transition hover:text-white hover:underline"
              >
                View our services
              </button>
            </p>
          </div>
        </PageShell>
      </div>
    </section>
  );
}
