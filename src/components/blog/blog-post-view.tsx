"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link2, ArrowLeft } from "lucide-react";
import { FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { PageShell } from "@/components/page-shell";
import { BlogPostMarkdown } from "@/components/blog/blog-post-markdown";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags: string[];
  featured_image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

function ShareIcons({ url, title }: { url: string; title: string }) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"
        aria-label="Share on X"
      >
        <FaXTwitter className="h-5 w-5" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"
        aria-label="Share on Facebook"
      >
        <FaFacebook className="h-5 w-5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin className="h-5 w-5" />
      </a>
      <button
        type="button"
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title, url });
          } else {
            navigator.clipboard.writeText(url);
            // Could add a toast notification here
          }
        }}
        className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"
        aria-label="Copy link"
      >
        <Link2 className="h-5 w-5" />
      </button>
    </div>
  );
}

interface BlogPostViewProps {
  post: BlogPost;
}

export function BlogPostView({ post }: BlogPostViewProps) {
  const [url, setUrl] = useState("");
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setUrl(window.location.href);
    
    // Fetch related posts (same category or tags)
    const fetchRelatedPosts = async () => {
      try {
        const params = new URLSearchParams({
          limit: '4',
        });
        
        if (post.category) {
          params.append('category', post.category);
        }
        
        const response = await fetch(`/api/blogs?${params}`);
        const data = await response.json();
        
        if (data.success) {
          // Filter out current post and limit to 3
          const filtered = data.posts
            .filter((p: BlogPost) => p.id !== post.id)
            .slice(0, 3);
          setRelatedPosts(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch related posts:', error);
      }
    };
    
    fetchRelatedPosts();
  }, [post.id, post.category]);

  const publishedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  return (
    <div className="min-h-screen bg-white">
      <PageShell>
        {/* Header */}
        <div className="py-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0A0A0A] mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          
          <article>
            {/* Title and Meta */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <time className="text-sm text-[#6B7280]" dateTime={post.published_at || post.created_at}>
                  {publishedDate}
                </time>
                {post.category && (
                  <span className="rounded bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#4B5162]">
                    {post.category}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold leading-tight text-[#0A0A0A] sm:text-5xl mb-4">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl leading-relaxed text-[#6B7280] mb-6">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-[#6B7280]">
                  By {post.author_name || 'Clearfork Insurance'}
                </p>
                <ShareIcons url={url} title={post.title} />
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-8">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full rounded-2xl object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <BlogPostMarkdown content={post.content} />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-[#0A0A0A] mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded bg-[#F3F4F6] px-3 py-1.5 text-sm text-[#4B5162] hover:bg-[#E5E7EB] hover:text-[#0A0A0A]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="border-t border-[#E5E7EB] pt-8 mb-12">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0A0A0A]">Share this article</h3>
                <ShareIcons url={url} title={post.title} />
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="border-t border-[#E5E7EB] pt-12">
                <h2 className="text-2xl font-bold text-[#0A0A0A] mb-8">Related Articles</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <article key={relatedPost.id} className="group">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <div className="mb-4 overflow-hidden rounded-xl">
                          <Image
                            src={relatedPost.featured_image_url || encodeURI("/images/blog-hero.png")}
                            alt={relatedPost.title}
                            width={400}
                            height={240}
                            className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div>
                          {relatedPost.category && (
                            <p className="text-xs font-medium text-[#6B7280] mb-2">
                              {relatedPost.category}
                            </p>
                          )}
                          <h3 className="font-semibold text-[#0A0A0A] group-hover:text-primary line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          {relatedPost.excerpt && (
                            <p className="mt-2 text-sm text-[#6B7280] line-clamp-2">
                              {relatedPost.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </PageShell>
    </div>
  );
}