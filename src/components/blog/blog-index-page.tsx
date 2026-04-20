"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BlogPost = {
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
};

const BACKDROP = encodeURI("/images/backdrop photo_1761008288886.jpg");

function HeroSection() {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        "h-[480px] sm:h-[540px] lg:h-[600px]",
      )}
    >
      <Image
        src={BACKDROP}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-[var(--navy-dark)]/75"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#8BC53F]/25 via-transparent to-[var(--navy)]/50"
        aria-hidden
      />
      <div className="relative z-10 flex h-full items-center pb-8 pt-10 sm:pb-10 sm:pt-12">
        <PageShell>
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 sm:text-[13px]">
              Expert insights and industry news
            </p>
            <h1 className="mx-auto max-w-[34rem] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-snug">
              Insurance News & Insights
            </h1>
            <p className="mx-auto mt-5 max-w-[29rem] text-base leading-relaxed text-white/90 sm:text-lg">
              Stay informed with expert insights, industry news, and practical tips from SIG Clearfork Insurance Group.
            </p>
          </div>
        </PageShell>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
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
    <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-[220px] overflow-hidden rounded-t-2xl">
        <Image 
          src={post.featured_image_url || encodeURI("/images/blog-hero.png")} 
          alt={post.title}
          fill 
          className="object-cover" 
          sizes="(max-width: 1024px) 100vw, 33vw" 
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <time className="text-sm text-[#6B7280]" dateTime={post.published_at || post.created_at}>
            {publishedDate}
          </time>
          {post.category && (
            <span className="rounded bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#4B5162]">
              {post.category}
            </span>
          )}
        </div>
        <h2 className="mt-3 line-clamp-2 text-xl font-semibold text-[#0A0A0A]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-[15px] leading-[22px] text-[#6B7280]">
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>
        <p className="mt-3 text-sm text-[#6B7280]">
          By {post.author_name || 'Clearfork Insurance'}
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View Post
          </Link>
          <Link
            href={`/blog/${post.slug}`}
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

interface BlogIndexPageProps {
  initialPosts: BlogPost[];
  initialCategories: string[];
  initialTotal: number;
  initialHasMore: boolean;
  initialSearch: string;
  initialCategory: string;
}

export function BlogIndexPage({
  initialPosts,
  initialCategories,
  initialTotal,
  initialHasMore,
  initialSearch,
  initialCategory
}: BlogIndexPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [loading, setLoading] = useState(false); // Start with false since we have initial data
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);

  const POSTS_PER_PAGE = 9;

  // Fetch blog posts from API
  const fetchPosts = async (page: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: POSTS_PER_PAGE.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (activeCategory !== "All") {
        params.append('category', activeCategory);
      }
      
      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (reset || page === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when filters change (not on initial load)
  useEffect(() => {
    if (activeCategory !== initialCategory || searchQuery !== initialSearch) {
      fetchPosts(1, true);
      setCurrentPage(1);
    }
  }, [activeCategory, searchQuery]);

  // Filter and search logic
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const loadMorePosts = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(nextPage, false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <PageShell className="py-16">
        <div className="mx-auto max-w-6xl">
          {/* Search and Filter Controls */}
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8">
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : `Showing ${posts.length} of ${total} posts`}
              {activeCategory !== "All" && ` in "${activeCategory}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Blog Grid */}
          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMorePosts}
                    disabled={loading}
                    className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                {searchQuery || activeCategory !== "All" 
                  ? "No posts match your filters." 
                  : "No posts available yet."
                }
              </p>
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}