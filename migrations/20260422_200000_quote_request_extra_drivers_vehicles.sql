-- UP
CREATE TABLE IF NOT EXISTS `quote_request_extra_drivers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quote_request_id` INT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE NULL,
  `marital_status` ENUM('single', 'married', 'separated', 'divorced', 'widowed') NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `driver_license_number` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_qr_extra_drivers_quote` (`quote_request_id`),
  CONSTRAINT `fk_qr_extra_drivers_quote` FOREIGN KEY (`quote_request_id`) REFERENCES `quote_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quote_request_extra_vehicles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quote_request_id` INT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `vin_number` VARCHAR(32) NOT NULL,
  `vehicle_use` ENUM('business', 'commute', 'pleasure') NULL,
  `estimated_annual_mileage` INT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_qr_extra_vehicles_quote` (`quote_request_id`),
  CONSTRAINT `fk_qr_extra_vehicles_quote` FOREIGN KEY (`quote_request_id`) REFERENCES `quote_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
DROP TABLE IF EXISTS `quote_request_extra_vehicles`;
DROP TABLE IF EXISTS `quote_request_extra_drivers`;
