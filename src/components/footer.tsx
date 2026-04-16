import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebook,
  FaGoogle,
  FaLinkedin,
  FaYelp,
  FaYoutube,
} from "react-icons/fa";
import { PageShell } from "@/components/page-shell";
import { GOOGLE_MAPS_PLACE_URL } from "@/lib/schema";

const SERVICES = [
  { label: "Home/Auto Insurance", href: "/home-auto-insurance" },
  { label: "Commercial Insurance", href: "/commercial-insurance" },
  { label: "Life Insurance", href: "/life-insurance" },
  { label: "Performance and Bid Bonds", href: "/bonds" },
  { label: "Cyber Insurance", href: "/cyber-insurance" },
] as const;

const ABOUT = [
  { label: "Our Story", href: "/our-story" },
  { label: "Meet Our Team", href: "/about" },
  { label: "Blog", href: "/blog" },
] as const;

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/clearforkinsurance/",
    icon: FaFacebook,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/sig-clearfork-insurance-group/",
    icon: FaLinkedin,
  },
  {
    label: "Google Maps",
    href: GOOGLE_MAPS_PLACE_URL,
    icon: FaGoogle,
  },
  {
    label: "Yelp",
    href: "https://www.yelp.com/biz/sig-clearfork-insurance-group-benbrook",
    icon: FaYelp,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: FaYoutube,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#003169] text-white">
      <PageShell className="py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-5 inline-block">
              <Image
                src="/images/clearfork-logo.png"
                alt="SIG Clearfork Insurance Group"
                width={200}
                height={51}
                style={{ width: "auto", height: undefined }}
                className="h-12 brightness-0 invert sm:h-14"
              />
            </Link>
            <h3 className="mb-3 text-lg font-semibold">Clearfork Insurance Agency</h3>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/75">
              Your trusted insurance partner with decades of combined experience, providing
              comprehensive coverage for families and businesses across Texas.
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/35 text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/90">
              Insurance Services
            </h4>
            <ul className="space-y-2.5">
              {SERVICES.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/90">
              About Us
            </h4>
            <ul className="space-y-2.5">
              {ABOUT.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/90">
              Contact Info
            </h4>
            <ul className="mb-6 space-y-3 text-sm text-white/75">
              <li>
                <a
                  href="tel:8172498683"
                  className="flex items-start gap-2 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span>(817) 249-8683</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:clearfork@sig4you.com"
                  className="flex items-start gap-2 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span>clearfork@sig4you.com</span>
                </a>
              </li>
              <li>
                <a
                  href={GOOGLE_MAPS_PLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 transition-colors hover:text-white"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span className="min-w-0 flex flex-col gap-0.5 leading-snug">
                    <span className="block">992 Winscott Rd Suite B</span>
                    <span className="block">Benbrook, TX 76126</span>
                  </span>
                </a>
              </li>
            </ul>
            <Link
              href="/get-a-quote"
              className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get a Quote
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-xs text-white/60 sm:flex-row sm:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <span aria-hidden className="text-white/30">
              |
            </span>
            <span>&copy; {year} Clearfork Insurance Agency. All rights reserved.</span>
          </div>
          <a
            href="https://levelingupdata.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Powered by Leveling Up Data
          </a>
        </div>
      </PageShell>
    </footer>
  );
}
