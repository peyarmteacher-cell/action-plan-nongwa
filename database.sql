-- =======================================================
-- ระบบบริหารแผนปฏิบัติการประจำปีของโรงเรียน (School Action Plan OS)
-- สอดคล้องตามมาตรฐาน สพฐ. 15 หัวข้อ และระเบียบการบริหารงบประมาณสถานศึกษา
-- =======================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ตารางข้อมูลสถานศึกษา (รองรับรหัส SMIS 8 หลัก)
CREATE TABLE IF NOT EXISTS `schools` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(10) UNIQUE NOT NULL,
  `smis_code` VARCHAR(8) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `province` VARCHAR(100) NOT NULL DEFAULT 'บุรีรัมย์',
  `district` VARCHAR(100) DEFAULT '',
  `subdistrict` VARCHAR(100) DEFAULT '',
  `address` TEXT,
  `postal_code` VARCHAR(10) DEFAULT '',
  `phone` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(100) DEFAULT '',
  `website` VARCHAR(255) DEFAULT '',
  `affiliation` VARCHAR(255) NOT NULL DEFAULT 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา',
  `director_name` VARCHAR(255) DEFAULT 'ผู้อำนวยการโรงเรียน',
  `director_position` VARCHAR(255) DEFAULT 'ผู้อำนวยการเชี่ยวชาญ',
  `plan_officer_name` VARCHAR(255) DEFAULT 'เจ้าหน้าที่แผนงานและงบประมาณ',
  `assigned_admin_name` VARCHAR(255) DEFAULT 'ผู้ดูแลระบบโรงเรียน',
  `assigned_admin_id` INT DEFAULT NULL,
  `logo_url` TEXT,
  `status` ENUM('active', 'pending', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ตารางผู้ใช้งานและบทบาทสิทธิ์ (7 ระดับ)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT DEFAULT 1,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `id_card` VARCHAR(13) DEFAULT '',
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(100) DEFAULT 'ครูชำนาญการ',
  `department` ENUM('academic', 'budget', 'personnel', 'general', 'central') DEFAULT 'academic',
  `role` ENUM('super_admin', 'school_admin', 'director', 'deputy_director', 'plan_officer', 'department_head', 'teacher') DEFAULT 'teacher',
  `phone` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(100) DEFAULT '',
  `avatar_url` TEXT,
  `must_change_password` TINYINT(1) DEFAULT 1,
  `is_approved` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ตารางปีงบประมาณ พ.ศ. (1 ต.ค. - 30 ก.ย.)
CREATE TABLE IF NOT EXISTS `fiscal_years` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT DEFAULT 1,
  `year` VARCHAR(4) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_current` TINYINT(1) DEFAULT 0,
  `status` ENUM('planning', 'active', 'closed') DEFAULT 'active',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ตารางคำนวณเงินอุดหนุนรายหัวและเงินกิจกรรมพัฒนาคุณภาพผู้เรียน (กพพ.) 4 ช่วงชั้น
CREATE TABLE IF NOT EXISTS `student_subsidies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL DEFAULT 1,
  `fiscal_year_id` INT NOT NULL DEFAULT 1,
  `level_key` ENUM('kindergarten', 'primary', 'lower_secondary', 'upper_secondary') NOT NULL,
  `level_name` VARCHAR(100) NOT NULL,
  `student_count` INT NOT NULL DEFAULT 0,
  `subsidy_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `dev_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ตารางแหล่งเงินงบประมาณที่โรงเรียนได้รับ
CREATE TABLE IF NOT EXISTS `budget_sources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL DEFAULT 1,
  `fiscal_year_id` INT NOT NULL,
  `code` VARCHAR(50) DEFAULT '',
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('subsidy', 'student_dev', 'school_income', 'donation', 'poverty_fund', 'other') DEFAULT 'subsidy',
  `amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `description` TEXT,
  `received_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ตารางการจัดสรรงบประมาณ 4 กลุ่มบริหารงาน + ส่วนกลาง/สำรองจ่าย รวม 100%
CREATE TABLE IF NOT EXISTS `department_allocations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL DEFAULT 1,
  `fiscal_year_id` INT NOT NULL,
  `department` ENUM('academic', 'budget', 'personnel', 'general', 'reserve', 'central') NOT NULL,
  `department_name` VARCHAR(150) NOT NULL,
  `percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `allocated_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `notes` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ตารางโครงการตามแบบแผนปฏิบัติการ สพฐ. 15 หัวข้อ
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL DEFAULT 1,
  `fiscal_year_id` INT NOT NULL,
  `department` ENUM('academic', 'budget', 'personnel', 'general', 'reserve', 'central') NOT NULL DEFAULT 'academic',
  `code` VARCHAR(50) DEFAULT '',
  `name` VARCHAR(255) NOT NULL,
  `proposer_id` INT NOT NULL,
  `proposer_name` VARCHAR(255) DEFAULT '',
  `supervisor_id` INT DEFAULT NULL,
  `strategy_alignment` TEXT,
  `standard_alignment` VARCHAR(255) DEFAULT 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
  `rationale` TEXT,
  `objectives` TEXT,
  `target_qty` TEXT,
  `target_quality` TEXT,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT 'โรงเรียน',
  `budget_source_id` INT DEFAULT NULL,
  `requested_budget` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `approved_budget` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `expected_outcomes` TEXT,
  `indicators` TEXT,
  `evaluation_method` TEXT,
  `status` ENUM('draft', 'submitted', 'dept_approved', 'screened', 'approved', 'revision_requested', 'rejected') DEFAULT 'draft',
  `screening_note` TEXT,
  `director_note` TEXT,
  `approved_at` DATETIME DEFAULT NULL,
  `progress_percentage` INT DEFAULT 0,
  `execution_status` ENUM('not_started', 'in_progress', 'completed', 'delayed', 'cancelled') DEFAULT 'not_started',
  `results_summary` TEXT,
  `obstacles` TEXT,
  `recommendations` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ตารางรายละเอียดประมาณการค่าใช้จ่ายจำแนกหมวดราชการ (ค่าตอบแทน, ค่าใช้สอย, ค่าวัสดุ)
CREATE TABLE IF NOT EXISTS `project_budget_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `category` ENUM('compensation', 'operating', 'materials', 'utility', 'other') DEFAULT 'materials',
  `item_name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10,2) DEFAULT 1.00,
  `unit` VARCHAR(50) DEFAULT 'รายการ',
  `unit_price` DECIMAL(12,2) DEFAULT 0.00,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ตารางบันทึกการเบิกจ่ายจริง
CREATE TABLE IF NOT EXISTS `project_expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `expense_date` DATE NOT NULL,
  `doc_number` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('compensation', 'operating', 'materials', 'utility', 'other') DEFAULT 'materials',
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `disbursed_by` VARCHAR(255) NOT NULL,
  `receipt_note` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. ตารางบันทึกรายงานผลความก้าวหน้าตามวงจร PDCA
CREATE TABLE IF NOT EXISTS `project_progress_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `phase` ENUM('P', 'D', 'C', 'A') DEFAULT 'D',
  `progress_percent` INT NOT NULL DEFAULT 0,
  `details` TEXT NOT NULL,
  `obstacles` TEXT,
  `solutions` TEXT,
  `recorded_by` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- ข้อมูลตั้งต้นสำหรับระบบใช้งานจริง (Initial Setup Data)
-- =======================================================

-- 1. สร้างโรงเรียนแห่งแรกสำหรับเริ่มต้นระบบ
INSERT INTO `schools` (`id`, `code`, `smis_code`, `name`, `province`, `affiliation`, `director_name`, `director_position`, `plan_officer_name`, `status`)
VALUES (1, '10310001', '10310001', 'โรงเรียนอนุบาลพัฒนาวิทยา', 'บุรีรัมย์', 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1', 'นายธีระพล เกียรติวิทยา', 'ผู้อำนวยการเชี่ยวชาญ', 'นางวิไลพร งบมั่นคง', 'active')
ON DUPLICATE KEY UPDATE `smis_code` = VALUES(`smis_code`), `name` = VALUES(`name`);

-- 2. สร้างบัญชี Super Admin เริ่มต้น (รหัสผ่านเริ่มต้น password123)
INSERT INTO `users` (`id`, `school_id`, `username`, `id_card`, `password`, `name`, `position`, `department`, `role`, `phone`, `email`, `must_change_password`, `is_approved`)
VALUES (1, NULL, 'superadmin', '1310000000001', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1vT7FekW3K6pvd5/Qn3eM7lB8lQdE9m', 'ผู้ดูแลระบบระดับเขตพื้นที่ฯ (Super Admin)', 'ผู้อำนวยการกลุ่มนโยบายและแผน (สพป./สพฐ.)', 'central', 'super_admin', '0812345678', 'superadmin@obec.go.th', 0, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `role` = 'super_admin';

SET FOREIGN_KEY_CHECKS = 1;
