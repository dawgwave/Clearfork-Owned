import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function CtaSection() {
  return (
    <section className="bg-[#003169] py-16 text-white lg:py-20">
      <PageShell>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Ready to get the right coverage?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/90 lg:text-lg">
            No commitment. Free quote in minutes. Local agents who know Fort Worth.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/get-a-quote"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#003169] shadow-md transition hover:bg-white/95"
            >
              Get your free quote
            </Link>
            <a
              href="tel:8172498683"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/70 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-[2px] transition hover:border-white hover:bg-white/10"
            >
              Call (817) 249-8683
            </a>
          </div>
        </div>
      </PageShell>
    </section>
  );
}
