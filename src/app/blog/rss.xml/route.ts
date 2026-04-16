import RSS from "rss";
import { BLOG_POSTS_DETAIL } from "@/data/blog-posts";

const SITE_URL = "https://clearforkinsurance.com";

export async function GET() {
  const feed = new RSS({
    title: "SIG Clearfork Insurance Group Blog",
    description: "Insurance tips, industry insights, and news from SIG Clearfork Insurance Group.",
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/blog/rss.xml`,
    language: "en",
    pubDate: new Date(),
  });

  for (const post of BLOG_POSTS_DETAIL) {
    const parsed = Date.parse(post.date);
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      date: Number.isNaN(parsed) ? new Date() : new Date(parsed),
      author: post.author,
      categories: [post.category],
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
