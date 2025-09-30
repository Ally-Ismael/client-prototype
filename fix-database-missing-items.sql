-- Fix Missing Database Items for JobScooter
-- Run this in phpMyAdmin -> Your Database -> SQL

-- 1. Add missing public_profile_url column to applicants table
ALTER TABLE applicants 
ADD COLUMN public_profile_url VARCHAR(255) NULL AFTER email;

-- 2. Create missing subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    status ENUM('active', 'unsubscribed', 'pending') DEFAULT 'active',
    subscription_type ENUM('free', 'premium', 'enterprise') DEFAULT 'free',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_subscription_type (subscription_type)
);

-- 3. Create subscriber_statistics view (if it doesn't exist)
CREATE OR REPLACE VIEW subscriber_statistics AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscribers,
    COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed_subscribers,
    COUNT(CASE WHEN subscription_type = 'free' THEN 1 END) as free_subscribers,
    COUNT(CASE WHEN subscription_type = 'premium' THEN 1 END) as premium_subscribers,
    COUNT(CASE WHEN subscription_type = 'enterprise' THEN 1 END) as enterprise_subscribers
FROM subscribers;

-- 4. Create applicant_profiles_with_scores view (if it doesn't exist)
CREATE OR REPLACE VIEW applicant_profiles_with_scores AS
SELECT 
    a.id,
    a.first_name,
    a.surname,
    a.email,
    a.public_profile_url,
    a.id_verified,
    a.email_verified,
    a.application_completed,
    a.created_at,
    a.updated_at,
    -- Calculate basic scores (you can adjust these formulas)
    CASE 
        WHEN a.id_verified = 1 AND a.email_verified = 1 AND a.application_completed = 1 THEN 'green'
        WHEN a.id_verified = 1 OR a.email_verified = 1 THEN 'yellow'
        ELSE 'red'
    END as profile_status,
    -- Basic completion percentage
    ROUND(
        (
            (CASE WHEN a.id_verified = 1 THEN 25 ELSE 0 END) +
            (CASE WHEN a.email_verified = 1 THEN 25 ELSE 0 END) +
            (CASE WHEN a.application_completed = 1 THEN 50 ELSE 0 END)
        ), 0
    ) as completion_percentage
FROM applicants a;

-- 5. Add any other missing columns that might be referenced
-- Add profile picture path if missing
ALTER TABLE applicants 
ADD COLUMN profile_picture_path VARCHAR(500) NULL AFTER public_profile_url;

-- Add video introduction path if missing
ALTER TABLE applicants 
ADD COLUMN video_introduction_path VARCHAR(500) NULL AFTER profile_picture_path;

-- Add completion status if missing
ALTER TABLE applicants 
ADD COLUMN completion_status ENUM('red', 'yellow', 'green') DEFAULT 'red' AFTER video_introduction_path;

-- Add completion percentage if missing
ALTER TABLE applicants 
ADD COLUMN completion_percentage INT DEFAULT 0 AFTER completion_status;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(completion_status);
CREATE INDEX IF NOT EXISTS idx_applicants_verified ON applicants(id_verified, email_verified);
CREATE INDEX IF NOT EXISTS idx_applicants_completed ON applicants(application_completed);

-- 7. Insert sample subscriber data (optional, for testing)
INSERT IGNORE INTO subscribers (email, name, status, subscription_type) VALUES
('admin@jobscooter.com', 'Admin User', 'active', 'enterprise'),
('test@jobscooter.com', 'Test User', 'active', 'free');

COMMIT;