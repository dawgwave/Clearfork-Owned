export type PodcastEpisode = {
  id: string;
  title: string;
  excerpt: string;
  audioUrl: string;
  publishedAt?: string;
  imageUrl?: string;
  /** Set when merging multiple RSS feeds (episode’s channel / show title). */
  showTitle?: string;
};

export type PodcastFeedResult = {
  configured: boolean;
  channelTitle?: string;
  channelImage?: string;
  items: PodcastEpisode[];
};
