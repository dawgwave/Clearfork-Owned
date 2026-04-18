# Clearfork Insurance — clearforkinsurance.com

Production website for **SIG Clearfork Insurance Group**, an independent insurance agency in Benbrook, TX. Built with Next.js 16, deployed on Google Cloud Run.

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
| `NOCODB_API_TOKEN` | NocoDB API token for quote submission storage |
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
    get-a-quote/                 # AI-powered quote form
    our-story/                   # Company story
    about/                       # Meet Our Team
    home-auto-insurance/         # Personal lines
    commercial-insurance/        # Commercial lines
    life-insurance/              # Life insurance
    bonds/                       # Surety bonds
    cyber-insurance/             # Cyber insurance
    videos/                      # Video gallery
    podcast/                     # Podcast page
    blogs/                       # Blog index + [slug] + RSS
    privacy/                     # Privacy policy
    api/contact/                 # Contact form endpoint
    api/quote-submit/            # Quote submission to NocoDB
    api/quote-assistant/         # Gemini AI assistant endpoint
    api/recaptcha/               # reCAPTCHA verification
    sitemap.ts                   # Dynamic sitemap.xml
    robots.ts                    # robots.txt
  components/                    # Shared React components
  lib/                           # Utilities (schema, recaptcha, posts, etc.)
content/posts/                   # Blog posts (MDX files)
public/images/                   # Static assets
Dockerfile                       # Multi-stage standalone Docker build
cloudbuild.yaml                  # Cloud Build CI/CD pipeline
```

## Build & Deploy

### Automatic (CI/CD)

A **Cloud Build trigger** (`clearfork-insurance-deploy`) runs on every push to `main`:

1. Builds the Docker image
2. Pushes to Artifact Registry (`us-central1-docker.pkg.dev/ludata-prod/cloud-run-source-deploy/clearfork-insurance`)
3. Deploys to Cloud Run

No manual steps required — just push to `main`.

### Manual Deploy

```bash
# Option 1: Trigger full pipeline via Cloud Build
gcloud builds submit --config=cloudbuild.yaml --project=ludata-prod \
  --substitutions=SHORT_SHA=$(git rev-parse --short HEAD)

# Option 2: Build and deploy separately
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/ludata-prod/cloud-run-source-deploy/clearfork-insurance:latest \
  --project ludata-prod

gcloud run deploy clearfork-insurance \
  --image us-central1-docker.pkg.dev/ludata-prod/cloud-run-source-deploy/clearfork-insurance:latest \
  --region us-central1 --project ludata-prod --allow-unauthenticated
```

### Local Production Build

```bash
npm run build        # Next.js standalone build
npx next start       # http://localhost:3000
```

## GCP Architecture

| Component | Details |
|---|---|
| **GCP Project** | `ludata-prod` |
| **Cloud Run Service** | `clearfork-insurance` (us-central1) |
| **Cloud Build Trigger** | `clearfork-insurance-deploy` — auto-deploys on push to `main` |
| **Load Balancer** | `clearfork-url-map` |
| **Static IP** | `34.36.4.221` |
| **SSL** | Google-managed cert for `clearforkinsurance.com` + `www` |
| **CDN** | Cloud CDN enabled on backend service |
| **Artifact Registry** | `us-central1-docker.pkg.dev/ludata-prod/cloud-run-source-deploy` |

## DNS Configuration (GoDaddy)

The domain `clearforkinsurance.com` is managed at GoDaddy. Required DNS records:

| Type | Name | Value |
|---|---|---|
| **A** | `@` | `34.36.4.221` |
| **CNAME** | `www` | `clearforkinsurance.com` |

These point to the GCP global load balancer, which routes traffic to Cloud Run and terminates SSL via the Google-managed certificate.

## Cloud Run Environment Variables

Set these on the Cloud Run service (via Console or CLI):

```bash
gcloud run services update clearfork-insurance \
  --region us-central1 --project ludata-prod \
  --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=...,NOCODB_API_TOKEN=...,NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...,RECAPTCHA_SECRET_KEY=...,NEXT_PUBLIC_GA_ID=...,GOOGLE_SITE_VERIFICATION=..."
```

## External Services

| Service | URL / Host | Purpose |
|---|---|---|
| **NocoDB** | `data.levelingupdata.com` | Quote submission storage |
| **Google reCAPTCHA v3** | — | Form spam protection |
| **Google Analytics 4** | — | Site analytics |
| **Google Search Console** | — | SEO monitoring |

## Adding Blog Posts

Create `content/posts/<slug>.mdx`:

```yaml
---
title: "Post Title"
date: "2026-01-15"
description: "Short description for SEO"
author: "Clearfork Insurance"
tags: ["insurance", "tips"]
---

Your markdown content here...
```

The post will appear in the blog index, sitemap, and RSS feed automatically.

## SEO

- InsuranceAgency JSON-LD schema on every page
- Service-specific schemas on each service page
- BlogPosting schemas on blog posts
- BreadcrumbList schemas on all interior pages
- Dynamic `sitemap.xml` and `robots.txt`
- RSS feed at `/blogs/rss.xml`
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
