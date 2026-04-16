"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";
import { INSURANCE_PODCASTS_HOME } from "@/data/insurance-podcasts";
import type { PodcastEpisode, PodcastFeedResult } from "@/types/podcast-feed";

const img = (path: string) => encodeURI(path);

const BLOG_ITEMS = [
  {
    title:
      "Insurance Rates Are a Black Box: Understanding Texas Property Insurance Rates",
    excerpt:
      "You open your homeowners renewal and the premium has jumped again — and you are almost certainly not told how that number was calculated. A policy perspective on rate regulation and transparency in Texas.",
    author: "David Hargrove",
    role: "Owner",
    date: "Apr 8, 2026",
    href: "/blog/insurance-rates-are-a-black-box-texas-property",
    image: img("/images/group photo 3_1761008420820.jpg"),
    avatar: img("/images/david hargrove head shot_1761004385331.jpg"),
  },
  {
    title: "Insurance Rates Are a Black Box 2.0: The Auto Insurance Edition",
    excerpt:
      "Why drivers deserve to understand what they are really paying for — credit-based scores, telematics, CLUE, renewal ratchets, and transparency gaps unique to auto.",
    author: "David Hargrove",
    role: "Owner",
    date: "Apr 8, 2026",
    href: "/blog/insurance-rates-black-box-auto-insurance-edition",
    image: img("/images/SCR-20250919-sqme_1758335513957.jpeg"),
    avatar: img("/images/david hargrove head shot_1761004385331.jpg"),
  },
] as const;

/** Thumbnails from YouTube (see https://img.youtube.com). */
const ytThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const VIDEO_ITEMS = [
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
] as const;

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

export default function ContentHubSection() {
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
            <h2 className="text-2xl font-bold text-[var(--navy)]">Blog</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--slate)]">
              Insights and practical guidance from our team.
            </p>
            <ul className="mt-8 space-y-8">
              {BLOG_ITEMS.map((post) => (
                <li key={post.href}>
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
                        <p className="text-[var(--slate)]">
                          {post.role} · {post.date}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
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
            <h2 className="text-2xl font-bold text-[var(--navy)]">Video</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--slate)]">
              Short explainers on coverage and planning.
            </p>
            <ul className="mt-8 space-y-8">
              {VIDEO_ITEMS.map((v) => (
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
            <h2 className="text-2xl font-bold text-[var(--navy)]">Podcast</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--slate)]">
              Conversations on risk, protection, and peace of mind.
            </p>
            <ul className="mt-8 space-y-8">
              {/* Always show first static podcast */}
              <li key={INSURANCE_PODCASTS_HOME[0].id}>
                <button
                  type="button"
                  onClick={() => {
                    const firstPodcast = INSURANCE_PODCASTS_HOME[0];
                    const hasAudio =
                      firstPodcast.audioUrl &&
                      firstPodcast.audioUrl.trim().length > 0;
                    setModal(
                      hasAudio
                        ? {
                            kind: "podcast",
                            variant: "rss",
                            title: firstPodcast.title,
                            excerpt: firstPodcast.excerpt,
                            audioUrl: firstPodcast.audioUrl!,
                          }
                        : {
                            kind: "podcast",
                            variant: "link",
                            title: firstPodcast.title,
                            excerpt: firstPodcast.excerpt,
                            listenUrl: firstPodcast.listenUrl,
                          },
                    );
                  }}
                  className="w-full text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                    <Image
                      src={INSURANCE_PODCASTS_HOME[0].image}
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
                    {INSURANCE_PODCASTS_HOME[0].title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
                    {INSURANCE_PODCASTS_HOME[0].excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                      <Image
                        src={INSURANCE_PODCASTS_HOME[0].avatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[var(--navy)]">
                      {INSURANCE_PODCASTS_HOME[0].authorName},{" "}
                      {INSURANCE_PODCASTS_HOME[0].authorSubtitle}
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
