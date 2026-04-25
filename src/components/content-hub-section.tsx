"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";
import {
  INSURANCE_PODCASTS_HOME,
  type InsurancePodcastShowcase,
} from "@/data/insurance-podcasts";
import type { PodcastEpisode, PodcastFeedResult } from "@/types/podcast-feed";

const img = (path: string) => encodeURI(path);

/** Two most recent published posts from DB (see home page). */
export type HomeBlogPreview = {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  image: string;
  author: string;
  dateLabel: string;
  avatar: string;
};

/** Thumbnails from YouTube (see https://img.youtube.com). */
const ytThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export type ContentHubVlogItem = {
  title: string;
  excerpt: string;
  videoId: string;
  image: string;
  author: string;
  avatar: string;
};

const HUB_VIDEOS_FALLBACK: ContentHubVlogItem[] = [
  {
    title:
      "My Homeowners Insurance Increased My Coverage Without My Permission",
    excerpt:
      "How replacement cost and underwriting changes can raise your dwelling limit—and your premium—even when you didn’t request more coverage.",
    videoId: "2CVuQ7wJLik",
    image: ytThumb("2CVuQ7wJLik"),
    author: "The Insurance Blackbox",
    avatar: img("/images/david hargrove head shot_1761004385331.jpg"),
  },
  {
    title: "Never Mix Personal and Business Insurance",
    excerpt:
      "Why running a business on a personal policy leaves serious gaps—and what to line up instead so liability and property are actually protected.",
    videoId: "XhtnrsvJFCw",
    image: ytThumb("XhtnrsvJFCw"),
    author: "The Insurance Blackbox",
    avatar: img("/images/sid hargrove headshot_1761004385331.jpg"),
  },
  {
    title:
      "They Are Canceling My Homeowners Insurance Policy Because of Needed Repairs",
    excerpt:
      "What it means when an insurer ties cancellation or non-renewal to inspection findings, and how to respond before you lose coverage.",
    videoId: "zO4LW1uClnY",
    image: ytThumb("zO4LW1uClnY"),
    author: "The Insurance Blackbox",
    avatar: img("/images/leslie dolman headshot_1761004385329.jpg"),
  },
];

type ModalState =
  | { kind: "video"; videoId: string; title: string }
  | {
      kind: "podcast";
      variant: "rss";
      title: string;
      excerpt: string;
      audioUrl: string;
    }
  | {
      kind: "podcast";
      variant: "link";
      title: string;
      excerpt: string;
      listenUrl: string;
    }
  | null;

const PODCAST_HUB_FALLBACK_IMAGE = img(
  "/images/group photo 1 (1)_1761008519000.jpg",
);
const PODCAST_HUB_FALLBACK_AVATAR = img(
  "/images/david hargrove head shot_1761004385331.jpg",
);

export default function ContentHubSection({
  blogPosts = [],
  vlogItems,
  firstPodcastShowcase,
}: {
  blogPosts?: HomeBlogPreview[];
  /** When empty or omitted, static fallback is used. */
  vlogItems?: ContentHubVlogItem[];
  firstPodcastShowcase?: InsurancePodcastShowcase | null;
}) {
  const hubVlogItems =
    vlogItems && vlogItems.length > 0 ? vlogItems : HUB_VIDEOS_FALLBACK;
  const featuredPodcast =
    firstPodcastShowcase ?? INSURANCE_PODCASTS_HOME[0];
  const [modal, setModal] = useState<ModalState>(null);
  const [rssHubItems, setRssHubItems] = useState<PodcastEpisode[]>([]);
  const [rssHubChannel, setRssHubChannel] = useState<string | undefined>();
  const [rssHubActive, setRssHubActive] = useState(false);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/podcast-feed?limit=1")
      .then((res) => res.json() as Promise<PodcastFeedResult>)
      .then((data) => {
        if (cancelled) return;
        if (data.configured && data.items.length > 0) {
          setRssHubItems(data.items.slice(0, 1));
          setRssHubChannel(data.channelTitle);
          setRssHubActive(true);
        }
      })
      .catch(() => {
        if (!cancelled) setRssHubActive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  return (
    <section className="border-t border-[var(--mist)] bg-secondary/40 py-16 lg:py-24">
      <PageShell>
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          {/* Blog */}
          <div>
            <Link href="/blog">
              <h2 className="text-2xl font-bold text-[var(--navy)] hover:text-primary transition-colors cursor-pointer">Blog</h2>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--slate)]">
              Insights and practical guidance from our team.
            </p>
            <ul className="mt-8 space-y-8">
              {blogPosts.length === 0 ? (
                <li className="text-sm leading-relaxed text-[var(--slate)]">
                  New articles will appear here when published. Browse the full blog for
                  all posts.
                </li>
              ) : (
                blogPosts.map((post) => (
                  <li key={post.slug}>
                    <Link href={post.href} className="group block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                        <Image
                          src={post.image}
                          alt=""
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20"
                          aria-hidden
                        />
                        <span
                          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--navy)] shadow-md transition group-hover:bg-white"
                          aria-hidden
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-[var(--navy)] transition group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                          <Image
                            src={post.avatar}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-[var(--navy)]">
                            {post.author}
                          </p>
                          <p className="text-[var(--slate)]">{post.dateLabel}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <Link
              href="/blog"
              className="mt-8 inline-flex rounded-full border border-primary bg-white px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Explore our blog.
            </Link>
          </div>

          {/* Video */}
          <div>
            <Link href="/videos">
              <h2 className="text-2xl font-bold text-[var(--navy)] hover:text-primary transition-colors cursor-pointer">Vlog</h2>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--slate)]">
              Short explainers on coverage and planning.
            </p>
            <ul className="mt-8 space-y-8">
              {hubVlogItems.map((v) => (
                <li key={v.videoId}>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: "video",
                        videoId: v.videoId,
                        title: v.title,
                      })
                    }
                    className="w-full text-left"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                      <Image
                        src={v.image}
                        alt=""
                        fill
                        className="object-cover transition duration-300 hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20"
                        aria-hidden
                      />
                      <span
                        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--navy)] shadow-md"
                        aria-hidden
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[var(--navy)]">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
                      {v.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                        <Image
                          src={v.avatar}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      </div>
                      <p className="text-xs font-semibold text-[var(--navy)]">
                        {v.author}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/videos"
              className="mt-8 inline-flex rounded-full border border-primary bg-white px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Explore all videos.
            </Link>
          </div>

          {/* Podcast */}
          <div>
            <Link href="/podcast">
              <h2 className="text-2xl font-bold text-[var(--navy)] hover:text-primary transition-colors cursor-pointer">Podcast</h2>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--slate)]">
              Conversations on risk, protection, and peace of mind.
            </p>
            <ul className="mt-8 space-y-8">
              <li key={featuredPodcast.id}>
                <button
                  type="button"
                  onClick={() => {
                    const p = featuredPodcast;
                    const hasAudio = p.audioUrl && p.audioUrl.trim().length > 0;
                    setModal(
                      hasAudio
                        ? {
                            kind: "podcast",
                            variant: "rss",
                            title: p.title,
                            excerpt: p.excerpt,
                            audioUrl: p.audioUrl!,
                          }
                        : {
                            kind: "podcast",
                            variant: "link",
                            title: p.title,
                            excerpt: p.excerpt,
                            listenUrl: p.listenUrl,
                          },
                    );
                  }}
                  className="w-full text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                    <Image
                      src={featuredPodcast.image}
                      alt=""
                      fill
                      className="object-cover transition duration-300 hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20"
                      aria-hidden
                    />
                    <span
                      className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--navy)] shadow-md"
                      aria-hidden
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--navy)]">
                    {featuredPodcast.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
                    {featuredPodcast.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                      <Image
                        src={featuredPodcast.avatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[var(--navy)]">
                      {featuredPodcast.authorName},{" "}
                      {featuredPodcast.authorSubtitle}
                    </p>
                  </div>
                </button>
              </li>

              {/* Show one RSS episode if available */}
              {rssHubActive &&
                rssHubItems.map((p) => {
                  const cover = p.imageUrl ?? PODCAST_HUB_FALLBACK_IMAGE;
                  const local = cover.startsWith("/");
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            kind: "podcast",
                            variant: "rss",
                            title: p.title,
                            excerpt: p.excerpt,
                            audioUrl: p.audioUrl,
                          })
                        }
                        className="w-full text-left"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                          {local ? (
                            <Image
                              src={cover}
                              alt=""
                              fill
                              className="object-cover transition duration-300 hover:scale-[1.02]"
                              sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element -- RSS artwork
                            <img
                              src={cover}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                            />
                          )}
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20"
                            aria-hidden
                          />
                          <span
                            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--navy)] shadow-md"
                            aria-hidden
                          >
                            <ArrowUpRight className="h-5 w-5" />
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-[var(--navy)]">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
                          {p.excerpt}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                            <Image
                              src={PODCAST_HUB_FALLBACK_AVATAR}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          </div>
                          <p className="text-xs font-semibold text-[var(--navy)]">
                            {p.showTitle ?? rssHubChannel ?? "Podcast"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
            <Link
              href="/podcast"
              className="mt-8 inline-flex rounded-full border border-primary bg-white px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Explore all podcast.
            </Link>
          </div>
        </div>
      </PageShell>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={modal.title}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close dialog"
            onClick={closeModal}
          />
          <div
            className={cn(
              "relative z-10 w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl",
              modal.kind === "podcast" ? "max-w-lg bg-white" : "bg-black",
            )}
          >
            <div className="flex items-center justify-between gap-4 bg-[var(--navy-dark)] px-4 py-3 text-left text-sm font-semibold text-white">
              <span className="truncate">{modal.title}</span>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-md px-2 py-1 text-white/90 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div
              className={cn(
                "relative w-full",
                modal.kind === "video"
                  ? "aspect-video bg-black"
                  : "px-6 py-6 sm:px-8 sm:py-8",
              )}
            >
              {modal.kind === "video" ? (
                <iframe
                  title={modal.title}
                  src={`https://www.youtube.com/embed/${modal.videoId}?autoplay=1`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : modal.kind === "podcast" && modal.variant === "rss" ? (
                <div className="space-y-4 text-[var(--navy)]">
                  <p className="text-sm leading-relaxed text-[var(--slate)]">
                    {modal.excerpt}
                  </p>
                  <audio
                    controls
                    autoPlay
                    src={modal.audioUrl}
                    className="w-full"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : modal.kind === "podcast" && modal.variant === "link" ? (
                <div className="space-y-4 text-[var(--navy)]">
                  <p className="text-sm leading-relaxed text-[var(--slate)]">
                    {modal.excerpt}
                  </p>
                  <a
                    href={modal.listenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Listen in your podcast app
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
