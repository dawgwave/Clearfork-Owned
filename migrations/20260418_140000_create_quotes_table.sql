-- UP
-- Create quotes table to replace NocoDB storage
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE,
  `marital_status` VARCHAR(50),
  `gender` VARCHAR(20),
  `street_address` VARCHAR(255),
  `state` VARCHAR(50),
  `zip_code` VARCHAR(10),
  `phone_number` VARCHAR(15),
  `can_receive_texts` BOOLEAN DEFAULT FALSE,
  `email_address` VARCHAR(255),
  `driver_license_number` VARCHAR(50),
  `social_security_number` VARCHAR(15),
  `additional_driver_first_name` VARCHAR(100),
  `additional_driver_last_name` VARCHAR(100),
  `additional_driver_dob` DATE,
  `additional_driver_license` VARCHAR(50),
  `vin_number` VARCHAR(20),
  `vehicle_use` VARCHAR(100),
  `estimated_annual_mileage` INT,
  `occupation` VARCHAR(100),
  `military_service` VARCHAR(50),
  `is_student` BOOLEAN DEFAULT FALSE,
  `status` VARCHAR(50) DEFAULT 'New',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_submitted_at` (`submitted_at`),
  INDEX `idx_status` (`status`),
  INDEX `idx_email` (`email_address`),
  INDEX `idx_phone` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
DROP TABLE IF EXISTS `quotes`;