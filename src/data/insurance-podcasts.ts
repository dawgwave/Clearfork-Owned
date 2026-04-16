const img = (path: string) => encodeURI(path);

/** Curated insurance topics only. Replace `listenUrl` when your real show/episodes are live. */
export type InsurancePodcastShowcase = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  avatar: string;
  authorName: string;
  authorSubtitle: string;
  /** Spotify, Apple Podcasts, or any public listen link */
  listenUrl: string;
  /** Optional: Direct audio file URL for playable episodes */
  audioUrl?: string;
};

export const INSURANCE_PODCAST_SHOWCASES: InsurancePodcastShowcase[] = [
  {
    id: "cyber-small-biz",
    title: "Small Business Cyber Insurance: What Every Owner Needs",
    excerpt:
      "Learn how cyber coverage helps small businesses respond to incidents—breach response, ransomware, and business interruption protection.",
    image: img("/images/group photo 1 (1)_1761008519000.jpg"),
    avatar: img("/images/david hargrove head shot_1761004385331.jpg"),
    authorName: "David Hargrove",
    authorSubtitle: "Owner",
    listenUrl:
      "https://podcasts.apple.com/us/podcast/small-business-cyber-insurance-what-every-owner-needs/id1784323702?i=1000758920368",
    audioUrl:
      "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2026-3-2/421296131-44100-2-ab8a32d1c593e.mp3",
  },
  {
    id: "cyber",
    title: "Cyber Insurance: What You Need to Know",
    excerpt:
      "How cyber coverage helps businesses respond to incidents—breach response, ransomware, and business interruption.",
    image: img("/images/SCR-20250919-sqme_1758335513957.jpeg"),
    avatar: img("/images/sid hargrove headshot_1761004385331.jpg"),
    authorName: "Sid Hargrove",
    authorSubtitle: "Owner",
    listenUrl: "https://open.spotify.com/show/2VRS1IJCTn2Nlkg33S1KG2",
  },
];

/** Home content hub uses the same curated list (2 topics). */
export const INSURANCE_PODCASTS_HOME = INSURANCE_PODCAST_SHOWCASES;
