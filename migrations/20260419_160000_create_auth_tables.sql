-- UP
-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `phone` VARCHAR(20),
  `email_verified` BOOLEAN DEFAULT FALSE,
  `email_verification_token` VARCHAR(255),
  `password_reset_token` VARCHAR(255),
  `password_reset_expires` DATETIME,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_email` (`email`),
  INDEX `idx_email_verification_token` (`email_verification_token`),
  INDEX `idx_password_reset_token` (`password_reset_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create roles table (flexible for future account types)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `description` TEXT,
  `permissions` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_roles junction table (many-to-many for flexibility)
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `assigned_by` INT,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_user_role` (`user_id`, `role_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(128) PRIMARY KEY,
  `user_id` INT NOT NULL,
  `data` JSON,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_accessed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Align tables left behind by older mysql-init/setup-production-db.sql (CREATE IF NOT EXISTS skipped)
SET @db := DATABASE();

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='email_verification_token')=0, 'ALTER TABLE `users` ADD COLUMN `email_verification_token` VARCHAR(255) NULL', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='password_reset_token')=0, 'ALTER TABLE `users` ADD COLUMN `password_reset_token` VARCHAR(255) NULL', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='password_reset_expires')=0, 'ALTER TABLE `users` ADD COLUMN `password_reset_expires` DATETIME NULL', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='roles' AND COLUMN_NAME='permissions')=0, 'ALTER TABLE `roles` ADD COLUMN `permissions` JSON NULL', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='roles' AND COLUMN_NAME='updated_at')=0, 'ALTER TABLE `roles` ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='user_roles' AND COLUMN_NAME='assigned_by')=0, 'ALTER TABLE `user_roles` ADD COLUMN `assigned_by` INT NULL', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sessions' AND COLUMN_NAME='data')=0, 'ALTER TABLE `sessions` ADD COLUMN `data` JSON NULL', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sessions' AND COLUMN_NAME='last_accessed_at')=0, 'ALTER TABLE `sessions` ADD COLUMN `last_accessed_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert default roles (upsert for rows already created by mysql-init INSERT IGNORE)
INSERT INTO `roles` (`name`, `description`, `permissions`) VALUES 
('admin', 'Administrator with full system access', JSON_OBJECT(
  'users', JSON_ARRAY('create', 'read', 'update', 'delete'),
  'quotes', JSON_ARRAY('create', 'read', 'update', 'delete'),
  'blogs', JSON_ARRAY('create', 'read', 'update', 'delete'),
  'system', JSON_ARRAY('manage')
)),
('user', 'Regular user with limited access', JSON_OBJECT(
  'quotes', JSON_ARRAY('create', 'read'),
  'profile', JSON_ARRAY('read', 'update')
)),
('agent', 'Insurance agent with quote management access', JSON_OBJECT(
  'quotes', JSON_ARRAY('create', 'read', 'update'),
  'clients', JSON_ARRAY('create', 'read', 'update')
))
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `permissions` = VALUES(`permissions`),
  `updated_at` = CURRENT_TIMESTAMP;

-- DOWN
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
