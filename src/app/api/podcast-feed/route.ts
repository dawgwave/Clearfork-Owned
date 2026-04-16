import { NextResponse } from "next/server";
import {
  fetchMergedPodcastEpisodes,
  getPodcastRssUrls,
  isPodcastRssConfigured,
  PODCAST_PAGE_EPISODE_LIMIT,
} from "@/lib/podcast-rss";

export const revalidate = 3600;

const API_MAX = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLimit = parseInt(searchParams.get("limit") ?? String(PODCAST_PAGE_EPISODE_LIMIT), 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(API_MAX, Math.max(1, rawLimit)) : PODCAST_PAGE_EPISODE_LIMIT;

  if (!isPodcastRssConfigured()) {
    return NextResponse.json({
      configured: false,
      channelTitle: undefined,
      channelImage: undefined,
      items: [],
    });
  }

  const urls = getPodcastRssUrls();

  try {
    const data = await fetchMergedPodcastEpisodes(urls, limit);
    return NextResponse.json({ configured: true, ...data });
  } catch {
    return NextResponse.json(
      { configured: true, channelTitle: undefined, channelImage: undefined, items: [] },
      { status: 502 },
    );
  }
}
