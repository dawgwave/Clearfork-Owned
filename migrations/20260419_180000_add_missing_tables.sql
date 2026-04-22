-- UP
-- Legacy `quotes` table (20260418) had no quote_number — add it before backfilling
SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=@db AND TABLE_NAME='quotes') = 0,
    'SELECT 1',
    IF(
      (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='quotes' AND COLUMN_NAME='quote_number') > 0,
      'SELECT 1',
      'ALTER TABLE `quotes` ADD COLUMN `quote_number` VARCHAR(50) NULL AFTER `id`'
    )
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `quotes`
SET `quote_number` = CONCAT('QTE-', YEAR(submitted_at), '-', LPAD(id, 6, '0'))
WHERE (`quote_number` IS NULL OR `quote_number` = '');

-- Create quote_updates table for tracking status changes (if not exists)
CREATE TABLE IF NOT EXISTS `quote_updates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quote_id` INT NOT NULL,
  `updated_by` INT NOT NULL,
  `field_name` VARCHAR(100) NOT NULL,
  `old_value` TEXT,
  `new_value` TEXT,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_quote_id` (`quote_id`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notifications table for user alerts (if not exists)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `data` JSON NULL,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_read_at` (`read_at`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat rows are created in 20260419_220000_create_quote_chat_tables.sql (chats did not exist here)

-- DOWN
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `quote_updates`;
