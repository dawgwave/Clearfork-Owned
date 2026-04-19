-- UP
-- Quote chat: required by /api/quotes/[id]/chat and src/lib/quotes.ts (was never created in earlier migrations)

CREATE TABLE IF NOT EXISTS `chats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quote_id` INT NOT NULL,
  `status` ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_chats_quote_id` (`quote_id`),
  CONSTRAINT `fk_chats_quote_requests` FOREIGN KEY (`quote_id`) REFERENCES `quote_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `chat_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `message_type` ENUM('text', 'system', 'quote_update') NOT NULL DEFAULT 'text',
  `message` TEXT NOT NULL,
  `metadata` JSON NULL,
  `is_internal` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_chat_messages_chat_id` (`chat_id`),
  KEY `idx_chat_messages_sender_id` (`sender_id`),
  KEY `idx_chat_messages_created_at` (`created_at`),
  CONSTRAINT `fk_chat_messages_chat` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_attachments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `message_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `upload_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_chat_attachments_message_id` (`message_id`),
  CONSTRAINT `fk_chat_attachments_message` FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_attachments_uploader` FOREIGN KEY (`upload_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `chats` (`quote_id`)
SELECT `id` FROM `quote_requests` `qr` WHERE NOT EXISTS (
  SELECT 1 FROM `chats` `c` WHERE `c`.`quote_id` = `qr`.`id`
);

-- DOWN
DROP TABLE IF EXISTS `chat_attachments`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chats`;
