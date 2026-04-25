/** Vlog (YouTube) row — mirrors `vlog_entries` and API JSON. */
export interface VlogEntry {
  id: number;
  title: string;
  excerpt?: string;
  video_embed_id: string;
  image_url?: string;
  author_name: string;
  author_subtitle: string;
  author_avatar_url: string;
  external_href?: string;
  is_published: boolean;
  published_at?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
