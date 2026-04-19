-- UP
-- Production DBs created from older setup-production-db.sql used status/featured_image;
-- app code (src/lib/blog.ts) expects is_published, content_format, meta_description, featured_image_url.

ALTER TABLE `blog_posts`
  ADD COLUMN `content_format` ENUM('markdown', 'html') NOT NULL DEFAULT 'markdown' AFTER `content`;

ALTER TABLE `blog_posts`
  ADD COLUMN `meta_description` TEXT NULL AFTER `tags`;

ALTER TABLE `blog_posts`
  CHANGE COLUMN `featured_image` `featured_image_url` VARCHAR(500) NULL DEFAULT NULL;

ALTER TABLE `blog_posts`
  ADD COLUMN `is_published` TINYINT(1) NOT NULL DEFAULT 0 AFTER `meta_description`;

UPDATE `blog_posts` SET `is_published` = (`status` = 'published');

ALTER TABLE `blog_posts` DROP COLUMN `status`;

-- blog_post_views: match app (blog_post_id, user_id)
ALTER TABLE `blog_post_views` DROP FOREIGN KEY `blog_post_views_ibfk_1`;

ALTER TABLE `blog_post_views`
  CHANGE COLUMN `post_id` `blog_post_id` INT NOT NULL;

ALTER TABLE `blog_post_views`
  ADD CONSTRAINT `blog_post_views_post_fk` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE;

ALTER TABLE `blog_post_views`
  ADD COLUMN `user_id` INT NULL AFTER `blog_post_id`;

ALTER TABLE `blog_post_views`
  ADD CONSTRAINT `blog_post_views_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- DOWN
-- Manual rollback not automated; restore from backup if needed.
