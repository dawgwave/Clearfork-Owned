import Parser from "rss-parser";
import type { PodcastEpisode, PodcastFeedResult } from "@/types/podcast-feed";

export type { PodcastEpisode, PodcastFeedResult } from "@/types/podcast-feed";

/** Max episodes merged from RSS shown on `/podcast` (newest first across feeds). */
export const PODCAST_PAGE_EPISODE_LIMIT = 3;

/** Used when `PODCAST_RSS_URLS` / `PODCAST_RSS_URL` are unset (temporary Clearfork setup). */
const DEFAULT_PODCAST_RSS_FEEDS = [
  "https://media.rss.com/farmsnotpharms/feed.xml",
  "https://media.rss.com/peaceoverpieces/feed.xml",
] as const;

/** Enough items per feed to pick the newest after merging; display caps are lower. */
const PER_FEED_FETCH_LIMIT = 40;

/**
 * Podcast RSS (server-side):
 * - `PODCAST_RSS_URLS` — comma- or newline-separated RSS XML URLs (multiple shows).
 * - `PODCAST_RSS_URL` — single feed (optional; ignored if `PODCAST_RSS_URLS` is set).
 * - If neither is set, defaults to the two RSS.com feeds above.
 * - Without playable enclosures, episodes are skipped.
 */
export function getPodcastRssUrls(): string[] {
  const multi = process.env.PODCAST_RSS_URLS;
  if (multi !== undefined && multi.trim() !== "") {
    const urls = multi
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));
    if (urls.length > 0) return urls;
  }
  const one = process.env.PODCAST_RSS_URL?.trim();
  if (one?.startsWith("http")) return [one];
  return [...DEFAULT_PODCAST_RSS_FEEDS];
}

/** @deprecated Prefer getPodcastRssUrls(); kept for call sites that need one URL. */
export function getPodcastRssUrl(): string | null {
  return getPodcastRssUrls()[0] ?? null;
}

export function isPodcastRssConfigured(): boolean {
  return getPodcastRssUrls().length > 0;
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function audioUrlFromItem(item: Parser.Item): string | undefined {
  return item.enclosure?.url ?? undefined;
}

function itunesImageHref(item: Parser.Item): string | undefined {
  const itunes = (
    item as Parser.Item & {
      itunes?: { image?: string | { $?: { href?: string } } };
    }
  ).itunes;
  const img = itunes?.image;
  if (typeof img === "string") return img;
  const href = img && typeof img === "object" ? img.$?.href : undefined;
  return href;
}

function channelImageFromFeed(
  feed: Parser.Output<Record<string, unknown>>,
): string | undefined {
  const itunes = feed.itunes as
    | { image?: string | { $?: { href?: string } } }
    | undefined;
  const img = itunes?.image;
  if (typeof img === "string") return img;
  return img && typeof img === "object" ? img.$?.href : undefined;
}

function itemId(item: Parser.Item, index: number): string {
  if (typeof item.guid === "string" && item.guid) return item.guid;
  if (item.guid && typeof item.guid === "object" && "value" in item.guid) {
    const v = (item.guid as { value?: string }).value;
    if (v) return v;
  }
  if (item.link) return item.link;
  return `episode-${index}`;
}

function pubTime(isoOrRfc?: string): number {
  if (!isoOrRfc) return 0;
  const t = Date.parse(isoOrRfc);
  return Number.isFinite(t) ? t : 0;
}

function itunesEpisodeNumber(item: Parser.Item): string | undefined {
  const it = (item as Parser.Item & { itunes?: { episode?: string | number } })
    .itunes;
  const e = it?.episode;
  if (e === undefined || e === null) return undefined;
  return String(e).trim();
}

/** Hide a specific episode from RSS lists; the next-newest items fill the cap instead. */
function shouldExcludeRssItem(
  item: Parser.Item,
  displayTitle: string,
): boolean {
  const ep = itunesEpisodeNumber(item);
  if (ep === "39" || ep === "039") return true;

  const t = displayTitle.trim();
  if (!t) return false;
  if (/\bep\.?\s*39\b/i.test(t)) return true;
  if (/\bepisode\s*#?\s*39\b/i.test(t)) return true;
  if (/\bep\s*#?\s*39\b/i.test(t)) return true;
  if (/\bep39\b/i.test(t)) return true;

  return false;
}

export async function fetchPodcastEpisodes(
  feedUrl: string,
  limit: number,
): Promise<Omit<PodcastFeedResult, "configured">> {
  const parser = new Parser();
  const feed = await parser.parseURL(feedUrl);

  const channelTitle = feed.title ?? undefined;
  const channelImage = channelImageFromFeed(feed);

  const items: PodcastEpisode[] = [];
  for (let i = 0; i < (feed.items?.length ?? 0) && items.length < limit; i++) {
    const item = feed.items[i];
    const audioUrl = audioUrlFromItem(item);
    if (!audioUrl) continue;

    const title = item.title?.trim() || "Episode";
    if (shouldExcludeRssItem(item, title)) continue;

    const rawText =
      item.contentSnippet ||
      (item.content ? stripHtml(item.content) : "") ||
      item.title ||
      "";
    const excerpt =
      rawText.length > 220 ? `${rawText.slice(0, 217).trim()}…` : rawText;

    items.push({
      id: itemId(item, i),
      title,
      excerpt: excerpt || "Listen to this episode.",
      audioUrl,
      publishedAt: item.pubDate ?? item.isoDate,
      imageUrl: itunesImageHref(item) ?? channelImage,
    });
  }

  return { channelTitle, channelImage, items };
}

/** Fetch several feeds, tag episodes with `showTitle`, merge and sort newest first. */
export async function fetchMergedPodcastEpisodes(
  feedUrls: string[],
  totalLimit: number,
): Promise<Omit<PodcastFeedResult, "configured">> {
  const settled = await Promise.allSettled(
    feedUrls.map((url) => fetchPodcastEpisodes(url, PER_FEED_FETCH_LIMIT)),
  );

  const merged: PodcastEpisode[] = [];
  for (let fi = 0; fi < settled.length; fi++) {
    const r = settled[fi];
    if (r.status !== "fulfilled") continue;
    const { channelTitle, items } = r.value;
    const showTitle = channelTitle?.trim() || `Podcast ${fi + 1}`;
    for (const ep of items) {
      merged.push({
        ...ep,
        id: `${fi}-${ep.id}`,
        showTitle,
      });
    }
  }

  merged.sort((a, b) => pubTime(b.publishedAt) - pubTime(a.publishedAt));

  return {
    channelTitle: undefined,
    channelImage: undefined,
    items: merged.slice(0, totalLimit),
  };
}
