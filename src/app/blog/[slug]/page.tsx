import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/blog-post-view";
import { getBlogPostBySlug } from "@/lib/blog";
import { blogPostSchema, breadcrumbSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, false); // Only published posts
  if (!post) return {};
  
  return {
    title: post.title,
    description: post.excerpt || post.meta_description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || post.meta_description,
      authors: [post.author_name || "Clearfork Insurance"],
      images: post.featured_image_url ? [{ url: post.featured_image_url }] : undefined,
    },
    twitter: { 
      card: "summary_large_image", 
      title: post.title, 
      description: post.excerpt || post.meta_description,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
    alternates: { canonical: `https://clearforkinsurance.com/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, false); // Only published posts
  if (!post) notFound();

  const publishedDate = post.published_at || post.created_at;

  const schemas = [
    blogPostSchema({
      title: post.title,
      description: post.excerpt || post.meta_description || '',
      date: publishedDate,
      slug: post.slug,
      author: post.author_name || "Clearfork Insurance",
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
      <BlogPostView post={post} />
    </>
  );
}
