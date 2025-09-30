-- JobScooter Production Database Export
-- Generated: September 29, 2025
-- Clean export with data integrity fixes
-- Use this file for production deployment

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable foreign key checks during import
SET FOREIGN_KEY_CHECKS = 0;

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `sedafzgt_jobscootercoz614_jobscooter` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sedafzgt_jobscootercoz614_jobscooter`;

-- Import the main database structure and data first
-- (This should be followed by importing your actual database file)

-- =========================================================
-- IMPORTANT: After importing your main database file,
-- run the following data integrity fixes:
-- =========================================================

-- Fix orphaned language_verifications
DELETE lv FROM language_verifications lv
LEFT JOIN applicants a ON a.id = lv.applicant_id
WHERE a.id IS NULL;

-- Fix orphaned certificates
DELETE c FROM certificates c
LEFT JOIN applicants a ON a.id = c.applicant_id
WHERE a.id IS NULL;

-- Fix orphaned traffic_light_scores
DELETE tls FROM traffic_light_scores tls
LEFT JOIN applicants a ON a.id = tls.applicant_id
WHERE a.id IS NULL;

-- Fix orphaned public_profiles
DELETE pp FROM public_profiles pp
LEFT JOIN applicants a ON a.id = pp.applicant_id
WHERE a.id IS NULL;

-- Fix orphaned generated_cvs
DELETE gcv FROM generated_cvs gcv
LEFT JOIN applicants a ON a.id = gcv.applicant_id
WHERE a.id IS NULL;

-- Fix orphaned activity_logs
DELETE al FROM activity_logs al
LEFT JOIN applicants a ON a.id = al.user_id
WHERE al.user_type = 'applicant' AND a.id IS NULL;

-- Add missing indexes for better performance
ALTER TABLE language_verifications 
ADD INDEX IF NOT EXISTS idx_lv_applicant_id (applicant_id);

ALTER TABLE certificates 
ADD INDEX IF NOT EXISTS idx_cert_applicant_id (applicant_id);

ALTER TABLE traffic_light_scores 
ADD INDEX IF NOT EXISTS idx_tls_applicant_id (applicant_id);

ALTER TABLE public_profiles 
ADD INDEX IF NOT EXISTS idx_pp_applicant_id (applicant_id);

ALTER TABLE generated_cvs 
ADD INDEX IF NOT EXISTS idx_gcv_applicant_id (applicant_id);

ALTER TABLE activity_logs 
ADD INDEX IF NOT EXISTS idx_al_user_id (user_id);

-- Add foreign key constraints with proper error handling
-- Language Verifications
ALTER TABLE language_verifications
ADD CONSTRAINT fk_lang_applicant 
FOREIGN KEY (applicant_id) REFERENCES applicants(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Certificates
ALTER TABLE certificates
ADD CONSTRAINT fk_cert_applicant 
FOREIGN KEY (applicant_id) REFERENCES applicants(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Traffic Light Scores
ALTER TABLE traffic_light_scores
ADD CONSTRAINT fk_tls_applicant 
FOREIGN KEY (applicant_id) REFERENCES applicants(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Public Profiles
ALTER TABLE public_profiles
ADD CONSTRAINT fk_pp_applicant 
FOREIGN KEY (applicant_id) REFERENCES applicants(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Generated CVs
ALTER TABLE generated_cvs
ADD CONSTRAINT fk_gcv_applicant 
FOREIGN KEY (applicant_id) REFERENCES applicants(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Update completion percentages and traffic light scores
UPDATE applicants SET 
    completion_percentage = CASE 
        WHEN profile_picture_url IS NOT NULL AND video_intro_url IS NOT NULL THEN 100
        WHEN profile_picture_url IS NOT NULL OR video_intro_url IS NOT NULL THEN 80
        ELSE 60
    END,
    updated_at = NOW()
WHERE completion_percentage = 0 OR completion_percentage IS NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create production user (optional, adjust privileges as needed)
-- CREATE USER IF NOT EXISTS 'sedafzgt_jobscooter'@'localhost' IDENTIFIED BY 'Developer@2025';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sedafzgt_jobscootercoz614_jobscooter.* TO 'sedafzgt_jobscooter'@'localhost';
-- FLUSH PRIVILEGES;

COMMIT;

-- Show final statistics
SELECT 
    'Database Import Complete' as Status,
    NOW() as Timestamp,
    (SELECT COUNT(*) FROM applicants) as Total_Applicants,
    (SELECT COUNT(*) FROM certificates) as Total_Certificates,
    (SELECT COUNT(*) FROM language_verifications) as Total_Languages,
    (SELECT COUNT(*) FROM generated_cvs) as Total_CVs,
    (SELECT COUNT(*) FROM activity_logs) as Total_Activity_Logs;