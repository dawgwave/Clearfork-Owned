import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/blog/blog-index-page";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insurance tips, industry insights, and news from SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: { canonical: "https://clearforkinsurance.com/blog" },
};

export default function BlogPage() {
  return <BlogIndexPage />;
}
