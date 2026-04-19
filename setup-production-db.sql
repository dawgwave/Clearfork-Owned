-- Setup script for production database
-- This combines all the necessary migrations

-- Create migrations table
CREATE TABLE IF NOT EXISTS migrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Create quotes table (20260418_140000_create_quotes_table.sql)
CREATE TABLE IF NOT EXISTS quote_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    quote_number VARCHAR(50) NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    marital_status ENUM('single', 'married', 'divorced', 'widowed') NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    can_receive_texts BOOLEAN NOT NULL DEFAULT FALSE,
    email_address VARCHAR(255) NOT NULL,
    driver_license_number VARCHAR(50) NOT NULL,
    social_security_number VARCHAR(11) NOT NULL,
    additional_driver_first_name VARCHAR(100) NULL,
    additional_driver_last_name VARCHAR(100) NULL,
    additional_driver_dob DATE NULL,
    additional_driver_license VARCHAR(50) NULL,
    vin_number VARCHAR(17) NOT NULL,
    vehicle_use ENUM('business', 'commute', 'pleasure') NOT NULL,
    estimated_annual_mileage INT NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    military_service BOOLEAN NOT NULL DEFAULT FALSE,
    is_student BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_agent_id INT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);

-- Migration: Create auth tables (20260419_160000_create_auth_tables.sql)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Migration: Add missing tables (20260419_180000_add_missing_tables.sql)
CREATE TABLE IF NOT EXISTS quote_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quote_id INT NOT NULL,
    user_id INT NOT NULL,
    agent_id INT NULL,
    message TEXT NOT NULL,
    message_type ENUM('user', 'agent', 'system') NOT NULL,
    attachments JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quote_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quote_id (quote_id),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

-- Migration: Create blog posts table (20260419_145816_create_blog_posts_table.sql)
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    author_id INT NOT NULL,
    category VARCHAR(100),
    tags JSON,
    featured_image VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_category (category),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_post_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_viewed_at (viewed_at)
);

-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES 
('user', 'Regular user'),
('admin', 'Administrator');

-- Record migrations as applied
INSERT IGNORE INTO migrations (name) VALUES 
('20260418_140000_create_quotes_table.sql'),
('20260419_160000_create_auth_tables.sql'),
('20260419_180000_add_missing_tables.sql'),
('20260419_145816_create_blog_posts_table.sql');