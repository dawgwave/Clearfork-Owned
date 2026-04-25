import type { InsurancePodcastShowcase } from "@/data/insurance-podcasts";
import type { PodcastShowcaseRow } from "@/types/podcast-showcase";

export function rowToShowcase(
  row: PodcastShowcaseRow,
): InsurancePodcastShowcase {
  const id = row.public_slug?.trim() || String(row.id);
  const enc = (p: string) => (p.startsWith("http") ? p : encodeURI(p));
  return {
    id,
    title: row.title,
    excerpt: row.excerpt || "",
    image: enc(row.image_url),
    avatar: enc(row.avatar_url),
    authorName: row.author_name,
    authorSubtitle: row.author_subtitle,
    listenUrl: row.listen_url,
    audioUrl: row.audio_url?.trim() || undefined,
  };
}
