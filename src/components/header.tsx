"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

const INSURANCE_LINKS = [
  { label: "Home/Auto/Umbrella", href: "/home-auto-insurance" },
  { label: "Boat/RV/ATV/Motorcycle", href: "/recreational-vehicle-insurance" },
  { label: "Commercial", href: "/commercial-insurance" },
  { label: "Life", href: "/life-insurance" },
  { label: "Performance and Bid Bonds", href: "/bonds" },
  { label: "Cyber Insurance", href: "/cyber-insurance" },
] as const;

const ABOUT_LINKS = [
  { label: "Our Story", href: "/our-story" },
  { label: "Meet Our Team", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
] as const;

const CONTENT_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Vlog", href: "/videos" },
  { label: "Podcast", href: "/podcast" },
] as const;

export function Header() {
  const pathname = usePathname();
  const isBlogPost = /^\/blog\/.+/.test(pathname ?? "");
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileContentOpen, setMobileContentOpen] = useState(false);

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
    setContentOpen(false);
    setUserMenuOpen(false);
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

          <div className="relative">
            <button
              onMouseEnter={() => {
                clearCloseTimer();
                setContentOpen(true);
              }}
              onMouseLeave={scheduleClose}
              className={cn(
                navLinkClass,
                "flex items-center gap-1",
                contentOpen && "text-primary",
              )}
            >
              Content
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  contentOpen && "rotate-180",
                )}
              />
            </button>

            {contentOpen && (
              <div
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
                className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover shadow-lg"
              >
                <div className="py-1">
                  {CONTENT_LINKS.map((l) => (
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
          ) : user && user.roles.some(role => role.name === 'admin') ? (
            <Link
              href="/admin/quotes"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Quote Requests
            </Link>
          ) : (
            <Link
              href="/get-a-quote"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get a Quote
            </Link>
          )}
          
          {/* Authentication Menu */}
          {user ? (
            <div className="relative">
              <button
                onMouseEnter={() => {
                  clearCloseTimer();
                  setUserMenuOpen(true);
                }}
                onMouseLeave={scheduleClose}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary",
                  userMenuOpen && "text-primary",
                )}
              >
                <User className="h-4 w-4" />
                {user.first_name || user.email}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    userMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {userMenuOpen && (
                <div
                  onMouseEnter={clearCloseTimer}
                  onMouseLeave={scheduleClose}
                  className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover shadow-lg"
                >
                  <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                  >
                    Profile
                  </Link>
                  {!user.roles.some(role => role.name === 'admin') && (
                    <Link
                      href="/my-quotes"
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      My Quote Requests
                    </Link>
                  )}
                  {user.roles.some(role => role.name === 'admin') && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                    <hr className="my-1" />
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Sign Up
              </Link>
            </div>
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

            <div>
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                aria-expanded={mobileContentOpen}
                onClick={() => setMobileContentOpen((v) => !v)}
              >
                Content
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    mobileContentOpen && "rotate-180",
                  )}
                />
              </button>
              {mobileContentOpen && (
                <div className="ml-2 flex flex-col border-l border-border pl-3">
                  {CONTENT_LINKS.map((l) => (
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

            {isBlogPost ? (
              <Link
                href="/#contact"
                className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Subscribe to News
              </Link>
            ) : (
              <>
                {user && user.roles.some(role => role.name === 'admin') ? (
                  <Link
                    href="/admin/quotes"
                    className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Quote Requests
                  </Link>
                ) : (
                  <Link
                    href="/get-a-quote"
                    className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Get a Quote
                  </Link>
                )}
                <a
                  href="tel:8172498683"
                  className="mt-1 block py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  (817) 249-8683
                </a>
              </>
            )}

            {/* Mobile Authentication */}
            <hr className="my-2 border-border" />
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}
                </div>
                <Link
                  href="/profile"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Profile
                </Link>
                {!user.roles.some(role => role.name === 'admin') && (
                  <Link
                    href="/my-quotes"
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    My Quote Requests
                  </Link>
                )}
                {user.roles.some(role => role.name === 'admin') && (
                  <Link
                    href="/admin"
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </PageShell>
      </div>
    </header>
  );
}
