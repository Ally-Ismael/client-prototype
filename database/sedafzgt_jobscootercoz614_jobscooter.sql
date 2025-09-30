-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2025 at 08:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sedafzgt_jobscootercoz614_jobscooter`
--

-- --------------------------------------------------------

--
-- Table structure for table `accredited_institutions`
--

CREATE TABLE `accredited_institutions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `type` enum('university','institute','college','certification_body','government') DEFAULT 'university',
  `accreditation_body` varchar(255) DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `verification_patterns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_patterns`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accredited_institutions`
--

INSERT INTO `accredited_institutions` (`id`, `name`, `country`, `type`, `accreditation_body`, `website_url`, `verification_patterns`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'University of Cape Town', 'South Africa', 'university', NULL, 'https://www.uct.ac.za', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(2, 'University of the Witwatersrand', 'South Africa', 'university', NULL, 'https://www.wits.ac.za', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(3, 'Stellenbosch University', 'South Africa', 'university', NULL, 'https://www.sun.ac.za', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(4, 'University of Pretoria', 'South Africa', 'university', NULL, 'https://www.up.ac.za', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(5, 'Rhodes University', 'South Africa', 'university', NULL, 'https://www.ru.ac.za', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(6, 'University of Namibia', 'Namibia', 'university', NULL, 'https://www.unam.edu.na', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(7, 'Goethe Institut', 'Germany', 'certification_body', NULL, 'https://www.goethe.de', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(8, 'TestDaF Institute', 'Germany', 'certification_body', NULL, 'https://www.testdaf.de', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(9, 'TELC', 'Germany', 'certification_body', NULL, 'https://www.telc.net', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(10, 'Cambridge Assessment English', 'United Kingdom', 'certification_body', NULL, 'https://www.cambridgeenglish.org', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(11, 'British Council', 'United Kingdom', 'certification_body', NULL, 'https://www.britishcouncil.org', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(12, 'Microsoft', 'United States', 'certification_body', NULL, 'https://www.microsoft.com', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(13, 'Google', 'United States', 'certification_body', NULL, 'https://www.google.com', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(14, 'Amazon Web Services', 'United States', 'certification_body', NULL, 'https://aws.amazon.com', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39'),
(15, 'Cisco', 'United States', 'certification_body', NULL, 'https://www.cisco.com', NULL, 1, '2025-09-26 18:44:39', '2025-09-26 18:44:39');

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('applicant','employer','admin') DEFAULT 'applicant',
  `activity_type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `user_type`, `activity_type`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg2rvoyi_aa0h\"}', NULL, NULL, '2025-09-27 21:18:08'),
(2, 1, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-27T21:18:41.949Z\"}', NULL, NULL, '2025-09-27 21:18:41'),
(3, 1, 'applicant', 'media_upload', 'Profile picture uploaded', '{\"filename\":\"1759008395367-9d12f86f-3d14-4cc8-b4bd-b3c6d680743c.jpg\",\"url\":\"/uploads/media/1759008395367-9d12f86f-3d14-4cc8-b4bd-b3c6d680743c.jpg\"}', NULL, NULL, '2025-09-27 21:26:35'),
(4, 2, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg2tp5lm_urmn\"}', NULL, NULL, '2025-09-27 22:09:03'),
(5, 2, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-27T22:10:17.410Z\"}', NULL, NULL, '2025-09-27 22:10:17'),
(6, 3, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg2ur705_nuc3\"}', NULL, NULL, '2025-09-27 22:38:37'),
(7, 3, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-27T22:39:52.587Z\"}', NULL, NULL, '2025-09-27 22:39:52'),
(8, 4, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg2vjhy2_nmg6\"}', NULL, NULL, '2025-09-27 23:00:38'),
(9, 4, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-27T23:03:42.288Z\"}', NULL, NULL, '2025-09-27 23:03:42'),
(10, 5, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg2w1x5a_ujlt\"}', NULL, NULL, '2025-09-27 23:14:57'),
(11, 5, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-27T23:15:25.034Z\"}', NULL, NULL, '2025-09-27 23:15:25'),
(12, 5, 'applicant', 'media_upload', 'Profile picture uploaded', '{\"filename\":\"1759016445911-c1973b6d-0fba-4c9e-b91b-cf3001b31595.jpg\",\"url\":\"/uploads/media/1759016445911-c1973b6d-0fba-4c9e-b91b-cf3001b31595.jpg\"}', NULL, NULL, '2025-09-27 23:40:46'),
(13, 6, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.52,\"username\":\"js_mg30ma4j_s3zv\"}', NULL, NULL, '2025-09-28 01:22:46'),
(14, 6, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-28T01:23:31.561Z\"}', NULL, NULL, '2025-09-28 01:23:31'),
(15, 7, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg3t4xjc_teoy\"}', NULL, NULL, '2025-09-28 14:41:05'),
(16, 8, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.95,\"username\":\"js_mg3wtwiu_945w\"}', NULL, NULL, '2025-09-28 16:24:29'),
(17, 9, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg3wx0no_82yd\"}', NULL, NULL, '2025-09-28 16:26:54'),
(18, 9, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-28T16:29:01.681Z\"}', NULL, NULL, '2025-09-28 16:29:01'),
(19, 9, 'applicant', 'profile_picture_updated', 'Profile picture updated', '{\"filename\":\"profile_9_1759077064864.jpg\",\"originalName\":\"my pic.jpg\",\"size\":4259606}', NULL, NULL, '2025-09-28 16:31:04'),
(20, 10, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg3ykubl_h59n\"}', NULL, NULL, '2025-09-28 17:13:25'),
(21, 11, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg44yudn_u4v8\"}', NULL, NULL, '2025-09-28 20:12:16'),
(22, 12, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":1,\"username\":\"js_mg458juc_ekmj\"}', NULL, NULL, '2025-09-28 20:19:49'),
(23, 12, 'applicant', 'profile_picture_updated', 'Profile picture updated', '{\"filename\":\"profile_12_1759090851954.jpeg\",\"originalName\":\"WhatsApp Image 2025-09-18 at 18.08.00 (2).jpeg\",\"size\":74269}', NULL, NULL, '2025-09-28 20:20:51'),
(24, 13, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4ggvpj_8ra1\"}', NULL, NULL, '2025-09-29 01:34:14'),
(25, 13, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-29T01:35:08.574Z\"}', NULL, NULL, '2025-09-29 01:35:08'),
(26, 14, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4hg0rr_0ce4\"}', NULL, NULL, '2025-09-29 02:01:33'),
(27, 14, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-29T02:03:28.600Z\"}', NULL, NULL, '2025-09-29 02:03:28'),
(28, 15, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4i2v3x_guyn\"}', NULL, NULL, '2025-09-29 02:19:19'),
(29, 15, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-29T02:19:41.503Z\"}', NULL, NULL, '2025-09-29 02:19:41'),
(30, 16, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4ik20r_g7t7\"}', NULL, NULL, '2025-09-29 02:32:41'),
(31, 17, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4jf0t0_18z4\"}', NULL, NULL, '2025-09-29 02:56:46'),
(32, 18, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4jss74_2fvw\"}', NULL, NULL, '2025-09-29 03:07:28'),
(33, 18, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-29T03:07:56.929Z\"}', NULL, NULL, '2025-09-29 03:07:56'),
(34, 19, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4kxo4h_m2ov\"}', NULL, NULL, '2025-09-29 03:39:15'),
(35, 20, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4lzk8v_vmdc\"}', NULL, NULL, '2025-09-29 04:08:43'),
(36, 21, 'applicant', 'account_created', 'Account created successfully', '{\"method\":\"id_extraction\",\"confidence\":0.8,\"username\":\"js_mg4ng193_obf6\"}', NULL, NULL, '2025-09-29 04:49:31'),
(37, 21, 'applicant', 'email_verified', 'Email address verified successfully', '{\"verified_at\":\"2025-09-29T04:50:43.199Z\"}', NULL, NULL, '2025-09-29 04:50:43'),
(38, 21, 'applicant', 'media_upload', 'Profile picture uploaded', '{\"filename\":\"1759121530609-9e3bf45f-45b4-42fc-8bd6-444a8230d6c4.jpg\",\"url\":\"/uploads/media/1759121530609-9e3bf45f-45b4-42fc-8bd6-444a8230d6c4.jpg\"}', NULL, NULL, '2025-09-29 04:52:10'),
(39, 21, 'applicant', 'media_upload', 'Video introduction uploaded', '{\"filename\":\"1759121577627-18117fb1-822b-45f1-af5e-cad4a7931670.webm\",\"url\":\"/uploads/media/1759121577627-18117fb1-822b-45f1-af5e-cad4a7931670.webm\",\"has_transcription\":true}', NULL, NULL, '2025-09-29 04:53:02'),
(40, 21, 'applicant', 'cv_generated', 'CV generated successfully', '{\"cvId\":\"1395041d-8cba-4ffe-b2d1-2f445a314b49\",\"template\":\"professional\",\"format\":\"html\",\"filename\":\"cv_21_1395041d-8cba-4ffe-b2d1-2f445a314b49.html\",\"sections\":8}', NULL, NULL, '2025-09-29 04:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'South Africa',
  `nationality` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `id_extraction_confidence` decimal(3,2) DEFAULT 0.80,
  `manual_id_entry` tinyint(1) DEFAULT 0,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `video_intro_url` varchar(500) DEFAULT NULL,
  `video_transcript` text DEFAULT NULL,
  `auto_cv_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `preferred_name` varchar(100) DEFAULT NULL,
  `status` enum('pending_verification','active','suspended','deleted') DEFAULT 'pending_verification',
  `completion_percentage` int(11) DEFAULT 0,
  `traffic_light_status` enum('red','yellow','green') DEFAULT 'red',
  `traffic_light_score` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`id`, `username`, `password_hash`, `first_name`, `surname`, `email`, `phone`, `country`, `nationality`, `date_of_birth`, `gender`, `id_number`, `id_extraction_confidence`, `manual_id_entry`, `profile_picture_url`, `video_intro_url`, `video_transcript`, `auto_cv_url`, `bio`, `preferred_name`, `status`, `completion_percentage`, `traffic_light_status`, `traffic_light_score`, `is_verified`, `email_verification_token`, `verification_token_expires`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `address`) VALUES
(21, 'js_mg4ng193_obf6', '$2a$12$7sSwlo1qZF7egPx6xCxgjOK9tsp9z6Eo.jxhkBZGfbtRjMFbRkwx.', 'ISMAEL', 'MUDJANIMA', 'mudjanimaismael100@gmail.com', '+264818342686', 'Namibia', 'Namibian', '2002-11-15', 'Male', '02 1115 0030 5', 0.80, 0, '/uploads/media/1759121530609-9e3bf45f-45b4-42fc-8bd6-444a8230d6c4.jpg', '/uploads/media/1759121577627-18117fb1-822b-45f1-af5e-cad4a7931670.webm', 'Hello, my name is John Doe. I am a software developer with 5 years of experience in web development. I specialize in JavaScript, React, and Node.js. I am passionate about creating user-friendly applications and solving complex problems. Thank you for considering my application.', '/uploads/cvs/cv_21_1395041d-8cba-4ffe-b2d1-2f445a314b49.html', NULL, 'Ismael', 'active', 100, 'red', 20, 1, NULL, NULL, '2025-09-29 06:50:43', NULL, '2025-09-29 04:49:31', '2025-09-29 06:06:15', 'Daan Bekker\nAusspannplatz');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_privacy_settings`
--

CREATE TABLE `applicant_privacy_settings` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `profile_visibility` enum('public','subscribers','private') DEFAULT 'public',
  `show_contact_info_to_subscribers` tinyint(1) DEFAULT 1,
  `show_certificates_to_public` tinyint(1) DEFAULT 0,
  `show_full_cv_to_subscribers` tinyint(1) DEFAULT 1,
  `allow_contact_requests` tinyint(1) DEFAULT 1,
  `auto_accept_contact_from_verified` tinyint(1) DEFAULT 0,
  `public_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`public_fields`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_sessions`
--

CREATE TABLE `application_sessions` (
  `id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `step_completed` int(11) DEFAULT 0,
  `extracted_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extracted_data`)),
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `application_sessions`
--

INSERT INTO `application_sessions` (`id`, `session_token`, `step_completed`, `extracted_data`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'test-session-token', 0, NULL, '2025-09-28 23:12:41', '2025-09-27 21:12:41', '2025-09-27 21:12:41'),
(2, 'e7e87799-3821-4dc2-af17-9985e638739d', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-28 21:16:52', '2025-09-27 21:16:52', '2025-09-27 21:18:13'),
(3, '7785393b-2404-43f9-bf05-85de8a90f278', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-28 22:07:46', '2025-09-27 22:07:46', '2025-09-27 22:09:05'),
(4, '7fd155a3-8755-4760-bf7c-418a508a5c51', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-28 22:37:44', '2025-09-27 22:37:44', '2025-09-27 22:38:39'),
(5, '9886db15-9e52-44fb-9df2-d2d35631aa54', 0, NULL, '2025-09-28 22:55:54', '2025-09-27 22:55:54', '2025-09-27 22:55:54'),
(6, 'cf490918-05e9-484d-8516-9f3ee1b5dd17', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-28 22:59:50', '2025-09-27 22:59:50', '2025-09-27 23:00:40'),
(7, '48ed995a-c1bd-4a34-88d0-4e0bf949da0c', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ngeno\",\"confidence\":1,\"manual_entry\":false}', '2025-09-28 23:14:02', '2025-09-27 23:14:02', '2025-09-27 23:15:00'),
(8, 'ac45cd6d-a5c3-469f-b2f0-d810dd805cf1', 1, '{\"first_name\":\"IEE\",\"surname\":\"MUDJANIMA\",\"email\":\"allyismael2002@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"REPUBLIC OF NAMIBIA\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ngeno\",\"confidence\":0.52,\"manual_entry\":false}', '2025-09-29 01:22:01', '2025-09-28 01:22:01', '2025-09-28 01:22:48'),
(9, '0e3922fb-307a-4f5c-9151-b30d4158b9ac', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-29 14:39:06', '2025-09-28 14:39:06', '2025-09-28 14:41:08'),
(10, '14f4f14d-794e-4f05-94a6-db6e9735be40', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-29 16:26:16', '2025-09-28 16:26:16', '2025-09-28 16:26:57'),
(11, 'f5f88c43-fc78-4b43-8925-34f5181bb972', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-29 17:12:41', '2025-09-28 17:12:41', '2025-09-28 17:13:28'),
(12, 'a488197c-3b97-49ee-9a56-af06339da962', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-29 20:10:43', '2025-09-28 20:10:43', '2025-09-28 20:12:20'),
(13, '8cc4bf3f-191b-45b6-b652-c53a7754b2d5', 1, '{\"first_name\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"id_number\":\"02 1115 0030 5\",\"gender\":\"Male\",\"preferred_name\":\"Ismael\",\"confidence\":1,\"manual_entry\":false}', '2025-09-29 20:19:12', '2025-09-28 20:19:12', '2025-09-28 20:19:54'),
(14, 'a7dc11e4-a016-4167-9743-829b32f0f960', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"\",\"account_created\":true}', '2025-09-30 01:33:28', '2025-09-29 01:33:28', '2025-09-29 01:34:16'),
(15, 'ef7833de-cbaa-4cce-8645-3b50f4d4200e', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"\",\"account_created\":true}', '2025-09-30 02:00:55', '2025-09-29 02:00:55', '2025-09-29 02:01:35'),
(16, '3e0484d1-4452-42b7-a092-c996da1adca2', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 02:18:44', '2025-09-29 02:18:44', '2025-09-29 02:19:21'),
(17, 'aaadf773-e8e8-4ad4-aabf-0b8396c0d3de', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 02:32:12', '2025-09-29 02:32:12', '2025-09-29 02:32:43'),
(18, 'bf940f6e-8bbd-4eef-8e67-454d3c03a9f6', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 02:56:17', '2025-09-29 02:56:17', '2025-09-29 02:56:48'),
(19, 'a49d0407-0971-49cc-9a35-06f161d2951d', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 03:06:57', '2025-09-29 03:06:57', '2025-09-29 03:07:30'),
(20, 'a2b93310-1458-4619-9cd5-9bfe22ffd41a', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 03:38:47', '2025-09-29 03:38:47', '2025-09-29 03:39:17'),
(21, '98bd674f-6f16-4f16-a358-5a9982498f14', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 04:08:14', '2025-09-29 04:08:14', '2025-09-29 04:08:48'),
(22, 'd0bd0f8b-400f-43e8-9058-069b3c92f709', 1, '{\"firstName\":\"ISMAEL\",\"surname\":\"MUDJANIMA\",\"idNumber\":\"02 1115 0030 5\",\"dateOfBirth\":\"2002-11-15\",\"address\":\"Daan Bekker\\nAusspannplatz\",\"account_created\":true}', '2025-09-30 04:49:02', '2025-09-29 04:49:02', '2025-09-29 04:49:33');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `certificate_type` varchar(100) DEFAULT NULL,
  `document_classification` enum('degree','diploma','certificate','reference_letter','other') DEFAULT 'certificate',
  `extracted_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extracted_data`)),
  `institution_name` varchar(255) DEFAULT NULL,
  `field_of_study` varchar(255) DEFAULT NULL,
  `grade_level` varchar(100) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_accredited` tinyint(1) DEFAULT 0,
  `authenticity_score` int(11) DEFAULT 0,
  `validation_notes` text DEFAULT NULL,
  `processing_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `ai_confidence` decimal(3,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`id`, `applicant_id`, `original_filename`, `file_path`, `certificate_type`, `document_classification`, `extracted_data`, `institution_name`, `field_of_study`, `grade_level`, `date_issued`, `is_verified`, `is_accredited`, `authenticity_score`, `validation_notes`, `processing_status`, `file_size`, `mime_type`, `ai_confidence`, `created_at`, `updated_at`) VALUES
(1, 21, 'Paulus Kambinda - Advanced SQL.png', 'public\\uploads\\certificates\\1759121502551-cabb08d4-69bd-4176-a3d6-f8cfb830b28f.png', 'Certificate', '', NULL, 'Unknown', 'COMPLETION\n\nP KI\nHAS', NULL, NULL, 1, 0, 1, NULL, 'completed', 551847, 'image/png', 0.79, '2025-09-29 04:51:45', '2025-09-29 04:51:45');

-- --------------------------------------------------------

--
-- Table structure for table `cv_generations`
--

CREATE TABLE `cv_generations` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `cv_id` varchar(255) NOT NULL,
  `template` varchar(100) DEFAULT 'professional',
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `file_size` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_downloaded` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `document_type` enum('id_document','certificate','cv','other') DEFAULT 'other',
  `extracted_text` text DEFAULT NULL,
  `processing_status` enum('pending','processed','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `generated_cvs`
--

CREATE TABLE `generated_cvs` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `cv_id` varchar(255) NOT NULL,
  `template_type` enum('professional','creative','academic','technical') DEFAULT 'professional',
  `format` enum('html','pdf','json') DEFAULT 'html',
  `file_path` varchar(500) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `generation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`generation_data`)),
  `download_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `generated_cvs`
--

INSERT INTO `generated_cvs` (`id`, `applicant_id`, `cv_id`, `template_type`, `format`, `file_path`, `file_url`, `generation_data`, `download_count`, `created_at`, `updated_at`) VALUES
(1, 21, '1395041d-8cba-4ffe-b2d1-2f445a314b49', 'professional', 'html', 'public\\uploads\\cvs\\cv_21_1395041d-8cba-4ffe-b2d1-2f445a314b49.html', '/uploads/cvs/cv_21_1395041d-8cba-4ffe-b2d1-2f445a314b49.html', '{\"header\":{\"name\":\"ISMAEL MUDJANIMA\",\"email\":\"mudjanimaismael100@gmail.com\",\"phone\":\"+264818342686\",\"country\":\"South Africa\",\"profilePicture\":\"/uploads/media/1759121530609-9e3bf45f-45b4-42fc-8bd6-444a8230d6c4.jpg\"},\"summary\":\"Experienced professional with 1 verified qualification and proficiency in 1 language. Profile verified through JobScooter\'s AI-powered verification system, currently building a comprehensive professional profile.\",\"experience\":[],\"education\":[],\"skills\":[\"COMPLETION\\n\\nP KI\\nHAS\",\"English (Native)\"],\"languages\":[{\"language\":\"English\",\"level\":\"Native\",\"certificationType\":null,\"institution\":null,\"dateVerified\":null,\"verified\":1}],\"certifications\":[{\"name\":\" in COMPLETION\\n\\nP KI\\nHAS\",\"issuer\":\"Unknown\",\"date\":\"Unknown\",\"verified\":1}],\"trafficLightStatus\":{\"status\":\"red\",\"score\":20,\"verified\":false}}', 0, '2025-09-29 04:53:13', '2025-09-29 04:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `language_verifications`
--

CREATE TABLE `language_verifications` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `language` varchar(100) NOT NULL,
  `proficiency_level` enum('A1','A2','B1','B2','C1','C2','Native','Beginner','Intermediate','Advanced','Fluent') NOT NULL,
  `certificate_type` varchar(100) DEFAULT NULL,
  `institution_name` varchar(255) DEFAULT NULL,
  `certificate_file_path` varchar(500) DEFAULT NULL,
  `date_verified` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `certificate_level` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `language_verifications`
--

INSERT INTO `language_verifications` (`id`, `applicant_id`, `language`, `proficiency_level`, `certificate_type`, `institution_name`, `certificate_file_path`, `date_verified`, `is_verified`, `verification_notes`, `created_at`, `updated_at`, `certificate_level`) VALUES
(1, 18, 'English', 'Native', NULL, NULL, NULL, NULL, 1, NULL, '2025-09-29 03:41:01', '2025-09-29 03:41:01', NULL),
(2, 20, 'English', 'Native', NULL, NULL, NULL, NULL, 1, NULL, '2025-09-29 04:10:30', '2025-09-29 04:10:30', NULL),
(3, 21, 'English', 'Native', NULL, NULL, NULL, NULL, 1, NULL, '2025-09-29 04:51:33', '2025-09-29 04:51:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `profile_views`
--

CREATE TABLE `profile_views` (
  `id` int(11) NOT NULL,
  `profile_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `visitor_type` enum('public','employer','recruiter') DEFAULT 'public',
  `viewed_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`viewed_fields`)),
  `view_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `viewer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profile_views`
--

INSERT INTO `profile_views` (`id`, `profile_id`, `ip_address`, `user_agent`, `visitor_type`, `viewed_fields`, `view_timestamp`, `viewer_id`) VALUES
(1, 2, '192.168.1.160', NULL, 'public', NULL, '2025-09-02 22:23:33', NULL),
(2, 2, '192.168.1.191', NULL, 'public', NULL, '2025-09-19 22:23:33', NULL),
(3, 2, '192.168.1.1', NULL, 'public', NULL, '2025-09-16 22:23:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `public_profiles`
--

CREATE TABLE `public_profiles` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `profile_url_slug` varchar(100) NOT NULL,
  `public_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`public_fields`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `view_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `public_profiles`
--

INSERT INTO `public_profiles` (`id`, `applicant_id`, `profile_url_slug`, `public_fields`, `is_active`, `created_at`, `updated_at`, `view_count`) VALUES
(1, 1, 'ismael-mudjanima-xn9y', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-27 21:18:08', '2025-09-27 21:18:08', 0),
(2, 2, 'ismael-mudjanima-3ht2', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-27 22:09:02', '2025-09-27 22:09:02', 0),
(3, 3, 'ismael-mudjanima-flgh', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-27 22:38:37', '2025-09-27 22:38:37', 0),
(4, 4, 'ismael-mudjanima-90z6', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-27 23:00:38', '2025-09-27 23:00:38', 0),
(5, 5, 'ismael-mudjanima-drnd', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-27 23:14:57', '2025-09-27 23:14:57', 0),
(6, 6, 'iee-mudjanima-d6od', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 01:22:46', '2025-09-28 01:22:46', 0),
(7, 7, 'ismael-mudjanima-r8v6', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 14:41:05', '2025-09-28 14:41:05', 0),
(8, 8, 'test-user-2km6', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 16:24:29', '2025-09-28 16:24:29', 0),
(9, 9, 'ismael-mudjanima-rgvg', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 16:26:54', '2025-09-28 16:26:54', 0),
(10, 10, 'ismael-mudjanima-2zg2', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 17:13:25', '2025-09-28 17:13:25', 0),
(11, 11, 'ismael-mudjanima-hzk4', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 20:12:16', '2025-09-28 20:12:16', 0),
(12, 12, 'ismael-mudjanima-p51f', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-28 20:19:49', '2025-09-28 20:19:49', 0),
(13, 13, 'ismael-mudjanima-21mz', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 01:34:14', '2025-09-29 01:34:14', 0),
(14, 14, 'ismael-mudjanima-jquq', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 02:01:33', '2025-09-29 02:01:33', 0),
(15, 15, 'ismael-mudjanima-n2hn', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 02:19:19', '2025-09-29 02:19:19', 0),
(16, 16, 'ismael-mudjanima-nn68', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 02:32:41', '2025-09-29 02:32:41', 0),
(17, 17, 'ismael-mudjanima-ejyz', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 02:56:46', '2025-09-29 02:56:46', 0),
(18, 18, 'ismael-mudjanima-t1lf', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 03:07:28', '2025-09-29 03:07:28', 0),
(19, 19, 'ismael-mudjanima-8lz9', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 03:39:15', '2025-09-29 03:39:15', 0),
(20, 20, 'ismael-mudjanima-ob51', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 04:08:43', '2025-09-29 04:08:43', 0),
(21, 21, 'ismael-mudjanima-ts4v', '{\"visible_to_viewers\":[\"first_name\",\"traffic_light_status\",\"general_field\"],\"visible_to_subscribers\":[\"first_name\",\"surname\",\"email\",\"phone\",\"certificates\",\"languages\",\"profile_picture\",\"video_intro\",\"traffic_light_status\"]}', 1, '2025-09-29 04:49:31', '2025-09-29 04:49:31', 0);

-- --------------------------------------------------------

--
-- Table structure for table `traffic_light_scores`
--

CREATE TABLE `traffic_light_scores` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `identity_score` int(11) DEFAULT 0,
  `language_score` int(11) DEFAULT 0,
  `certificate_score` int(11) DEFAULT 0,
  `completeness_score` int(11) DEFAULT 0,
  `consistency_score` int(11) DEFAULT 0,
  `total_score` int(11) DEFAULT 0,
  `status` enum('red','yellow','green') DEFAULT 'red',
  `breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`breakdown`)),
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `traffic_light_scores`
--

INSERT INTO `traffic_light_scores` (`id`, `applicant_id`, `identity_score`, `language_score`, `certificate_score`, `completeness_score`, `consistency_score`, `total_score`, `status`, `breakdown`, `calculated_at`, `updated_at`) VALUES
(1, 1, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-27 21:18:08', '2025-09-27 21:18:08'),
(2, 2, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-27 22:09:03', '2025-09-27 22:09:03'),
(3, 3, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-27 22:38:37', '2025-09-27 22:38:37'),
(4, 4, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-27 23:00:38', '2025-09-27 23:00:38'),
(5, 5, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-27 23:14:57', '2025-09-27 23:14:57'),
(6, 6, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 01:22:46', '2025-09-28 01:22:46'),
(7, 7, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 14:41:05', '2025-09-28 14:41:05'),
(8, 8, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 16:24:29', '2025-09-28 16:24:29'),
(9, 9, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 16:26:54', '2025-09-28 16:26:54'),
(10, 10, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 17:13:25', '2025-09-28 17:13:25'),
(11, 11, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 20:12:16', '2025-09-28 20:12:16'),
(12, 12, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-28 20:19:49', '2025-09-28 20:19:49'),
(13, 13, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 01:34:14', '2025-09-29 01:34:14'),
(14, 14, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 02:01:33', '2025-09-29 02:01:33'),
(15, 15, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 02:19:19', '2025-09-29 02:19:19'),
(16, 16, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 02:32:41', '2025-09-29 02:32:41'),
(17, 17, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 02:56:46', '2025-09-29 02:56:46'),
(18, 18, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 03:07:28', '2025-09-29 03:07:28'),
(19, 19, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 03:39:15', '2025-09-29 03:39:15'),
(20, 20, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 04:08:43', '2025-09-29 04:08:43'),
(21, 21, 15, 0, 0, 5, 0, 20, 'red', NULL, '2025-09-29 04:49:31', '2025-09-29 04:49:31');

-- --------------------------------------------------------

--
-- Table structure for table `user_links`
--

CREATE TABLE `user_links` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `link_type` varchar(50) NOT NULL,
  `link_url` varchar(255) NOT NULL,
  `link_title` varchar(100) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_media`
--

CREATE TABLE `user_media` (
  `id` int(11) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `media_type` varchar(50) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `file_url` text NOT NULL,
  `file_size` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accredited_institutions`
--
ALTER TABLE `accredited_institutions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_country` (`name`,`country`),
  ADD KEY `type` (`type`),
  ADD KEY `country` (`country`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `user_type` (`user_type`),
  ADD KEY `activity_type` (`activity_type`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `idx_activity_logs_user_type` (`user_id`,`user_type`,`created_at`);

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_traffic_light` (`traffic_light_status`),
  ADD KEY `idx_completion` (`completion_percentage`),
  ADD KEY `idx_applicants_created_at` (`created_at`);

--
-- Indexes for table `applicant_privacy_settings`
--
ALTER TABLE `applicant_privacy_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_applicant` (`applicant_id`);

--
-- Indexes for table `application_sessions`
--
ALTER TABLE `application_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_expires` (`expires_at`),
  ADD KEY `idx_step` (`step_completed`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applicant` (`applicant_id`),
  ADD KEY `idx_classification` (`document_classification`),
  ADD KEY `idx_verified` (`is_verified`),
  ADD KEY `idx_status` (`processing_status`),
  ADD KEY `idx_certificates_created_at` (`created_at`);

--
-- Indexes for table `cv_generations`
--
ALTER TABLE `cv_generations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cv_id` (`cv_id`),
  ADD KEY `idx_applicant` (`applicant_id`),
  ADD KEY `idx_cv_id` (`cv_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applicant` (`applicant_id`);

--
-- Indexes for table `generated_cvs`
--
ALTER TABLE `generated_cvs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cv_id` (`cv_id`),
  ADD KEY `idx_applicant` (`applicant_id`),
  ADD KEY `idx_template` (`template_type`);

--
-- Indexes for table `language_verifications`
--
ALTER TABLE `language_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applicant` (`applicant_id`),
  ADD KEY `idx_language` (`language`),
  ADD KEY `idx_verified` (`is_verified`);

--
-- Indexes for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_profile_id` (`profile_id`),
  ADD KEY `idx_viewer_id` (`viewer_id`);

--
-- Indexes for table `public_profiles`
--
ALTER TABLE `public_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `profile_url_slug` (`profile_url_slug`),
  ADD KEY `idx_slug` (`profile_url_slug`),
  ADD KEY `idx_applicant` (`applicant_id`);

--
-- Indexes for table `traffic_light_scores`
--
ALTER TABLE `traffic_light_scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `applicant_id` (`applicant_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_total_score` (`total_score`);

--
-- Indexes for table `user_links`
--
ALTER TABLE `user_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applicant_id` (`applicant_id`),
  ADD KEY `idx_link_type` (`link_type`);

--
-- Indexes for table `user_media`
--
ALTER TABLE `user_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applicant_id` (`applicant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accredited_institutions`
--
ALTER TABLE `accredited_institutions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `applicant_privacy_settings`
--
ALTER TABLE `applicant_privacy_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_sessions`
--
ALTER TABLE `application_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cv_generations`
--
ALTER TABLE `cv_generations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `generated_cvs`
--
ALTER TABLE `generated_cvs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `language_verifications`
--
ALTER TABLE `language_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `profile_views`
--
ALTER TABLE `profile_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `public_profiles`
--
ALTER TABLE `public_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `traffic_light_scores`
--
ALTER TABLE `traffic_light_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user_links`
--
ALTER TABLE `user_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_media`
--
ALTER TABLE `user_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applicant_privacy_settings`
--
ALTER TABLE `applicant_privacy_settings`
  ADD CONSTRAINT `applicant_privacy_settings_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_cert_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cv_generations`
--
ALTER TABLE `cv_generations`
  ADD CONSTRAINT `cv_generations_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `generated_cvs`
--
ALTER TABLE `generated_cvs`
  ADD CONSTRAINT `fk_cv_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `language_verifications`
--
ALTER TABLE `language_verifications`
  ADD CONSTRAINT `fk_lang_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD CONSTRAINT `profile_views_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `public_profiles`
--
ALTER TABLE `public_profiles`
  ADD CONSTRAINT `public_profiles_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `traffic_light_scores`
--
ALTER TABLE `traffic_light_scores`
  ADD CONSTRAINT `fk_score_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_links`
--
ALTER TABLE `user_links`
  ADD CONSTRAINT `user_links_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_media`
--
ALTER TABLE `user_media`
  ADD CONSTRAINT `user_media_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
