-- UP
-- Align legacy blog tables with src/lib/blog.ts — no-op when already aligned (e.g. after 20260419_145816)

SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'content_format') = 0,
    'ALTER TABLE `blog_posts` ADD COLUMN `content_format` ENUM(''markdown'', ''html'') NOT NULL DEFAULT ''markdown'' AFTER `content`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'meta_description') = 0,
    'ALTER TABLE `blog_posts` ADD COLUMN `meta_description` TEXT NULL AFTER `tags`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'featured_image') > 0,
    'ALTER TABLE `blog_posts` CHANGE COLUMN `featured_image` `featured_image_url` VARCHAR(500) NULL DEFAULT NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'is_published') = 0,
    'ALTER TABLE `blog_posts` ADD COLUMN `is_published` TINYINT(1) NOT NULL DEFAULT 0 AFTER `meta_description`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'status') > 0,
    'UPDATE `blog_posts` SET `is_published` = (`status` = ''published'')',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'status') > 0,
    'ALTER TABLE `blog_posts` DROP COLUMN `status`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk := (
  SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_post_views' AND COLUMN_NAME = 'post_id'
    AND REFERENCED_TABLE_NAME = 'blog_posts'
  LIMIT 1
);
SET @sql := IF(
  @fk IS NOT NULL,
  CONCAT('ALTER TABLE `blog_post_views` DROP FOREIGN KEY `', @fk, '`'),
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_post_views' AND COLUMN_NAME = 'post_id') > 0,
    'ALTER TABLE `blog_post_views` CHANGE COLUMN `post_id` `blog_post_id` INT NOT NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_post_views' AND COLUMN_NAME = 'user_id') = 0,
    'ALTER TABLE `blog_post_views` ADD COLUMN `user_id` INT NULL AFTER `blog_post_id`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_post_views' AND COLUMN_NAME = 'blog_post_id'
      AND REFERENCED_TABLE_NAME = 'blog_posts') = 0,
    'ALTER TABLE `blog_post_views` ADD CONSTRAINT `blog_post_views_post_fk` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'blog_post_views' AND COLUMN_NAME = 'user_id'
      AND REFERENCED_TABLE_NAME = 'users') = 0,
    'ALTER TABLE `blog_post_views` ADD CONSTRAINT `blog_post_views_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- DOWN
SELECT 1;
