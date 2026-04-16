import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Learn about SIG Clearfork Insurance Group — 90 years of combined experience serving Benbrook, TX and the greater DFW area.",
  alternates: { canonical: "https://clearforkinsurance.com/our-story" },
};

export default function OurStoryPage() {
  const schema = breadcrumbSchema([
    { name: "Home", url: "https://clearforkinsurance.com/" },
    { name: "Our Story", url: "https://clearforkinsurance.com/our-story" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Our Story
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A legacy of trust, service, and community — built over decades of
            protecting families and businesses across the DFW metroplex.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/images/group photo 3_1761008420820.jpg"
              alt="The Clearfork Insurance team"
              width={960}
              height={540}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          <div className="prose max-w-none">
            <h2>How It All Started</h2>
            <p>
              SIG Clearfork Insurance Group was founded in 2012 by Sid Hargrove,
              a veteran insurance professional with over 45 years of experience.
              After building a distinguished career with Farmers Insurance, Sid
              saw an opportunity to create something different — an agency built
              on genuine relationships, transparent advice, and a deep
              commitment to the Benbrook community.
            </p>
            <p>
              From day one, Clearfork was designed to be the kind of agency
              where clients feel like family. Sid assembled a team of
              experienced, licensed professionals who share his passion for
              personalized service and his belief that insurance should never be
              a one-size-fits-all proposition.
            </p>

            <h2>90 Years of Combined Experience</h2>
            <p>
              Today, the Clearfork team brings together over 90 years of
              combined insurance experience. Our agents have worked across every
              major segment of the industry — personal lines, commercial
              insurance, life insurance, surety bonds, and cyber coverage. That
              breadth of expertise means we can handle virtually any insurance
              need under one roof.
            </p>
            <p>
              We work with top-rated carriers to shop your coverage and find the
              right balance of protection and affordability. Whether you&apos;re
              insuring your first home, protecting a growing business, or
              securing a performance bond for a construction project, our team
              has the knowledge and carrier relationships to deliver results.
            </p>

            <h2>Rooted in Community</h2>
            <p>
              Clearfork Insurance is proudly locally owned and operated in
              Benbrook, Texas. We&apos;re not just an insurance agency — we&apos;re
              neighbors, community members, and active supporters of the
              families and businesses that make this area special. Our office on
              Winscott Road has been a fixture of the Benbrook community for
              over a decade.
            </p>
            <p>
              We believe that strong communities are built on strong
              relationships. That&apos;s why we take the time to get to know every
              client personally, understand their unique needs, and provide
              ongoing support — not just at policy renewal, but whenever they
              need us.
            </p>

            <h2>The Clearfork Difference</h2>
            <ul>
              <li>Over 90 years of combined experience in insurance</li>
              <li>Locally owned and operated in Benbrook, TX since 2012</li>
              <li>Personalized service from dedicated, licensed agents</li>
              <li>
                Comprehensive coverage across personal, commercial, life, bonds,
                and cyber
              </li>
              <li>Strong relationships with top-rated insurance carriers</li>
              <li>
                We advocate for you during the claims process from start to
                finish
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Experience the Clearfork Difference
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join the families and businesses who have trusted us for over a
            decade with their insurance needs.
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
