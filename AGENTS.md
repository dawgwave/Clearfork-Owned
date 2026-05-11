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
# Authentication
JWT_SECRET=                 # Secret key for JWT token generation (required)
JWT_EXPIRES_IN=7d          # JWT token expiration time

# OAuth (Sign in with Google / Apple via NextAuth — optional; omit to hide buttons)
NEXTAUTH_URL=http://localhost:3000   # Production: https://clearforkinsurance.com (must match public URL)
NEXTAUTH_SECRET=                     # Random secret for NextAuth JWT (required if using OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_ID=                            # Apple Services ID (Sign in with Apple)
APPLE_SECRET=                        # Client secret JWT from Apple (see Apple developer docs)

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=clearfork-insurance
DB_USERNAME=clearfork_user
DB_PASSWORD=               # MySQL password for clearfork_user (required)

# Google Services
GEMINI_API_KEY=            # Google Generative AI (Gemini 2.0 Flash) for quote assistant
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=  # reCAPTCHA v3 public site key
RECAPTCHA_SECRET_KEY=      # reCAPTCHA v3 server secret
NEXT_PUBLIC_GA_ID=         # Google Analytics 4 measurement ID
GOOGLE_SITE_VERIFICATION= # Google Search Console verification

# Legacy (can be removed after migration)
NOCODB_API_TOKEN=          # NocoDB token (replaced by MySQL)
```

## Project Structure

```
clearfork-insurance/
  src/app/                        # Next.js App Router pages
    layout.tsx                    # Root layout, GA4, reCAPTCHA script, JSON-LD, AuthProvider
    page.tsx                      # Homepage (hero, content hub, services, contact)
    get-a-quote/page.tsx          # Quote entry: choose line (links to /get-*-quote + /get-auto-quote)
    get-auto-quote/page.tsx       # Full personal auto/home form (23 fields, file upload) → quote_type `auto`
    get-home-quote/ … get-cyber-quote/ # One page per line; short form → `details_json` + `quote_type`
    login/page.tsx                # User login page
    register/page.tsx             # User registration page
    profile/page.tsx              # User profile management
    admin/page.tsx                # Admin dashboard (role-protected)
    our-story/page.tsx            # Company story
    about/page.tsx                # 301 redirect -> /our-story
    home-auto-insurance/          # Personal lines
    recreational-vehicle-insurance/page.tsx # Boat/RV/ATV/Motorcycle insurance
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
    api/auth/register/route.ts    # User registration API
    api/auth/login/route.ts       # User login API
    api/auth/logout/route.ts      # User logout API
    api/auth/me/route.ts          # Get current user info API
    api/contact/route.ts          # Contact form submission + reCAPTCHA
    api/quote-assistant/route.ts  # Gemini AI form-filling assistant
    api/quote-assistant/upload/   # Document upload + AI extraction
    api/quote-submit/route.ts     # Quote submission to MySQL + reCAPTCHA
    api/recaptcha/route.ts        # reCAPTCHA v3 verification endpoint
  src/components/                 # Shared components
    header.tsx                    # Sticky header + mobile nav + dropdowns + auth menu
    footer.tsx                    # 4-column footer, social links
    hero-section.tsx              # Full-width hero with CTAs
    services-section.tsx          # Embla carousel of 6 service cards
    about-section.tsx             # Company intro with team photo
    contact-section.tsx           # Contact form + Google Maps + reCAPTCHA
    content-hub-section.tsx       # Blog/Video/Podcast 3-column hub
    cta-section.tsx               # Navy CTA band
    quote-form.tsx                # Simple inline quote form
    page-shell.tsx                # Max-width layout container
    breadcrumbs.tsx               # Breadcrumb navigation
    auth/                         # Authentication components
      auth-provider.tsx           # Authentication context provider
      login-form.tsx              # Login form component
      register-form.tsx           # Registration form component
    ui/                           # Radix UI primitives (button, dialog, card, etc.)
  src/lib/
    posts.ts                      # MDX blog post loader
    schema.ts                     # JSON-LD structured data helpers
    recaptcha.ts                  # reCAPTCHA v3 server-side verification
    quote-types.ts                # Zod schema, conversation flow, field maps
    auth.ts                       # Authentication utilities (bcrypt, JWT, user management)
    auth-middleware.ts            # Authentication middleware for API routes
    database.ts                   # MySQL connection utilities
    migrations.ts                 # Database migration system
    utils.ts                      # cn() helper (clsx + tailwind-merge)
  src/hooks/
    use-toast.ts                  # Toast notification hook
  src/types/
    rss.d.ts                      # Type declarations for rss module
  content/posts/*.mdx             # Blog post content
  migrations/                     # Database migration files
    20260419_160000_create_auth_tables.sql # User, role, session tables
  scripts/
    migrate.ts                    # Migration CLI script
    migrate-package.json          # Minimal deps for Docker /migrate bundle
    docker-entrypoint.sh          # Runs migrations then node server.js (Docker)
  public/images/                  # Static assets (photos, logos, SVGs)
  Dockerfile                      # Multi-stage standalone Docker build
  scripts/deploy.sh               # Production deploy (Docker on droplet, branch main)
```

## Key Features

- **User Authentication**: JWT-based authentication with role-based access control
- **User Registration/Login**: Secure account creation and authentication
- **Admin Dashboard**: Role-protected admin interface for system management
- **MySQL Database**: Local MySQL database with migration system
- **AI Quote Assistant**: Gemini 2.0 Flash-powered form filling via `/api/quote-assistant`
- **reCAPTCHA v3**: Loaded in layout, tokens generated on registration, login, quotes, and contact forms
- **Quote Submission**: 23-field form with Zod validation, submitted to MySQL
- **Document Upload**: PDF/image extraction via Gemini for auto-filling quote fields
- **Content Hub**: Blog (MDX), Videos (YouTube), Podcast pages

## Authentication System

The application includes a complete authentication system with:

### Database Schema
- **users**: User accounts with email, password (bcrypt), name, phone
- **roles**: Flexible role system with JSON permissions
- **user_roles**: Many-to-many relationship for role assignments
- **sessions**: JWT session management

### Default Roles
- **user**: Regular users (quote creation, profile management)
- **admin**: Administrators (full system access)
- **agent**: Insurance agents (quote management, client access)

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Protected Routes
- `/profile` - User profile (requires authentication)
- `/admin` - Admin dashboard (requires admin role)
- Future admin features will use role-based middleware

### Usage Example
```typescript
import { useAuth } from "@/components/auth/auth-provider";

function MyComponent() {
  const { user, hasRole, hasPermission } = useAuth();
  
  if (hasRole('admin')) {
    // Admin-only content
  }
  
  if (hasPermission('quotes', 'create')) {
    // User can create quotes
  }
}
```

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
- Radix UI primitives (dialog, select, toast, tooltip, card, label, etc.)
- react-hook-form + Zod for form validation
- Embla Carousel, Framer Motion
- MDX (`next-mdx-remote` + `gray-matter`)
- **Authentication**: JWT tokens, bcryptjs, role-based access control
- **Database**: MySQL with mysql2, custom migration system
- Google Generative AI (Gemini 2.0 Flash)
- Docker (node:22-alpine multi-stage standalone)

## Build & Deploy

Production uses a **DigitalOcean droplet** with Docker Compose (MySQL, Next.js app, Caddy). See `DEPLOYMENT.md` for firewall, DNS, and first-time setup.

Docker images use **`scripts/docker-entrypoint.sh`**: when `RUN_MIGRATIONS=true` (default in `docker-compose.yml`), the container applies pending SQL from `migrations/` before starting `server.js`. Migrations run from an isolated `/migrate` dependency bundle so the Next.js standalone `node_modules` tree is unchanged.

```bash
npm run build

# Production (set DROPLET_IP or pass as arg)
./scripts/deploy.sh docker YOUR_DROPLET_IP
```

## Architecture

- **Hosting**: DigitalOcean droplet(s), Docker Compose (`docker-compose.yml`, Caddy reverse proxy)
- **DNS**: Point `clearforkinsurance.com` (and `www`) A records at the production droplet’s public IP; Caddy obtains Let’s Encrypt certificates when DNS is correct

## External Services

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
