# Clearfork Insurance (clearforkinsurance.com)

## Quick Start

```bash
npm install
npm run dev        # dev server on :3000
npm run build      # production build (standalone)
npx next start     # serve production build
```

## Environment Variables

Create `.env.local` with:

```
GEMINI_API_KEY=              # Google Generative AI (Gemini 2.0 Flash) for quote assistant
NOCODB_API_TOKEN=            # NocoDB token for quote submission storage
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=  # reCAPTCHA v3 public site key
RECAPTCHA_SECRET_KEY=        # reCAPTCHA v3 server secret
NEXT_PUBLIC_GA_ID=           # Google Analytics 4 measurement ID
GOOGLE_SITE_VERIFICATION=   # Google Search Console verification
```

## Project Structure

```
clearfork-insurance/
  src/app/                        # Next.js App Router pages
    layout.tsx                    # Root layout, GA4, reCAPTCHA script, JSON-LD
    page.tsx                      # Homepage (hero, content hub, services, contact)
    get-a-quote/page.tsx          # AI-powered quote form (23 fields, file upload)
    our-story/page.tsx            # Company story
    about/page.tsx                # 301 redirect -> /our-story
    home-auto-insurance/          # Personal lines
    commercial-insurance/         # Commercial lines
    life-insurance/               # Life insurance
    bonds/                        # Performance & bid bonds
    cyber-insurance/              # Cyber insurance
    videos/page.tsx               # Video gallery (YouTube embeds)
    podcast/page.tsx              # Podcast page
    blog/page.tsx                 # Blog index (/blog)
    blog/[slug]/page.tsx          # Blog post (MDX)
    blog/rss.xml/route.ts         # RSS feed
    privacy/page.tsx              # Privacy policy
    sitemap.ts                    # Dynamic sitemap
    robots.ts                     # robots.txt
    not-found.tsx                 # Custom 404
    api/contact/route.ts          # Contact form submission + reCAPTCHA
    api/quote-assistant/route.ts  # Gemini AI form-filling assistant
    api/quote-assistant/upload/   # Document upload + AI extraction
    api/quote-submit/route.ts     # Quote submission to NocoDB + reCAPTCHA
    api/recaptcha/route.ts        # reCAPTCHA v3 verification endpoint
  src/components/                 # Shared components
    header.tsx                    # Sticky header + mobile nav + dropdowns
    footer.tsx                    # 4-column footer, social links
    chatbot.tsx                   # "Clearbot" floating chat (Starfish agent)
    hero-section.tsx              # Full-width hero with CTAs
    services-section.tsx          # Embla carousel of 6 service cards
    about-section.tsx             # Company intro with team photo
    contact-section.tsx           # Contact form + Google Maps + reCAPTCHA
    content-hub-section.tsx       # Blog/Video/Podcast 3-column hub
    cta-section.tsx               # Navy CTA band
    quote-form.tsx                # Simple inline quote form
    page-shell.tsx                # Max-width layout container
    breadcrumbs.tsx               # Breadcrumb navigation
    ui/                           # Radix UI primitives (button, dialog, etc.)
  src/lib/
    posts.ts                      # MDX blog post loader
    schema.ts                     # JSON-LD structured data helpers
    recaptcha.ts                  # reCAPTCHA v3 server-side verification
    quote-types.ts                # Zod schema, conversation flow, field maps
    utils.ts                      # cn() helper (clsx + tailwind-merge)
  src/hooks/
    use-toast.ts                  # Toast notification hook
  src/types/
    rss.d.ts                      # Type declarations for rss module
  content/posts/*.mdx             # Blog post content
  public/images/                  # Static assets (photos, logos, SVGs)
  Dockerfile                      # Multi-stage standalone Docker build
  cloudbuild.yaml                 # Cloud Build pipeline
```

## Key Features

- **AI Quote Assistant**: Gemini 2.0 Flash-powered form filling via `/api/quote-assistant`
- **Clearbot Chatbot**: Floating chat widget calling Starfish agent (Supabase Edge Function)
- **reCAPTCHA v3**: Loaded in layout, tokens generated on both quote and contact forms
- **Quote Submission**: 23-field form with Zod validation, submitted to NocoDB
- **Document Upload**: PDF/image extraction via Gemini for auto-filling quote fields
- **Content Hub**: Blog (MDX), Videos (YouTube), Podcast pages

## Adding Blog Posts

Create `content/posts/<slug>.mdx` with frontmatter:

```yaml
---
title: "Post Title"
date: "2026-01-15"
description: "Short description for SEO"
author: "Clearfork Insurance"
tags: ["insurance", "tips"]
---
```

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 (CSS custom properties + @theme inline)
- Radix UI primitives (dialog, select, toast, tooltip, etc.)
- react-hook-form + Zod for form validation
- Embla Carousel, Framer Motion
- MDX (`next-mdx-remote` + `gray-matter`)
- Google Generative AI (Gemini 2.0 Flash)
- Docker (node:22-alpine multi-stage standalone)

## Build & Deploy

```bash
# Build Docker image
gcloud builds submit --tag us-central1-docker.pkg.dev/ludata-prod/cloud-run-source-deploy/clearfork-insurance:latest --project ludata-prod

# Deploy to Cloud Run
gcloud run deploy clearfork-insurance \
  --image us-central1-docker.pkg.dev/ludata-prod/cloud-run-source-deploy/clearfork-insurance:latest \
  --region us-central1 --project ludata-prod --allow-unauthenticated
```

## Architecture

- **GCP Project**: ludata-prod
- **Cloud Run**: clearfork-insurance (us-central1)
- **Load Balancer**: starfish-url-map (shared with starfishhealth.app)
- **LB IP**: 34.36.4.221
- **SSL**: Google-managed cert for clearforkinsurance.com + www
- **CDN**: Cloud CDN enabled on backend service
- **DNS**: GoDaddy (A record -> 34.36.4.221)

## External Services

- **NocoDB**: `data.levelingupdata.com` — quote submission storage
- **Starfish Agent**: `umesyaxnkvnpnyhvcopy.supabase.co` — chatbot knowledge base
- **Google reCAPTCHA v3**: Form spam protection
- **Google Analytics 4**: Site analytics

## SEO

- InsuranceAgency JSON-LD on every page via root layout
- Service schemas on each service page
- BlogPosting schemas on blog posts
- BreadcrumbList schemas on all interior pages
- Dynamic sitemap.xml and robots.txt
- RSS feed at /blog/rss.xml (permanent redirects from `/blogs` and `/blogs/*`)
- Per-page metadata with Open Graph and Twitter cards
- GA4 via NEXT_PUBLIC_GA_ID env var

## Brand

- **Primary blue**: hsl(210 100% 45%) — #0073E6
- **Navy**: #003169
- **Font**: Inter (Google Fonts)
- **Business**: SIG Clearfork Insurance Group
- **Phone**: (817) 249-8683
- **Email**: clearfork@sig4you.com
- **Address**: 992 Winscott Rd Suite B, Benbrook, TX 76126
