-- UP
-- Align quote_requests with src/lib/quotes.ts — idempotent for DBs that already have these columns (e.g. from mysql-init).

SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'priority') = 0,
    'ALTER TABLE `quote_requests` ADD COLUMN `priority` ENUM(''low'', ''normal'', ''high'', ''urgent'') NOT NULL DEFAULT ''normal'' AFTER `status`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'internal_notes') = 0,
    'ALTER TABLE `quote_requests` ADD COLUMN `internal_notes` TEXT NULL AFTER `priority`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE `quote_requests` ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `submitted_at`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- DOWN
SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'updated_at') > 0,
    'ALTER TABLE `quote_requests` DROP COLUMN `updated_at`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'internal_notes') > 0,
    'ALTER TABLE `quote_requests` DROP COLUMN `internal_notes`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'priority') > 0,
    'ALTER TABLE `quote_requests` DROP COLUMN `priority`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
