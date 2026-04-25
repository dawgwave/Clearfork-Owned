-- UP: Vlog (YouTube) entries and curated podcast cards — admin-managed, same pattern as blog_posts
CREATE TABLE IF NOT EXISTS `vlog_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `excerpt` TEXT,
  `video_embed_id` VARCHAR(32) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `author_name` VARCHAR(200) NOT NULL DEFAULT 'The Insurance Blackbox',
  `author_subtitle` VARCHAR(200) NOT NULL DEFAULT 'YouTube',
  `author_avatar_url` VARCHAR(500) NOT NULL,
  `external_href` VARCHAR(1000) NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_published` (`is_published`, `sort_order`),
  INDEX `idx_sort` (`sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `podcast_showcases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `public_slug` VARCHAR(100) NULL,
  `title` VARCHAR(500) NOT NULL,
  `excerpt` TEXT,
  `image_url` VARCHAR(500) NOT NULL,
  `avatar_url` VARCHAR(500) NOT NULL,
  `author_name` VARCHAR(200) NOT NULL,
  `author_subtitle` VARCHAR(200) NOT NULL,
  `listen_url` VARCHAR(2000) NOT NULL,
  `audio_url` VARCHAR(2000) NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `ux_podcast_showcases_public_slug` (`public_slug`),
  INDEX `idx_published` (`is_published`, `sort_order`),
  INDEX `idx_sort` (`sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed current public-site content (matches prior hardcoded data)
INSERT INTO `vlog_entries` (
  `title`, `excerpt`, `video_embed_id`, `image_url`, `author_name`, `author_subtitle`,
  `author_avatar_url`, `external_href`, `is_published`, `sort_order`, `published_at`
) VALUES
(
  'My Homeowners Insurance Increased My Coverage Without My Permission',
  'How replacement cost and underwriting changes can raise your dwelling limit—and your premium—even when you didn''t request more coverage.',
  '2CVuQ7wJLik',
  NULL,
  'The Insurance Blackbox',
  'YouTube',
  '/images/david hargrove head shot_1761004385331.jpg',
  'https://www.youtube.com/watch?v=2CVuQ7wJLik',
  1,
  0,
  NOW()
),
(
  'Never Mix Personal and Business Insurance',
  'Why running a business on a personal policy leaves serious gaps—and what to line up instead so liability and property are actually protected.',
  'XhtnrsvJFCw',
  NULL,
  'The Insurance Blackbox',
  'YouTube',
  '/images/sid hargrove headshot_1761004385331.jpg',
  'https://www.youtube.com/watch?v=XhtnrsvJFCw',
  1,
  1,
  NOW()
),
(
  'They Are Canceling My Homeowners Insurance Policy Because of Needed Repairs',
  'What it means when an insurer ties cancellation or non-renewal to inspection findings, and how to respond before you lose coverage.',
  'zO4LW1uClnY',
  NULL,
  'The Insurance Blackbox',
  'YouTube',
  '/images/leslie dolman headshot_1761004385329.jpg',
  'https://www.youtube.com/watch?v=zO4LW1uClnY',
  1,
  2,
  NOW()
);

INSERT INTO `podcast_showcases` (
  `public_slug`, `title`, `excerpt`, `image_url`, `avatar_url`, `author_name`, `author_subtitle`,
  `listen_url`, `audio_url`, `is_published`, `sort_order`, `published_at`
) VALUES
(
  'cyber-small-biz',
  'Small Business Cyber Insurance: What Every Owner Needs',
  'Learn how cyber coverage helps small businesses respond to incidents—breach response, ransomware, and business interruption protection.',
  '/images/group photo 1 (1)_1761008519000.jpg',
  '/images/david hargrove head shot_1761004385331.jpg',
  'David Hargrove',
  'Owner',
  'https://podcasts.apple.com/us/podcast/small-business-cyber-insurance-what-every-owner-needs/id1784323702?i=1000758920368',
  'https://d3ctxlq1ktw2nl.cloudfront.net/staging/2026-3-2/421296131-44100-2-ab8a32d1c593e.mp3',
  1,
  0,
  NOW()
),
(
  'cyber',
  'Cyber Insurance: What You Need to Know',
  'How cyber coverage helps businesses respond to incidents—breach response, ransomware, and business interruption.',
  '/images/SCR-20250919-sqme_1758335513957.jpeg',
  '/images/sid hargrove headshot_1761004385331.jpg',
  'Sid Hargrove',
  'Owner',
  'https://open.spotify.com/show/2VRS1IJCTn2Nlkg33S1KG2',
  NULL,
  1,
  1,
  NOW()
);

-- DOWN
DROP TABLE IF EXISTS `podcast_showcases`;
DROP TABLE IF EXISTS `vlog_entries`;
