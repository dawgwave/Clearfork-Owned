declare module "rss" {
  interface FeedOptions {
    title: string;
    description?: string;
    site_url?: string;
    feed_url?: string;
    language?: string;
    pubDate?: Date;
  }

  interface ItemOptions {
    title: string;
    description?: string;
    url?: string;
    date?: Date;
    author?: string;
    categories?: string[];
  }

  class RSS {
    constructor(options: FeedOptions);
    item(options: ItemOptions): void;
    xml(options?: { indent?: boolean }): string;
  }

  export default RSS;
}
