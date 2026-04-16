"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const INSURANCE_LINKS = [
  { label: "Home/Auto", href: "/home-auto-insurance" },
  { label: "Commercial", href: "/commercial-insurance" },
  { label: "Life", href: "/life-insurance" },
  { label: "Performance and Bid Bonds", href: "/bonds" },
  { label: "Cyber Insurance", href: "/cyber-insurance" },
] as const;

const ABOUT_LINKS = [
  { label: "Our Story", href: "/our-story" },
  { label: "Meet Our Team", href: "/about" },
] as const;

export function Header() {
  const pathname = usePathname();
  const isBlogPost = /^\/blog\/.+/.test(pathname ?? "");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setServicesOpen(false);
      setAboutOpen(false);
    }, 120);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  const navLinkClass =
    "text-sm font-medium text-foreground transition-colors hover:text-primary";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <PageShell
        className={cn(
          "flex items-center justify-between gap-4 py-4 lg:gap-8 lg:py-5",
        )}
      >
        <Link href="/" className="relative z-10 shrink-0">
          <Image
            src="/images/clearfork-logo.png"
            alt="SIG Clearfork Insurance Group"
            width={280}
            height={71}
            priority
            className="h-14 sm:h-[60px] lg:h-[56px]"
            style={{ width: "auto", height: undefined }}
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          <Link href="/" className={navLinkClass}>
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => {
              clearCloseTimer();
              setServicesOpen(true);
              setAboutOpen(false);
            }}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={cn(
                navLinkClass,
                "inline-flex items-center gap-1 bg-transparent",
              )}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Insurance Services
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </button>
            {servicesOpen && (
              <div
                className="absolute left-0 top-full z-50 min-w-[240px] pt-2"
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
              >
                <div className="rounded-lg border border-border bg-popover py-2 shadow-lg">
                  {INSURANCE_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => {
              clearCloseTimer();
              setAboutOpen(true);
              setServicesOpen(false);
            }}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={cn(
                navLinkClass,
                "inline-flex items-center gap-1 bg-transparent",
              )}
              aria-expanded={aboutOpen}
              aria-haspopup="true"
            >
              About
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </button>
            {aboutOpen && (
              <div
                className="absolute left-0 top-full z-50 min-w-[200px] pt-2"
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
              >
                <div className="rounded-lg border border-border bg-popover py-2 shadow-lg">
                  {ABOUT_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/blog" className={navLinkClass}>
            Blog
          </Link>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {!isBlogPost && (
            <a
              href="tel:8172498683"
              className="whitespace-nowrap text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              (817) 249-8683
            </a>
          )}
          {isBlogPost ? (
            <Link
              href="/#contact"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Subscribe to News
            </Link>
          ) : (
            <Link
              href="/get-a-quote"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get a Quote
            </Link>
          )}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </PageShell>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 ease-out lg:hidden",
          mobileOpen ? "max-h-[1000px]" : "max-h-0 border-t-0",
        )}
      >
        <PageShell className="pb-6 pt-2">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Home
            </Link>

            <div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                aria-expanded={mobileServicesOpen}
                onClick={() => setMobileServicesOpen((v) => !v)}
              >
                Insurance Services
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    mobileServicesOpen && "rotate-180",
                  )}
                />
              </button>
              {mobileServicesOpen && (
                <div className="ml-2 flex flex-col border-l border-border pl-3">
                  {INSURANCE_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                aria-expanded={mobileAboutOpen}
                onClick={() => setMobileAboutOpen((v) => !v)}
              >
                About
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    mobileAboutOpen && "rotate-180",
                  )}
                />
              </button>
              {mobileAboutOpen && (
                <div className="ml-2 flex flex-col border-l border-border pl-3">
                  {ABOUT_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/blog" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Blog
            </Link>

            {isBlogPost ? (
              <Link
                href="/#contact"
                className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Subscribe to News
              </Link>
            ) : (
              <>
                <Link
                  href="/get-a-quote"
                  className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Get a Quote
                </Link>
                <a
                  href="tel:8172498683"
                  className="mt-1 block py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  (817) 249-8683
                </a>
              </>
            )}
          </nav>
        </PageShell>
      </div>
    </header>
  );
}
