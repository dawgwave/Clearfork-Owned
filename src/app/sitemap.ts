import type { MetadataRoute } from "next";
import { BLOG_POSTS_DETAIL } from "@/data/blog-posts";
import { SITE_URL } from "@/lib/schema";

/** Indexable marketing pages (App Router). Blog post URLs are appended from BLOG_POSTS_DETAIL. */
const STATIC_PAGES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/home-auto-insurance", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/commercial-insurance", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/life-insurance", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/bonds", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/cyber-insurance", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/our-story", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-a-quote", changeFrequency: "monthly" as const, priority: 0.95 },
  { path: "/get-auto-quote", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/get-home-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-umbrella-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-boat-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-rv-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-atv-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-motorcycle-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-commercial-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-life-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/get-cyber-quote", changeFrequency: "monthly" as const, priority: 0.8 },
  {
    path: "/get-performance-and-bid-bonds-quote",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
  { path: "/videos", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/podcast", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/blog/rss.xml", changeFrequency: "weekly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const blogEntries = BLOG_POSTS_DETAIL.map((post) => {
    const parsed = Date.parse(post.date);
    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: Number.isNaN(parsed) ? new Date() : new Date(parsed),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticEntries, ...blogEntries];
}
