import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Meet Our Team",
  description:
    "Meet the experienced team at SIG Clearfork Insurance Group — over 90 years of combined insurance expertise serving Benbrook and the greater Fort Worth area.",
  alternates: { canonical: "https://clearforkinsurance.com/about" },
};

const TEAM = [
  {
    name: "Sid Hargrove",
    title: "Owner / CEO",
    photo: "/images/sid hargrove headshot_1761004385331.jpg",
    bio: [
      "Sid Hargrove founded Clearfork Insurance in 2012 after building an extraordinary career spanning over 45 years in the insurance industry. He began his journey with Farmers Insurance, where he spent decades honing his expertise in both personal and commercial lines, earning numerous awards and building a reputation for integrity and client-first service.",
      "When Sid launched SIG Clearfork Insurance Group, he brought with him a deep understanding of the insurance landscape and an unwavering commitment to treating every client like family. Under his leadership, Clearfork has grown from a small local agency into a trusted partner for families and businesses throughout Benbrook and the greater DFW metroplex.",
      "Sid\u2019s philosophy is simple: insurance should be personal, transparent, and built on trust. That belief drives every decision at Clearfork and has earned the agency loyal clients who have trusted Sid and his team for decades.",
    ],
  },
  {
    name: "David Hargrove",
    title: "Owner / Vice President",
    photo: "/images/david hargrove head shot_1761004385331.jpg",
    bio: [
      "David Hargrove joined SIG Clearfork Insurance Group in 2017, bringing with him a diverse professional background that includes REO asset management, property management, and business development. His experience managing complex real estate portfolios gave him a unique perspective on risk management and the critical role insurance plays in protecting valuable assets.",
      "As Vice President, David focuses on business development, strategic partnerships, and expanding Clearfork\u2019s commercial insurance offerings. He works closely with business owners to understand their unique risks and craft comprehensive coverage solutions that protect their livelihoods.",
      "David\u2019s hands-on approach and genuine interest in his clients\u2019 success have made him an invaluable part of the Clearfork team. He is passionate about helping local businesses grow with confidence, knowing they have the right insurance protection in place.",
    ],
  },
  {
    name: "Alecia Middleton",
    title: "Licensed Renewal Agent",
    photo: "/images/alecia middleton headshot_1761004385330.jpg",
    bio: [
      "Alecia Middleton\u2019s insurance career began in 1985 when she joined GEICO, where she developed a strong foundation in personal lines underwriting and customer service. In 1995, she transitioned to Farmers Insurance, spending nearly two decades deepening her expertise across a wide range of insurance products.",
      "When Clearfork Insurance was founded in 2012, Alecia was among the first to join the team. As a Licensed Renewal Agent, she is the primary point of contact for existing clients, ensuring their policies stay current, competitive, and aligned with their evolving needs.",
      "With nearly four decades of experience, Alecia brings a rare combination of deep product knowledge and genuine warmth to every interaction. Her clients appreciate her proactive approach — she doesn\u2019t just renew policies, she reviews them to make sure every client has the best coverage at the best price.",
    ],
  },
  {
    name: "Leslie Dolman",
    title: "Licensed Bridge Agent",
    photo: "/images/leslie dolman headshot_1761004385329.jpg",
    bio: [
      "Leslie Dolman brings a creative and detail-oriented perspective to the Clearfork team. Before entering the insurance industry, she built a successful career in the architectural and design field, where precision, problem-solving, and client communication were essential daily skills.",
      "Leslie joined Clearfork Insurance in 2019 as a Licensed Bridge Agent, serving as the vital link between new clients and the coverage they need. She excels at guiding first-time insurance buyers through the process, explaining complex policies in plain language, and ensuring a seamless onboarding experience.",
      "Her background in design gives her a unique ability to see the big picture while never losing sight of the details — a quality that translates perfectly to helping clients build comprehensive insurance portfolios that truly protect what matters most.",
    ],
  },
  {
    name: "Kelli Bahner",
    title: "Licensed Producing Agent",
    photo: "/images/kelli bhaner head shot_1761004385330.jpg",
    bio: [
      "Kelli Bahner\u2019s path to insurance is one of the most unique on the Clearfork team. She holds a Master\u2019s degree in Flute Performance and spent years as a professional musician and music educator before discovering her passion for helping people protect their families and assets.",
      "Kelli entered the insurance industry in 2022 and quickly earned her producer\u2019s license. She joined SIG Clearfork Insurance Group in 2023 as a Licensed Producing Agent, where she focuses on writing new business across personal and commercial lines.",
      "Her background in music instilled discipline, attention to detail, and the ability to connect with people on a personal level — qualities that make her an exceptional insurance agent. Kelli is known for her enthusiasm, her thorough approach to coverage analysis, and her genuine commitment to finding the right policy for every client.",
    ],
  },
];

export default function AboutPage() {
  const schema = breadcrumbSchema([
    { name: "Home", url: "https://clearforkinsurance.com/" },
    { name: "Meet Our Team", url: "https://clearforkinsurance.com/about" },
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
            items={[
              { label: "Home", href: "/" },
              { label: "Meet Our Team" },
            ]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Meet Our Team
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            With over 90 years of combined experience, the Clearfork team brings
            deep industry knowledge, personal attention, and a genuine
            commitment to every client we serve.
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="space-y-16">
            {TEAM.map((member, idx) => (
              <div
                key={member.name}
                className={`flex flex-col items-center gap-8 md:flex-row ${
                  idx % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="shrink-0">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={192}
                    height={192}
                    className="h-48 w-48 rounded-full object-cover shadow-lg"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {member.name}
                  </h2>
                  <p className="mb-4 text-lg font-medium text-primary">
                    {member.title}
                  </p>
                  {member.bio.map((paragraph, i) => (
                    <p
                      key={i}
                      className="mb-3 text-sm leading-relaxed text-muted-foreground last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Ready to Work with Our Expert Team?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Let our experienced agents help you find the perfect coverage for
            your family or business.
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
