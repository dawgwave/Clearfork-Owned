import { INSURANCE_PODCAST_SHOWCASES } from "@/data/insurance-podcasts";
import {
  fetchMergedPodcastEpisodes,
  getPodcastRssUrls,
  PODCAST_PAGE_EPISODE_LIMIT,
  type PodcastEpisode,
} from "@/lib/podcast-rss";
import { PodcastPageClient } from "./podcast-page-client";

export default async function PodcastPage() {
  // Always show the first static podcast (with audio player)
  const firstPodcast = INSURANCE_PODCAST_SHOWCASES[0];

  const urls = getPodcastRssUrls();
  let rssEpisodes: PodcastEpisode[] = [];

  try {
    // Fetch RSS episodes (limit - 1 to account for the first static podcast)
    const data = await fetchMergedPodcastEpisodes(
      urls,
      PODCAST_PAGE_EPISODE_LIMIT - 1,
    );
    rssEpisodes = data.items;
  } catch {
    // If RSS fails, just show the static podcast
    rssEpisodes = [];
  }

  return (
    <PodcastPageClient
      mode="hybrid"
      firstItem={firstPodcast}
      rssEpisodes={rssEpisodes}
    />
  );
}
