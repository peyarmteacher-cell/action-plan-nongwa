<?php
ob_start();
session_start();
error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');

// Ensure database connection config
$config_file = __DIR__ . '/../config.php';
$pdo = null;
if (file_exists($config_file)) {
    require_once $config_file;
}

if (!$pdo || !($pdo instanceof PDO)) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL ได้ กรุณาตรวจสอบการตั้งค่า Host, Port, Database, User, Password ในส่วนตั้งค่าการเชื่อมต่อ MySQL ให้ถูกต้อง และตรวจสอบว่า MySQL Server กำลังทำงานอยู่"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$steps = [];

try {
    // 1. schools table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS schools (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(10) UNIQUE NOT NULL,
            smis_code VARCHAR(8) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            province VARCHAR(100) NOT NULL DEFAULT 'บุรีรัมย์',
            district VARCHAR(100) DEFAULT '',
            subdistrict VARCHAR(100) DEFAULT '',
            address TEXT,
            postal_code VARCHAR(10) DEFAULT '',
            phone VARCHAR(30) DEFAULT '',
            email VARCHAR(100) DEFAULT '',
            website VARCHAR(255) DEFAULT '',
            affiliation VARCHAR(255) NOT NULL DEFAULT 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา',
            director_name VARCHAR(255) DEFAULT 'ผู้อำนวยการโรงเรียน',
            director_position VARCHAR(255) DEFAULT 'ผู้อำนวยการเชี่ยวชาญ',
            plan_officer_name VARCHAR(255) DEFAULT 'เจ้าหน้าที่แผนงานและงบประมาณ',
            assigned_admin_name VARCHAR(255) DEFAULT 'ผู้ดูแลระบบโรงเรียน',
            assigned_admin_id INT DEFAULT NULL,
            logo_url TEXT,
            status ENUM('active', 'pending', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 1,
        "table" => "schools",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางสถานศึกษา รองรับรหัส SMIS 8 หลัก, ชื่อสถานศึกษา, สังกัดเขตพื้นที่ฯ, ตราสัญลักษณ์ logo_url, ผู้ดูแลระบบ assigned_admin_id/name, สถานะ active/pending"
    ];

    // 2. users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_id INT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            id_card VARCHAR(13) DEFAULT '',
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100) DEFAULT 'ครูชำนาญการ',
            department ENUM('academic', 'budget', 'personnel', 'general', 'central') DEFAULT 'academic',
            role ENUM('super_admin', 'school_admin', 'director', 'deputy_director', 'plan_officer', 'department_head', 'teacher') DEFAULT 'teacher',
            phone VARCHAR(30) DEFAULT '',
            email VARCHAR(100) DEFAULT '',
            avatar_url TEXT,
            must_change_password TINYINT(1) DEFAULT 1,
            is_approved TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed/Sync Super Admin
    $adminConfigFile = __DIR__ . '/../../admin-config.json';
    $saUser = 'superadmin';
    $saPass = password_hash('password123', PASSWORD_DEFAULT);
    $saName = 'ผู้ดูแลระบบระดับเขตพื้นที่ฯ (Super Admin)';
    $saPos = 'ผู้อำนวยการกลุ่มนโยบายและแผน (สพป./สพฐ.)';
    $saPhone = '0812345678';
    $saEmail = 'superadmin@obec.go.th';

    if (file_exists($adminConfigFile)) {
        $saved = json_decode(file_get_contents($adminConfigFile), true);
        if (is_array($saved)) {
            if (!empty($saved['username'])) $saUser = $saved['username'];
            if (!empty($saved['password'])) $saPass = password_hash($saved['password'], PASSWORD_DEFAULT);
            if (!empty($saved['name'])) $saName = $saved['name'];
            if (!empty($saved['position'])) $saPos = $saved['position'];
            if (!empty($saved['phone'])) $saPhone = $saved['phone'];
            if (!empty($saved['email'])) $saEmail = $saved['email'];
        }
    }

    $stmtAdmin = $pdo->prepare("
        INSERT INTO users (id, school_id, username, id_card, password, name, position, department, role, phone, email, must_change_password, is_approved)
        VALUES (1, NULL, ?, '1310000000001', ?, ?, ?, 'central', 'super_admin', ?, ?, 0, 1)
        ON DUPLICATE KEY UPDATE 
            username = VALUES(username),
            password = VALUES(password),
            name = VALUES(name),
            position = VALUES(position),
            phone = VALUES(phone),
            email = VALUES(email),
            role = 'super_admin'
    ");
    $stmtAdmin->execute([$saUser, $saPass, $saName, $saPos, $saPhone, $saEmail]);

    $steps[] = [
        "step" => 2,
        "table" => "users",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางบุคลากร บันทึกและซิงค์บัญชี Super Admin (Username: \"{$saUser}\", สิทธิ์ super_admin), รองรับเลขบัตร ปชช. 13 หลัก และครบ 7 บทบาทสิทธิ์"
    ];

    // 3. fiscal_years table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS fiscal_years (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_id INT DEFAULT 1,
            year VARCHAR(4) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            is_current TINYINT(1) DEFAULT 0,
            status ENUM('planning', 'active', 'closed') DEFAULT 'active',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 3,
        "table" => "fiscal_years",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางปีงบประมาณ พ.ศ. (1 ต.ค. - 30 ก.ย.) รองรับการสลับและจัดเก็บข้อมูลย้อนหลัง คอลัมน์ year เป็นมาตรฐานสากล"
    ];

    // 4. student_subsidies table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_subsidies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_id INT NOT NULL DEFAULT 1,
            fiscal_year_id INT NOT NULL DEFAULT 1,
            level_key ENUM('kindergarten', 'primary', 'lower_secondary', 'upper_secondary') NOT NULL,
            level_name VARCHAR(100) NOT NULL,
            student_count INT NOT NULL DEFAULT 0,
            subsidy_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            dev_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 4,
        "table" => "student_subsidies",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางคำนวณเงินอุดหนุนรายหัวและเงินกิจกรรมพัฒนาคุณภาพผู้เรียน กพพ. 4 ระดับการศึกษา (อนุบาล, ประถม, ม.ต้น, ม.ปลาย)"
    ];

    // 5. budget_sources table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS budget_sources (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_id INT NOT NULL DEFAULT 1,
            fiscal_year_id INT NOT NULL,
            code VARCHAR(50) DEFAULT '',
            name VARCHAR(255) NOT NULL,
            category ENUM('subsidy', 'student_dev', 'school_income', 'donation', 'poverty_fund', 'other') DEFAULT 'subsidy',
            amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            description TEXT,
            received_date DATE DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 5,
        "table" => "budget_sources",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางแหล่งเงินงบประมาณ (เงินอุดหนุนรายหัว, เงิน กพพ., เงินรายได้สถานศึกษา, เงินระดมทรัพยากร/บริจาค, ปัจจัยพื้นฐาน CCT)"
    ];

    // 6. department_allocations table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS department_allocations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_id INT NOT NULL DEFAULT 1,
            fiscal_year_id INT NOT NULL,
            department ENUM('academic', 'budget', 'personnel', 'general', 'reserve', 'central') NOT NULL,
            department_name VARCHAR(150) NOT NULL,
            percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            allocated_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            notes VARCHAR(255) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 6,
        "table" => "department_allocations",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางจัดสรรงบประมาณ 4 กลุ่มบริหารงาน + งบสำรองส่วนกลาง รวม 100% พร้อมคำนวณยอดเงินจัดสรรอัตโนมัติ"
    ];

    // 7. projects table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_id INT NOT NULL DEFAULT 1,
            fiscal_year_id INT NOT NULL,
            department ENUM('academic', 'budget', 'personnel', 'general', 'reserve', 'central') NOT NULL DEFAULT 'academic',
            code VARCHAR(50) DEFAULT '',
            name VARCHAR(255) NOT NULL,
            proposer_id INT NOT NULL,
            proposer_name VARCHAR(255) DEFAULT '',
            supervisor_id INT DEFAULT NULL,
            strategy_alignment TEXT,
            standard_alignment VARCHAR(255) DEFAULT 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
            rationale TEXT,
            objectives TEXT,
            target_qty TEXT,
            target_quality TEXT,
            start_date DATE DEFAULT NULL,
            end_date DATE DEFAULT NULL,
            location VARCHAR(255) DEFAULT 'โรงเรียน',
            budget_source_id INT DEFAULT NULL,
            requested_budget DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            approved_budget DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            expected_outcomes TEXT,
            indicators TEXT,
            evaluation_method TEXT,
            status ENUM('draft', 'submitted', 'dept_approved', 'screened', 'approved', 'revision_requested', 'rejected') DEFAULT 'draft',
            screening_note TEXT,
            director_note TEXT,
            approved_at DATETIME DEFAULT NULL,
            progress_percentage INT DEFAULT 0,
            execution_status ENUM('not_started', 'in_progress', 'completed', 'delayed', 'cancelled') DEFAULT 'not_started',
            results_summary TEXT,
            obstacles TEXT,
            recommendations TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 7,
        "table" => "projects",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางโครงการตามแบบแผนปฏิบัติการ สพฐ. 15 หัวข้อ รองรับ proposer_id, requested_budget, approved_budget และกระบวนการพิจารณาอนุมัติ 7 สถานะ"
    ];

    // 8. project_budget_items table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS project_budget_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            category ENUM('compensation', 'operating', 'materials', 'utility', 'other') DEFAULT 'materials',
            item_name VARCHAR(255) NOT NULL,
            quantity DECIMAL(10,2) DEFAULT 1.00,
            unit VARCHAR(50) DEFAULT 'รายการ',
            unit_price DECIMAL(12,2) DEFAULT 0.00,
            total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 8,
        "table" => "project_budget_items",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางรายละเอียดประมาณการค่าใช้จ่ายจำแนกหมวดราชการ (ค่าตอบแทน, ค่าใช้สอย, ค่าวัสดุ) พร้อมคำนวณราคารวม"
    ];

    // 9. project_expenses table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS project_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            expense_date DATE NOT NULL,
            doc_number VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            category ENUM('compensation', 'operating', 'materials', 'utility', 'other') DEFAULT 'materials',
            amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            disbursed_by VARCHAR(255) NOT NULL,
            receipt_note VARCHAR(255) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 9,
        "table" => "project_expenses",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางบันทึกการเบิกจ่ายจริง วันที่ เลขที่เอกสารเบิกจ่าย doc_number, รายการ title, หมวด category และยอดเงิน amount"
    ];

    // 10. project_progress_logs table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS project_progress_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            log_date DATE NOT NULL,
            phase ENUM('P', 'D', 'C', 'A') DEFAULT 'D',
            progress_percent INT NOT NULL DEFAULT 0,
            details TEXT NOT NULL,
            obstacles TEXT,
            solutions TEXT,
            recorded_by VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $steps[] = [
        "step" => 10,
        "table" => "project_progress_logs",
        "status" => "success",
        "action" => "CHECK_AND_UPDATE",
        "details" => "ตารางติดตามความก้าวหน้าโครงการตามวงจรคุณภาพ PDCA (วางแผน-ลงมือทำ-ตรวจสอบ-ปรับปรุง) พร้อมร้อยละความก้าวหน้า"
    ];

    // Insert Default School if not exists
    $pdo->exec("
        INSERT INTO schools (id, code, smis_code, name, province, affiliation, director_name, director_position, plan_officer_name, status)
        VALUES (1, '10310001', '10310001', 'โรงเรียนอนุบาลพัฒนาวิทยา', 'บุรีรัมย์', 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1', 'นายธีระพล เกียรติวิทยา', 'ผู้อำนวยการเชี่ยวชาญ', 'นางวิไลพร งบมั่นคง', 'active')
        ON DUPLICATE KEY UPDATE smis_code = VALUES(smis_code), name = VALUES(name);
    ");

    ob_clean();
    echo json_encode([
        "status" => "success",
        "live_mysql_executed" => true,
        "message" => "เชื่อมต่อและติดตั้งโครงสร้างฐานข้อมูลลงบน MySQL Server จริงสำเร็จครบถ้วนทั้ง 10 ตาราง พร้อมซิงค์บัญชี Super Admin",
        "superadmin" => [
            "username" => $saUser,
            "name" => $saName,
            "role" => "super_admin"
        ],
        "timestamp" => date("Y-m-d H:i:s"),
        "total_tables" => count($steps),
        "steps" => $steps,
        "database_version" => "2026.2-PROD-SQL"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "live_mysql_executed" => false,
        "message" => "เกิดข้อผิดพลาดในการรันคำสั่ง SQL สร้างตารางบน MySQL: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
