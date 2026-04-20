-- UP
-- Align quote_requests with src/lib/quotes.ts (getQuoteById, admin list) — older DBs lacked these columns.

ALTER TABLE `quote_requests`
  ADD COLUMN `priority` ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal' AFTER `status`;

ALTER TABLE `quote_requests`
  ADD COLUMN `internal_notes` TEXT NULL AFTER `priority`;

ALTER TABLE `quote_requests`
  ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `submitted_at`;

-- DOWN
ALTER TABLE `quote_requests` DROP COLUMN `updated_at`;
ALTER TABLE `quote_requests` DROP COLUMN `internal_notes`;
ALTER TABLE `quote_requests` DROP COLUMN `priority`;
