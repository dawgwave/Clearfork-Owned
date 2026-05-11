-- UP
-- OAuth-linked accounts (Google, Apple). Users may have no password when OAuth-only
CREATE TABLE IF NOT EXISTS `oauth_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `provider_account_id` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_oauth_provider_account` (`provider`, `provider_account_id`),
  KEY `idx_oauth_user` (`user_id`),
  CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Allow OAuth-only users (no local password)
ALTER TABLE `users` MODIFY `password_hash` VARCHAR(255) NULL;

-- DOWN
DROP TABLE IF EXISTS `oauth_accounts`;
-- password_hash may remain NULL for rows created before rollback; re-run ALTER manually if you must restore NOT NULL
