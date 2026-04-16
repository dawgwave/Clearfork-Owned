import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { GOOGLE_MAPS_PLACE_URL } from "@/lib/schema";

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3359.0!2d-97.4530557!3d32.6774231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e0d58913d6ba9%3A0xd74c505d2f0140c5!2sSIG%20Clearfork%20Insurance%20Group!5e0!3m2!1sen!2sus!4v1";

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 lg:py-24">
      <PageShell>
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <h2 className="text-3xl font-bold text-[var(--navy)] lg:text-4xl">
            Contact Us
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--slate)]">
            Ready to protect what matters most? Request your quote online, or
            reach our Benbrook team by phone or email.
          </p>
          <Link
            href="/get-a-quote"
            className="mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Get a free quote
          </Link>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ul className="space-y-5 text-sm">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-[var(--navy)]">Phone</p>
                <a
                  href="tel:8172498683"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  (817) 249-8683
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-[var(--navy)]">Email</p>
                <a
                  href="mailto:clearfork@sig4you.com"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  clearfork@sig4you.com
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-[var(--navy)]">Office</p>
                <a
                  href={GOOGLE_MAPS_PLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--slate)] underline-offset-2 transition-colors hover:text-primary hover:underline"
                >
                  992 Winscott Rd Suite B
                  <br />
                  Benbrook, TX 76126
                </a>
              </div>
            </li>
          </ul>

          <div className="overflow-hidden rounded-xl border border-[var(--mist)] shadow-sm">
            <iframe
              title="SIG Clearfork Insurance Group office location"
              src={MAP_EMBED}
              className="h-56 w-full border-0 sm:h-72 lg:min-h-[320px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </PageShell>
    </section>
  );
}
