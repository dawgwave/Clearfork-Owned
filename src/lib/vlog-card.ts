import type { VlogEntry } from "@/types/vlog";
import { youtubeThumbFromId } from "./youtube-embed";

function resolveImageSrc(row: VlogEntry): string {
  const t = row.image_url?.trim();
  if (t) return t.startsWith("http") ? t : encodeURI(t);
  return youtubeThumbFromId(row.video_embed_id);
}

/** Public card shape for /videos and home hub. */
export function toVlogPublicCard(row: VlogEntry) {
  const imageSrc = resolveImageSrc(row);
  const authorAvatarSrc = row.author_avatar_url.startsWith("http")
    ? row.author_avatar_url
    : encodeURI(row.author_avatar_url);
  const href =
    row.external_href?.trim() ||
    `https://www.youtube.com/watch?v=${row.video_embed_id}`;
  return {
    id: String(row.id),
    title: row.title,
    excerpt: row.excerpt || "",
    authorName: row.author_name,
    authorSubtitle: row.author_subtitle,
    imageSrc,
    authorAvatarSrc,
    videoEmbedId: row.video_embed_id,
    href,
  };
}
