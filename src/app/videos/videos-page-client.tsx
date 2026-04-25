"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type VideoItem = {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorSubtitle: string;
  imageSrc: string;
  authorAvatarSrc: string;
  videoEmbedId: string;
  href: string;
};

type Props = { items: VideoItem[] };

function VideosHero() {
  return (
    <section
      className="relative isolate flex min-h-[280px] w-full items-center justify-center bg-black sm:min-h-[320px]"
      style={{
        backgroundImage: `url(${encodeURI("/images/backdrop photo_1761008288886.jpg")})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="Videos hero"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 px-4 text-center text-white">
        <span className="mb-4 inline-block rounded bg-primary px-4 py-1.5 text-sm font-medium text-white">
          Videos
        </span>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-[56px]">
          Insurance Video Explainers
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
          Short explainers from The Insurance Blackbox on YouTube—coverage, inspections, and
          common pitfalls.
        </p>
      </div>
    </section>
  );
}

function VideoCard({
  item,
  onWatch,
}: {
  item: VideoItem;
  onWatch: (videoId: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-[220px] overflow-hidden rounded-t-2xl">
        <Image
          src={item.imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[#0A0A0A]">{item.title}</h2>
        <p className="mt-2 line-clamp-2 text-[15px] leading-[22px] text-[#6B7280]">
          {item.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
            <Image src={item.authorAvatarSrc} alt="" fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#495367]">{item.authorName}</div>
            <div className="text-xs text-[#96A2BE]">{item.authorSubtitle}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onWatch(item.videoEmbedId)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Watch Video
          </button>
          <button
            type="button"
            onClick={() => onWatch(item.videoEmbedId)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label={`Watch ${item.title}`}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function VideosPageClient({ items }: Props) {
  const [videoModalId, setVideoModalId] = useState<string | null>(null);
  const hasItems = items.length > 0;
  return (
    <div className="min-h-screen bg-background">
      <VideosHero />
      <section className="py-12 lg:py-16">
        <PageShell>
          <Dialog open={!!videoModalId} onOpenChange={(open) => !open && setVideoModalId(null)}>
            <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="sr-only">Watch video</DialogTitle>
              </DialogHeader>
              {videoModalId ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoModalId}?autoplay=1`}
                    title={
                      items.find((v) => v.videoEmbedId === videoModalId)?.title ??
                      "Insurance video"
                    }
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          {!hasItems ? (
            <p className="text-center text-muted-foreground">
              No published videos yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {items.map((item) => (
                <VideoCard key={item.id} item={item} onWatch={setVideoModalId} />
              ))}
            </div>
          )}
        </PageShell>
      </section>
    </div>
  );
}
