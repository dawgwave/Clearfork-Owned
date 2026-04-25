import {
  fetchMergedPodcastEpisodes,
  getPodcastRssUrls,
  PODCAST_PAGE_EPISODE_LIMIT,
  type PodcastEpisode,
} from "@/lib/podcast-rss";
import {
  getAllPodcastShowcases,
  rowToShowcase,
} from "@/lib/podcast-showcases";
import { PodcastPageClient } from "./podcast-page-client";
import type { InsurancePodcastShowcase } from "@/data/insurance-podcasts";

export const dynamic = "force-dynamic";

export default async function PodcastPage() {
  let curatedItems: InsurancePodcastShowcase[] = [];
  try {
    const { showcases } = await getAllPodcastShowcases(
      { published_only: true },
      { page: 1, limit: 50 },
    );
    curatedItems = showcases.map(rowToShowcase);
  } catch {
    curatedItems = [];
  }

  const urls = getPodcastRssUrls();
  let rssEpisodes: PodcastEpisode[] = [];
  const rssCap = Math.max(0, PODCAST_PAGE_EPISODE_LIMIT - curatedItems.length);

  try {
    if (urls.length > 0 && rssCap > 0) {
      const data = await fetchMergedPodcastEpisodes(urls, rssCap);
      rssEpisodes = data.items;
    }
  } catch {
    rssEpisodes = [];
  }

  return (
    <PodcastPageClient
      mode="hybrid"
      curatedItems={curatedItems}
      rssEpisodes={rssEpisodes}
    />
  );
}
