"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { BLOG_POSTS_DETAIL, type BlogCategory } from "@/data/blog-posts";

type BlogFilter = BlogCategory | "All";

type BlogPost = {
  id: string;
  slug: string;
  date: string;
  category: Exclude<BlogCategory, "All">;
  title: string;
  excerpt: string;
  author: string;
  imageSrc: string;
  href: string;
};

const BLOG_POSTS: BlogPost[] = BLOG_POSTS_DETAIL.map((p, i) => ({
  id: String(i + 1),
  slug: p.slug,
  date: p.date,
  category: p.category,
  title: p.title,
  excerpt: p.excerpt,
  author: p.author,
  imageSrc: p.imageSrc,
  href: `/blog/${p.slug}`,
}));

const CATEGORY_ORDER: BlogCategory[] = [
  "Home & Auto",
  "Commercial",
  "Life",
  "Cyber",
  "Performance",
];

const CATEGORIES: BlogFilter[] = [
  "All",
  ...CATEGORY_ORDER.filter((c) => BLOG_POSTS_DETAIL.some((p) => p.category === c)),
];

const POSTS_PER_PAGE = 9;

function BlogHero() {
  return (
    <section className="relative isolate w-full bg-[#003169]" aria-label="Blog hero">
      <img
        src={encodeURI("/images/blog-hero.png")}
        alt="Insurance News and Insights"
        className="h-full min-h-[280px] w-full object-cover object-center sm:min-h-[320px]"
      />
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-[220px] overflow-hidden rounded-t-2xl">
        <Image src={post.imageSrc} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <time className="text-sm text-[#6B7280]" dateTime={post.date}>
            {post.date}
          </time>
          <span className="rounded bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#4B5162]">
            {post.category}
          </span>
        </div>
        <h2 className="mt-3 line-clamp-2 text-xl font-semibold text-[#0A0A0A]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-[15px] leading-[22px] text-[#6B7280]">{post.excerpt}</p>
        <p className="mt-3 text-sm text-[#6B7280]">{post.author}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Link
            href={post.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View Post
          </Link>
          <Link
            href={post.href}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label={`View ${post.title}`}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<BlogFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let list = BLOG_POSTS;
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <BlogHero />

      <section className="py-12 lg:py-16">
        <PageShell>
          <div className="mb-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full shrink-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <p className="py-12 text-center text-[#6B7280]">No posts match your filters.</p>
          )}

          {filteredPosts.length > 0 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Blog pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-[#6B7280] hover:text-foreground disabled:opacity-50"
              >
                ‹ Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCurrentPage(n)}
                  className={`h-10 w-10 rounded-full text-sm font-medium transition-colors ${
                    currentPage === n
                      ? "bg-primary text-white"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-[#6B7280] hover:text-foreground disabled:opacity-50"
              >
                Next ›
              </button>
            </nav>
          )}
        </PageShell>
      </section>
    </div>
  );
}
