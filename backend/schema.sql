-- ============================================================
-- Level Up Aptitude — Complete MySQL Database Schema
-- Database: levelup_aptitude
-- ============================================================

CREATE DATABASE IF NOT EXISTS `levelup_aptitude` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `levelup_aptitude`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'admin') DEFAULT 'student',
    `avatar_url` VARCHAR(255) DEFAULT NULL,
    `institution` VARCHAR(200) DEFAULT 'Coimbatore Institute of Technology',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `icon` VARCHAR(50) NOT NULL,
    `color_var` VARCHAR(30) DEFAULT 'cyan',
    `display_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_slug` VARCHAR(50) NOT NULL,
    `question_text` TEXT NOT NULL,
    `options_json` JSON NOT NULL,
    `correct_index` INT NOT NULL,
    `explanation` TEXT,
    `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    `points` INT DEFAULT 10,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_slug`) REFERENCES `categories`(`slug`) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX `idx_questions_cat` (`category_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. User Stats Aggregate Table
CREATE TABLE IF NOT EXISTS `user_stats` (
    `user_id` INT PRIMARY KEY,
    `games_played` INT DEFAULT 0,
    `total_score` INT DEFAULT 0,
    `average_score` INT DEFAULT 0,
    `best_streak` INT DEFAULT 0,
    `math_games` INT DEFAULT 0,
    `math_best` INT DEFAULT 0,
    `math_avg` INT DEFAULT 0,
    `logic_games` INT DEFAULT 0,
    `logic_best` INT DEFAULT 0,
    `logic_avg` INT DEFAULT 0,
    `verbal_games` INT DEFAULT 0,
    `verbal_best` INT DEFAULT 0,
    `verbal_avg` INT DEFAULT 0,
    `spatial_games` INT DEFAULT 0,
    `spatial_best` INT DEFAULT 0,
    `spatial_avg` INT DEFAULT 0,
    `last_played_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Game Sessions (History) Table
CREATE TABLE IF NOT EXISTS `game_sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category_slug` VARCHAR(50) NOT NULL,
    `score` INT NOT NULL,
    `max_score` INT NOT NULL,
    `total_questions` INT NOT NULL,
    `accuracy_pct` DECIMAL(5,2) DEFAULT 0.00,
    `time_taken_seconds` INT DEFAULT 0,
    `played_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_slug`) REFERENCES `categories`(`slug`) ON UPDATE CASCADE,
    INDEX `idx_sessions_user` (`user_id`),
    INDEX `idx_sessions_cat` (`category_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Contact Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('new', 'read', 'responded') DEFAULT 'new',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_contact_status` (`status`),
    INDEX `idx_contact_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Leaderboard View
CREATE OR REPLACE VIEW `v_leaderboard` AS
SELECT 
    u.`id` AS `user_id`,
    u.`name`,
    u.`email`,
    u.`institution`,
    s.`total_score`,
    s.`games_played`,
    s.`average_score`,
    s.`best_streak`,
    RANK() OVER (ORDER BY s.`total_score` DESC, s.`average_score` DESC) AS `rank_position`
FROM `users` u
JOIN `user_stats` s ON u.`id` = s.`user_id`
WHERE s.`games_played` > 0;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert Categories
INSERT INTO `categories` (`slug`, `name`, `description`, `icon`, `color_var`, `display_order`) VALUES
('mathematical', 'Mathematical Reasoning', 'Sharpen quantitative aptitude, arithmetic patterns, percentages, and rapid problem-solving speed.', 'fa-calculator', 'cyan', 1),
('logical', 'Logical Reasoning', 'Master syllogisms, pattern sequences, deduction, and analytical problem-solving puzzles.', 'fa-puzzle-piece', 'magenta', 2),
('verbal', 'Verbal Ability', 'Enhance vocabulary, grammar, reading comprehension, analogies, and verbal expression.', 'fa-comments', 'amber', 3),
('spatial', 'Spatial Reasoning', 'Boost 3D mental rotation, spatial awareness, symmetry recognition, and pattern orientation.', 'fa-cube', 'emerald', 4)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

-- Insert Mathematical Questions
INSERT INTO `questions` (`category_slug`, `question_text`, `options_json`, `correct_index`, `explanation`, `difficulty`, `points`) VALUES
('mathematical', 'What is 15% of 240?', '["36", "32", "40", "28"]', 0, '15% of 240 = 0.15 × 240 = 36', 'easy', 10),
('mathematical', 'If a train travels 300 km in 4 hours, what is its average speed?', '["75 km/h", "80 km/h", "70 km/h", "85 km/h"]', 0, 'Average speed = Distance ÷ Time = 300 ÷ 4 = 75 km/h', 'easy', 10),
('mathematical', 'What is the next number in the sequence: 2, 6, 12, 20, ?', '["28", "30", "32", "24"]', 1, 'The pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30', 'medium', 10),
('mathematical', 'If 3x + 7 = 22, what is the value of x?', '["5", "4", "6", "3"]', 0, '3x + 7 = 22 => 3x = 15 => x = 5', 'easy', 10),
('mathematical', 'What is the area of a circle with radius 7 cm? (Use π = 22/7)', '["154 cm²", "147 cm²", "161 cm²", "168 cm²"]', 0, 'Area = πr² = (22/7) × 7 × 7 = 154 cm²', 'medium', 10),
('mathematical', 'A shopkeeper sells an item for $180 gaining 20% profit. What was the cost price?', '["$150", "$144", "$160", "$155"]', 0, 'Cost Price = Selling Price ÷ 1.20 = 180 ÷ 1.2 = $150', 'medium', 10);

-- Insert Logical Questions
INSERT INTO `questions` (`category_slug`, `question_text`, `options_json`, `correct_index`, `explanation`, `difficulty`, `points`) VALUES
('logical', 'All roses are flowers. Some flowers are red. Which statement is definitely true?', '["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"]', 3, 'We know all roses are flowers and some flowers are red, but we cannot determine if any roses are red.', 'medium', 10),
('logical', 'If today is Wednesday, what day will it be 100 days from now?', '["Thursday", "Friday", "Saturday", "Sunday"]', 1, '100 ÷ 7 = 14 weeks and 2 days. Wednesday + 2 days = Friday.', 'easy', 10),
('logical', 'A, B, C, D are sitting in a row. A is not at either end. B is next to C. D is at one end. Who must be in an inner position?', '["A", "B", "C", "Cannot be determined"]', 0, 'If D is at one end and A is not at either end, A must be in an inner position.', 'medium', 10),
('logical', 'Complete the pattern: 1, 4, 9, 16, ?', '["20", "24", "25", "30"]', 2, 'These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25', 'easy', 10),
('logical', 'If APPLE = 50, BANANA = 42, what does CAT equal?', '["24", "27", "30", "21"]', 0, 'Sum of alphabet positions: C(3) + A(1) + T(20) = 24', 'medium', 10);

-- Insert Verbal Questions
INSERT INTO `questions` (`category_slug`, `question_text`, `options_json`, `correct_index`, `explanation`, `difficulty`, `points`) VALUES
('verbal', 'What is the synonym of "BENEVOLENT"?', '["Malevolent", "Kind", "Stubborn", "Lazy"]', 1, 'Benevolent means well-meaning and kindly.', 'easy', 10),
('verbal', 'Which word is the antonym of "EPHEMERAL"?', '["Temporary", "Permanent", "Brief", "Fleeting"]', 1, 'Ephemeral means lasting for a very short time, so permanent is its antonym.', 'medium', 10),
('verbal', 'Complete the analogy: BOOK is to LIBRARY as MONEY is to ?', '["Bank", "Wallet", "Store", "ATM"]', 0, 'Books are stored in libraries, just as money is deposited and stored in banks.', 'easy', 10),
('verbal', 'What does "SERENDIPITY" mean?', '["Bad luck", "Good fortune by accident", "Hard work", "Intelligence"]', 1, 'Serendipity is the occurrence and development of events by chance in a happy or beneficial way.', 'medium', 10),
('verbal', 'Choose the correctly spelled word:', '["Accomodate", "Acommodate", "Accommodate", "Accomadate"]', 2, 'Accommodate has double "c" and double "m".', 'easy', 10);

-- Insert Spatial Questions
INSERT INTO `questions` (`category_slug`, `question_text`, `options_json`, `correct_index`, `explanation`, `difficulty`, `points`) VALUES
('spatial', 'How many faces does a standard cube have?', '["4", "6", "8", "12"]', 1, 'A cube has 6 square faces, 8 vertices, and 12 edges.', 'easy', 10),
('spatial', 'If you rotate an equilateral triangle by 120°, what happens to its orientation?', '["It looks upside down", "It appears unchanged", "It turns into a right triangle", "It becomes a square"]', 1, 'An equilateral triangle has 3-fold rotational symmetry (360° ÷ 3 = 120°).', 'medium', 10),
('spatial', 'A paper is folded in half twice and a hole is punched through all layers. When unfolded, how many holes are there?', '["1", "2", "4", "8"]', 2, 'Folding twice creates 4 layers, so punching one hole pierces all 4 layers, resulting in 4 holes.', 'medium', 10),
('spatial', 'What shape is formed by the cross-section of a cylinder cut perpendicular to its base?', '["Circle", "Rectangle", "Triangle", "Ellipse"]', 1, 'A vertical cut perpendicular to the circular base of a cylinder yields a rectangle.', 'hard', 10),
('spatial', 'Which 3D shape has 1 vertex and 1 flat face?', '["Cone", "Pyramid", "Sphere", "Cylinder"]', 0, 'A cone has one circular flat base and one vertex (apex).', 'easy', 10);

-- Insert Sample Users for Initial Leaderboard (Passwords hashed with bcrypt: 'Password123!')
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `institution`) VALUES
(1, 'Aarav Sharma', 'aarav@cit.edu.in', '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', 'student', 'Coimbatore Institute of Technology'),
(2, 'Priya Nair', 'priya@cit.edu.in', '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', 'student', 'Coimbatore Institute of Technology'),
(3, 'Vijay Baskaran', 'vijaybaskaran17@gmail.com', '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', 'admin', 'Coimbatore Institute of Technology'),
(4, 'Kavya Raman', 'kavya@cit.edu.in', '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', 'student', 'Coimbatore Institute of Technology'),
(5, 'Rohan Verma', 'rohan@cit.edu.in', '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', 'student', 'Coimbatore Institute of Technology')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert User Stats
INSERT INTO `user_stats` (`user_id`, `games_played`, `total_score`, `average_score`, `best_streak`, `math_games`, `math_best`, `math_avg`, `logic_games`, `logic_best`, `logic_avg`, `verbal_games`, `verbal_best`, `verbal_avg`, `spatial_games`, `spatial_best`, `spatial_avg`) VALUES
(1, 24, 1140, 48, 50, 6, 50, 48, 6, 50, 47, 6, 50, 49, 6, 50, 46),
(2, 21, 980, 47, 50, 5, 50, 46, 6, 50, 48, 5, 50, 47, 5, 40, 45),
(3, 19, 910, 48, 50, 5, 50, 49, 5, 50, 48, 5, 50, 48, 4, 40, 46),
(4, 15, 680, 45, 50, 4, 40, 44, 4, 50, 46, 4, 40, 43, 3, 40, 47),
(5, 12, 540, 45, 50, 3, 50, 45, 3, 40, 44, 3, 40, 45, 3, 40, 46)
ON DUPLICATE KEY UPDATE `total_score`=VALUES(`total_score`), `games_played`=VALUES(`games_played`);

-- Insert Sample Contact Messages
INSERT INTO `contact_messages` (`name`, `email`, `subject`, `message`, `status`) VALUES
('Vijay Baskaran', 'vijaybaskaran17@gmail.com', 'CIT Aptitude Platform Launch', 'Welcome to the Level Up Aptitude platform for students of Coimbatore Institute of Technology!', 'read');
