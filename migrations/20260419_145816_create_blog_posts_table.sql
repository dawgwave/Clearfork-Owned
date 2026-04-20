-- UP
-- Create blog_posts table for database-driven blog system
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `content_format` ENUM('markdown', 'html') DEFAULT 'markdown',
  `author_id` INT,
  `category` VARCHAR(100),
  `tags` JSON,
  `featured_image_url` VARCHAR(500),
  `meta_description` TEXT,
  `is_published` BOOLEAN DEFAULT FALSE,
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_slug` (`slug`),
  INDEX `idx_published` (`is_published`, `published_at`),
  INDEX `idx_author` (`author_id`),
  INDEX `idx_category` (`category`),
  
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create blog_post_views table for analytics (optional)
CREATE TABLE IF NOT EXISTS `blog_post_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `blog_post_id` INT NOT NULL,
  `user_id` INT NULL,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_blog_post` (`blog_post_id`),
  INDEX `idx_viewed_at` (`viewed_at`),
  
  FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- Drop tables in reverse order
DROP TABLE IF EXISTS `blog_post_views`;
DROP TABLE IF EXISTS `blog_posts`;
