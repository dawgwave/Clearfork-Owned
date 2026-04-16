# Port handoff: replicate Clearfork site behavior in another Next.js app

Give this document to the coding agent **plus the absolute path** to **this** repository on disk (the Sig Clearfork / `Sig-Clearfork-Insurance-Group` repo). The agent should read files from that path and implement the same behavior in the **target** Next.js website.

---

## Role of the source repo

- **Source of truth for UI and behavior:** the `client/` app (Vite + React + Wouter) and any shared code it uses.
- The target site is **Next.js (App Router)**. The goal is **matching pages and URLs**, not necessarily copying the Vite/Express tooling.
- If the target repo already has a `web/` Next app colocated in the source repo, treat **`client/src` + that Next wiring** as reference; if the target is a **separate** repo, **copy or mirror** the pieces listed below into the target project structure.

**Placeholder for the human:** replace `SOURCE_REPO` below with the actual path (e.g. `C:\Users\...\Sig-Clearfork-Insurance-Group`).

---

## What the target site is missing (verify and implement)

1. **Get a quote** — Full page at **`/get-a-quote`** (form, validations, file upload, quote assistant modal), aligned with the source implementation.
2. **Blog** — Listing at **`/blog`** and post detail at **`/blog/:slug`** using the same slugs and content model as source.
3. **Videos** — Page at **`/videos`** with the same structure and video entries as source.
4. **Home “content hub”** — Buttons **“Explore our blog.”** and **“Explore all videos.”** (and podcast if applicable) must navigate to **`/blog`**, **`/videos`**, **`/podcast`** respectively—not placeholder or wrong paths.

---

## Required URL map (must match)

| Path | Behavior |
|------|----------|
| `/get-a-quote` | Quote page (full feature parity with source). |
| `/blog` | Blog listing. |
| `/blog/<slug>` | Single post (slugs defined in source data). |
| `/videos` | Videos page. |
| `/podcast` | Podcast hub (if the home section links to it). |

---

## Primary files to read in the source repo (`SOURCE_REPO`)

Start from these paths relative to repo root:

- **Routes reference (all paths):** `client/src/App.tsx`
- **Get a quote page:** `client/src/pages/get-a-quote.tsx`
- **Quote assistant:** `client/src/components/quote-assistant/` (entire folder, especially `assistant-modal.tsx`)
- **Form schema / types:** `client/src/lib/quote-types.ts` (and any files it imports)
- **Blog:** `client/src/pages/blog.tsx`, `client/src/pages/blog-post.tsx`, `client/src/data/blog-posts.ts`
- **Videos:** `client/src/pages/videos.tsx`
- **Home content hub (explore links):** `client/src/components/content-hub-section.tsx` — confirm `exploreHref` values `/blog`, `/videos`, `/podcast`
- **Global chrome:** `client/src/components/header.tsx`, `client/src/components/footer.tsx` (Get a quote link should target `/get-a-quote`)

**Dependency rule:** Any file imported by the pages above must be satisfied in the target app (UI components under `client/src/components/ui/`, `page-shell`, hooks like `use-toast`, utilities, assets). Prefer copying the minimal subtree until the target builds, rather than stubbing.

**Assets:** Source uses `@assets` (see `vite.config.ts` / path aliases) pointing at `attached_assets/` (or equivalent). Copy or remap images the blog/videos/home pages need.

---

## Backend / API (required for Get a quote + assistant)

The source client calls these **relative** paths:

- `POST /api/quote-assistant`
- `POST /api/quote-assistant/upload`
- `POST /api/quote-submit`

Implement **one** of the following in the **target** Next app:

- **Rewrite / proxy** in `next.config` so `/api/*` forwards to the existing Express (or other) server that already implements these routes in the source monorepo; **or**
- Duplicate the route handlers in Next (`app/api/...`) with the same request/response contract and env vars.

Without this, the quote page may render but **submit and assistant will fail**.

---

## Next.js integration notes for the agent

1. **Client components:** Pages that use hooks or browser APIs need the `"use client"` directive at the top of the **Next** entry file (or the re-exported module).
2. **Routing:** Replace **Wouter** `Link` / `useLocation` / dynamic routes with **Next.js** `next/link`, `usePathname`, `useParams` (from `next/navigation`) as appropriate.
3. **App Router mapping (example):**
   - `app/get-a-quote/page.tsx` → renders the ported Get a quote page component.
   - `app/blog/page.tsx` → blog listing.
   - `app/blog/[slug]/page.tsx` → post detail; pass `slug` into the ported post component if it does not read params internally.
   - `app/videos/page.tsx` → videos page.
4. **Providers:** Source wraps the app with **TanStack Query** (`QueryClientProvider`), **TooltipProvider**, and **Toaster** — mirror `client/src/App.tsx` provider stack in the target `app/layout.tsx` (or a `providers.tsx` client wrapper).
5. **Styling:** Source uses **Tailwind** + shared CSS variables / `cn` helper — align Tailwind content paths and globals so ported components look correct.

---

## Environment

- Inspect **`SOURCE_REPO/.env`** (and server env) for any variables used by quote/assistant/upload (API keys, base URLs, etc.). Replicate only what is safe and documented; do not commit secrets.

---

## Verification checklist (target site)

- [ ] `/get-a-quote` matches source behavior (form, validation, upload UI, assistant).
- [ ] `/blog` and `/blog/<slug>` match source posts and navigation.
- [ ] Home “Explore our blog” → `/blog`; “Explore all videos” → `/videos`.
- [ ] Header “Get a quote” → `/get-a-quote`.
- [ ] `/api/quote-assistant`, `/api/quote-assistant/upload`, `/api/quote-submit` succeed end-to-end (or are correctly proxied).

---

## One-line instruction for the agent

**Read `SOURCE_REPO` at the paths in this document, port the listed pages and dependencies into the target Next.js App Router using the URL map above, swap Wouter for Next navigation, and wire `/api/quote-*` via rewrites or equivalent handlers.**

---

*This file lives in the source repo under `docs/NEXTJS_SITE_PORT_HANDOFF.md` so it stays versioned with the implementation it describes.*
