# Clearfork Insurance — clearforkinsurance.com

Production website for **SIG Clearfork Insurance Group**, an independent insurance agency in Benbrook, TX. Built with Next.js 16, deployed on a **DigitalOcean** droplet (Docker Compose: MySQL, Next.js standalone, Caddy).

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev                         # http://localhost:3000
```

## Environment Variables

Create `.env.local` with the following:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Generative AI key (Gemini 2.0 Flash) for the quote assistant |
| `NOCODB_API_TOKEN` | Legacy NocoDB token (optional; quotes use MySQL) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 public site key |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 server secret |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification code |

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 with CSS custom properties
- **UI**: Radix UI primitives, Framer Motion, Embla Carousel
- **Forms**: react-hook-form + Zod validation
- **Blog**: MDX via `next-mdx-remote` + `gray-matter`
- **AI**: Google Generative AI (Gemini 2.0 Flash) for quote assistant
- **Runtime**: Node.js 22 (Alpine Docker image)

## Project Structure

```
src/
  app/                           # Next.js App Router pages & API routes
    layout.tsx                   # Root layout (GA4, reCAPTCHA, JSON-LD)
    page.tsx                     # Homepage
    get-a-quote/                 # Quote type selector → form & line pages
    get-auto-quote/              # AI-powered personal quote form
    our-story/                   # Company story
    about/                       # Meet Our Team
    home-auto-insurance/         # Personal lines
    commercial-insurance/        # Commercial lines
    life-insurance/              # Life insurance
    bonds/                       # Surety bonds
    cyber-insurance/             # Cyber insurance
    videos/                      # Video gallery
    podcast/                     # Podcast page
    blog/                        # Blog index + [slug] + RSS
    privacy/                     # Privacy policy
    api/contact/                 # Contact form endpoint
    api/quote-submit/            # Quote submission
    api/quote-assistant/         # Gemini AI assistant endpoint
    api/recaptcha/               # reCAPTCHA verification
    sitemap.ts                   # Dynamic sitemap.xml
    robots.ts                    # robots.txt
  components/                    # Shared React components
  lib/                           # Utilities (schema, recaptcha, posts, etc.)
content/posts/                   # Blog posts (MDX files)
public/images/                   # Static assets
Dockerfile                       # Multi-stage standalone Docker build
scripts/deploy.sh                # Production deploy to droplet (branch main)
DEPLOYMENT.md                    # Droplet setup, Caddy, firewall, DNS
```

## Build & Deploy

### Production (DigitalOcean)

From the repo root, on branch `main`, with SSH access to the droplet:

```bash
npm run build
./scripts/deploy.sh docker YOUR_DROPLET_IP
```

Details: `DEPLOYMENT.md` (Caddy on 80/443, `.env.production` on the server, MySQL in Compose). With Docker Compose, **`RUN_MIGRATIONS=true`** runs pending DB migrations in the app container before the Next.js server starts (see `scripts/docker-entrypoint.sh`).

### Local production build

```bash
npm run build        # Next.js standalone build
npx next start       # http://localhost:3000
```

## DNS (example: GoDaddy)

Point the apex (`@`) and `www` **A records** at your **production droplet’s public IPv4**. Caddy on the droplet terminates TLS (Let’s Encrypt) once DNS resolves to that host. For IP-only checks before DNS, see `DEPLOYMENT.md` (`Caddyfile.ip-only`).

## Production environment (droplet)

Configure secrets in `/opt/clearfork-insurance/.env.production` on the server (created or synced by `scripts/deploy.sh` — do not commit real values). Typical keys match `AGENTS.md` / `.env.local.example`: `JWT_SECRET`, `DB_*` or compose-aligned names, `GEMINI_API_KEY`, reCAPTCHA, `NEXT_PUBLIC_GA_ID`, etc.

## External Services

| Service | URL / Host | Purpose |
|---|---|---|
| **Google reCAPTCHA v3** | — | Form spam protection |
| **Google Analytics 4** | — | Site analytics |
| **Google Search Console** | — | SEO monitoring |

## SEO

- InsuranceAgency JSON-LD schema on every page
- Service-specific schemas on each service page
- BlogPosting schemas on blog posts
- BreadcrumbList schemas on all interior pages
- Dynamic `sitemap.xml` and `robots.txt`
- RSS feed at `/blog/rss.xml`
- Per-page metadata with Open Graph and Twitter cards
- Google Analytics 4 via `NEXT_PUBLIC_GA_ID`
- Google Search Console via `GOOGLE_SITE_VERIFICATION`

## Brand

- **Primary Blue**: `#0073E6` / hsl(210 100% 45%)
- **Navy**: `#003169`
- **Primary Green**: `#8BC53F`
- **Font**: Inter (Google Fonts)
- **Business**: SIG Clearfork Insurance Group
- **Phone**: (817) 249-8683
- **Email**: clearfork@sig4you.com
- **Address**: 992 Winscott Rd Suite B, Benbrook, TX 76126
