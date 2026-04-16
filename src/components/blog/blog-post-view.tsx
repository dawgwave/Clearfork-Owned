"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { PageShell } from "@/components/page-shell";
import { BlogPostMarkdown } from "@/components/blog/blog-post-markdown";
import {
  getPostBySlug,
  getPopularPosts,
  getPrevNextSlugs,
  type BlogPostDetail,
} from "@/data/blog-posts";

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
          void navigator.clipboard.writeText(url);
        }}
        className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"
        aria-label="Copy link"
      >
        <Link2 className="h-5 w-5" />
      </button>
    </div>
  );
}

function PopularPostCard({ post }: { post: BlogPostDetail }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] transition-colors hover:bg-[#F3F4F6]">
        <div className="relative h-40 overflow-hidden">
          <Image src={post.imageSrc} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-[#0A0A0A] transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs text-[#6B7280]">{post.excerpt}</p>
          <span className="mt-3 text-sm font-medium text-primary group-hover:underline">Read More</span>
        </div>
      </article>
    </Link>
  );
}

export function BlogPostView({ slug }: { slug: string }) {
  const post = getPostBySlug(slug);
  const { prev, next } = getPrevNextSlugs(slug);
  const popularPosts = getPopularPosts(slug, 4);
  const prevPost = prev ? getPostBySlug(prev) : null;
  const nextPost = next ? getPostBySlug(next) : null;
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(typeof window !== "undefined" ? window.location.href : "");
  }, [slug]);

  if (!post) {
    return null;
  }

  return (
    <article className="bg-white">
      <header className="relative w-full">
        <div className="relative h-[320px] w-full sm:h-[400px] lg:h-[480px]">
          <Image src={post.imageSrc} alt="" fill className="object-cover" priority sizes="100vw" />
        </div>
      </header>

      <div className="py-10 lg:py-16">
        <PageShell className="px-4 sm:px-6 lg:px-[148px]">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-[#0A0A0A] sm:text-4xl lg:text-[42px]">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#E5E7EB]">
                  <Image src={post.imageSrc} alt="" fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <span className="text-sm text-[#374151]">By {post.author}</span>
                  <time className="block text-sm text-[#6B7280]" dateTime={post.date}>
                    {post.date}
                  </time>
                </div>
              </div>
              <div className="ml-auto">
                <ShareIcons url={shareUrl} title={post.title} />
              </div>
            </div>

            <div className="mt-10 text-[#374151]">
              {post.bodyFormat === "markdown" ? (
                <BlogPostMarkdown markdown={post.body} />
              ) : (
                post.body.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-5 text-[16px] leading-[28px]">
                    {paragraph}
                  </p>
                ))
              )}
            </div>

            {post.quote ? (
              <blockquote className="my-10 border-l-4 border-primary py-2 pl-6">
                <p className="text-[16px] italic leading-[28px] text-[#374151]">{post.quote}</p>
              </blockquote>
            ) : null}

            {post.inlineImageSrc ? (
              <div className="my-10 overflow-hidden rounded-xl">
                <Image
                  src={post.inlineImageSrc}
                  alt=""
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}

            {post.bulletSections?.map((section, i) => (
              <div key={i} className="my-10">
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-sm bg-[#ef4444]" />
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">{section.title}</h3>
                </div>
                <ul className="space-y-2 pl-4">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-[15px] leading-[26px] text-[#374151]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-[#ef4444]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-10">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-[#E5E7EB] px-6 font-medium text-[#0A0A0A] transition-colors hover:bg-[#F9FAFB]"
                >
                  ← Previous Post
                </Link>
              ) : (
                <span />
              )}
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Next Post →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </PageShell>
      </div>

      {popularPosts.length > 0 ? (
        <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-12 lg:py-16">
          <PageShell className="px-4 sm:px-6 lg:px-[148px]">
            <h2 className="mb-8 text-2xl font-bold text-[#0A0A0A]">Popular Post</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularPosts.map((p) => (
                <PopularPostCard key={p.slug} post={p} />
              ))}
            </div>
          </PageShell>
        </div>
      ) : null}
    </article>
  );
}
