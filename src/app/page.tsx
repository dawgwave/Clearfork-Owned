import HeroSection from "@/components/hero-section";
import ContentHubSection, {
  type ContentHubVlogItem,
  type HomeBlogPreview,
} from "@/components/content-hub-section";
import ServicesSection from "@/components/services-section";
import HowItWorksSection from "@/components/how-it-works-section";
import AboutSection from "@/components/about-section";
import CtaSection from "@/components/cta-section";
import ContactSection from "@/components/contact-section";
import { getAllBlogPosts } from "@/lib/blog";
import type { BlogPostWithAuthor } from "@/lib/blog";
import { getAllVlogs } from "@/lib/vlogs";
import { toVlogPublicCard } from "@/lib/vlog-card";
import { getAllPodcastShowcases, rowToShowcase } from "@/lib/podcast-showcases";

/** No DB at `next build` in Docker; render on the server when a request hits prod. */
export const dynamic = "force-dynamic";

function homeBlogExcerpt(post: BlogPostWithAuthor): string {
  const raw = post.excerpt?.trim();
  if (raw) return raw;
  const plain = post.content.replace(/\s+/g, " ").trim();
  return plain.length > 160 ? `${plain.slice(0, 160)}…` : plain;
}

function toHomeBlogPreview(post: BlogPostWithAuthor): HomeBlogPreview {
  const image = post.featured_image_url?.trim()
    ? post.featured_image_url.startsWith("http")
      ? post.featured_image_url
      : encodeURI(post.featured_image_url)
    : encodeURI("/images/blog-hero.png");
  const dateLabel = new Date(
    post.published_at || post.created_at,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    slug: post.slug,
    title: post.title,
    excerpt: homeBlogExcerpt(post),
    href: `/blog/${post.slug}`,
    image,
    author: post.author_name || "Clearfork Insurance",
    dateLabel,
    avatar: encodeURI("/images/david hargrove head shot_1761004385331.jpg"),
  };
}

export default async function HomePage() {
  const { posts: latestPosts } = await getAllBlogPosts(
    { published_only: true },
    { page: 1, limit: 2 },
  );
  const homeBlogPosts = latestPosts.map(toHomeBlogPreview);

  const { vlogs: hubVlogs } = await getAllVlogs(
    { published_only: true },
    { page: 1, limit: 3 },
  );
  const vlogItems: ContentHubVlogItem[] = hubVlogs.map((v) => {
    const c = toVlogPublicCard(v);
    return {
      title: c.title,
      excerpt: c.excerpt,
      videoId: c.videoEmbedId,
      image: c.imageSrc,
      author: c.authorName,
      avatar: c.authorAvatarSrc,
    };
  });

  const { showcases: firstPodcastRows } = await getAllPodcastShowcases(
    { published_only: true },
    { page: 1, limit: 1 },
  );
  const firstPodcastShowcase = firstPodcastRows[0]
    ? rowToShowcase(firstPodcastRows[0])
    : null;

  return (
    <>
      <HeroSection />
      <ContentHubSection
        blogPosts={homeBlogPosts}
        vlogItems={vlogItems}
        firstPodcastShowcase={firstPodcastShowcase}
      />
      <ServicesSection />
      <HowItWorksSection />
      <AboutSection />
      <CtaSection />
      <ContactSection />
    </>
  );
}
