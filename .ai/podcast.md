They use different sources.

/admin/podcasts only lists rows in the podcast_showcases table (curated cards you create in admin). Your migration seeded 2 rows, so you see 2.

/podcast uses hybrid mode in PodcastPageClient: it shows

All published rows from podcast_showcases (your 2), then
Extra episodes from RSS (fetchMergedPodcastEpisodes / getPodcastRssUrls()), up to PODCAST_PAGE_EPISODE_LIMIT minus the number of curated items.
So the third tile is almost certainly an RSS episode, not a third row in the DB. The admin UI does not list or “hide” that third item—it simply doesn’t manage RSS; only the two curated cards live in podcast_showcases.

I can point to the exact code if you want to change how many RSS episodes appear or add an admin view of RSS config.