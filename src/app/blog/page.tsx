import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/blog/blog-index-page";
import { getAllBlogPosts, getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insurance tips, industry insights, and news from SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: { canonical: "https://clearforkinsurance.com/blog" },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get search params
  const params = await searchParams;
  const page = typeof params?.page === 'string' ? parseInt(params.page) : 1;
  const search = typeof params?.search === 'string' ? params.search : undefined;
  const category = typeof params?.category === 'string' ? params.category : undefined;
  
  // Fetch initial data server-side
  const [postsResult, categoriesResult] = await Promise.all([
    getAllBlogPosts(
      { search, category, published_only: true },
      { page, limit: 9 }
    ),
    getBlogCategories()
  ]);

  const categories = ['All', ...categoriesResult.map(c => c.category)];

  return (
    <BlogIndexPage 
      initialPosts={postsResult.posts}
      initialCategories={categories}
      initialTotal={postsResult.total}
      initialHasMore={postsResult.hasMore}
      initialSearch={search || ''}
      initialCategory={category || 'All'}
    />
  );
}
