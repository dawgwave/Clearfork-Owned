-- UP
-- quote line type + JSON details for non-auto quote requests
SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'quote_type') = 0,
    'ALTER TABLE `quote_requests` ADD COLUMN `quote_type` VARCHAR(64) NULL AFTER `quote_number`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'details_json') = 0,
    'ALTER TABLE `quote_requests` ADD COLUMN `details_json` JSON NULL AFTER `quote_type`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `quote_requests` SET `quote_type` = 'auto' WHERE `quote_type` IS NULL;

SET @idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND INDEX_NAME = 'idx_quote_requests_quote_type'
);
SET @sql := IF(
  @idx = 0,
  'CREATE INDEX `idx_quote_requests_quote_type` ON `quote_requests` (`quote_type`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- DOWN
SET @db := DATABASE();

SET @idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND INDEX_NAME = 'idx_quote_requests_quote_type'
);
SET @sql := IF(
  @idx > 0,
  'ALTER TABLE `quote_requests` DROP INDEX `idx_quote_requests_quote_type`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'details_json') > 0,
    'ALTER TABLE `quote_requests` DROP COLUMN `details_json`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'quote_type') > 0,
    'ALTER TABLE `quote_requests` DROP COLUMN `quote_type`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
