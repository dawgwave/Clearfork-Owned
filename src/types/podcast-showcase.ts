export interface PodcastShowcaseRow {
  id: number;
  public_slug?: string;
  title: string;
  excerpt?: string;
  image_url: string;
  avatar_url: string;
  author_name: string;
  author_subtitle: string;
  listen_url: string;
  audio_url?: string;
  is_published: boolean;
  published_at?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
