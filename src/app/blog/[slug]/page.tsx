import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/blog-post-view";
import { getPostBySlug, getPostSlugs } from "@/data/blog-posts";
import { blogPostSchema, breadcrumbSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      authors: [post.author],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
    alternates: { canonical: `https://clearforkinsurance.com/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const schemas = [
    blogPostSchema({
      title: post.title,
      description: post.excerpt,
      date: post.date,
      slug: post.slug,
      author: post.author,
    }),
    breadcrumbSchema([
      { name: "Home", url: "https://clearforkinsurance.com/" },
      { name: "Blog", url: "https://clearforkinsurance.com/blog" },
      { name: post.title, url: `https://clearforkinsurance.com/blog/${slug}` },
    ]),
  ];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <BlogPostView slug={slug} />
    </>
  );
}
