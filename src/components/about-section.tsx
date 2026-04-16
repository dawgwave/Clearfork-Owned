import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";

const GROUP_PHOTO = encodeURI("/images/group photo 1 (1)_1761008519000.jpg");

export default function AboutSection() {
  return (
    <section className="py-16 lg:py-24">
      <PageShell>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg lg:aspect-auto lg:min-h-[420px]">
            <Image
              src={GROUP_PHOTO}
              alt="SIG Clearfork Insurance Group team"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--navy)] lg:text-4xl">
              SIG Clearfork Insurance Group
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--slate)]">
              At SIG Clearfork Insurance Group, we know that protecting your
              family and business takes more than a policy — it takes a partner
              who listens. We combine decades of experience with a commitment to
              personal service across personal lines, commercial, life, cyber,
              and surety solutions.
            </p>
            <Link
              href="/our-story"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              Our Story
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </PageShell>
    </section>
  );
}
