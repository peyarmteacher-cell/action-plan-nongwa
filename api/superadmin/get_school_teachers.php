<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$school_id = (int)($_GET['school_id'] ?? 0);
$configFile = __DIR__ . '/../../db-config.json';
$schoolsFile = __DIR__ . '/../../schools-data.json';

// Find school
$school = [
    'id' => $school_id,
    'name' => 'โรงเรียนอนุบาลพัฒนาวิทยา',
    'smis_code' => '10310001',
    'affiliation' => 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1',
    'assigned_admin_name' => 'นางสาวสุภาวดี ดูแลระบบ',
    'assigned_admin_id' => 2
];

if (file_exists($schoolsFile)) {
    $schools = json_decode(file_get_contents($schoolsFile), true) ?: [];
    foreach ($schools as $s) {
        if ($s['id'] == $school_id) {
            $school = $s;
            break;
        }
    }
}

$teachers = [];

// Try MySQL
try {
    $dbConfig = ['host' => 'localhost', 'port' => 3306, 'database' => 'school_action_plan', 'user' => 'root', 'password' => ''];
    if (file_exists($configFile)) {
        $dbConfig = array_merge($dbConfig, json_decode(file_get_contents($configFile), true) ?: []);
    }
    $pdo = new PDO(
        "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset=utf8mb4",
        $dbConfig['user'],
        $dbConfig['password'] ?? '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 2]
    );

    // Fetch school from DB
    $stmtS = $pdo->prepare("SELECT * FROM schools WHERE id = ?");
    $stmtS->execute([$school_id]);
    if ($dbS = $stmtS->fetch(PDO::FETCH_ASSOC)) {
        $school = $dbS;
    }

    // Fetch teachers for this school
    $stmtT = $pdo->prepare("SELECT id, name, position, department, role, phone, email, is_approved FROM users WHERE school_id = ? AND role != 'super_admin' ORDER BY id ASC");
    $stmtT->execute([$school_id]);
    $teachers = $stmtT->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // If DB fails, use fallback teachers for school 1
    if ($school_id === 1) {
        $teachers = [
            ['id' => 2, 'name' => 'นางสาวสุภาวดี ดูแลระบบ', 'position' => 'ผู้ดูแลระบบสารสนเทศโรงเรียน', 'department' => 'budget', 'role' => 'school_admin', 'phone' => '0823456789', 'email' => 'admin@anubanpat.ac.th', 'is_approved' => 1],
            ['id' => 3, 'name' => 'นายธีระพล เกียรติวิทยา', 'position' => 'ผู้อำนวยการโรงเรียนอนุบาลพัฒนาวิทยา', 'department' => 'central', 'role' => 'director', 'phone' => '0891234567', 'email' => 'director@anubanpat.ac.th', 'is_approved' => 1],
            ['id' => 5, 'name' => 'นางวิไลพร งบมั่นคง', 'position' => 'เจ้าหน้าที่แผนงานและงบประมาณ', 'department' => 'budget', 'role' => 'plan_officer', 'phone' => '0867891234', 'email' => 'plan@anubanpat.ac.th', 'is_approved' => 1],
            ['id' => 6, 'name' => 'นางกัญญา วิชาการดี', 'position' => 'หัวหน้ากลุ่มบริหารวิชาการ', 'department' => 'academic', 'role' => 'department_head', 'phone' => '0856781234', 'email' => 'academic@anubanpat.ac.th', 'is_approved' => 1],
            ['id' => 10, 'name' => 'นายสมชาย สอนสนุก', 'position' => 'ครู คศ.1', 'department' => 'academic', 'role' => 'teacher', 'phone' => '0811112222', 'email' => 'somchai@anubanpat.ac.th', 'is_approved' => 1]
        ];
    }
}

echo json_encode([
    'status' => 'success',
    'school' => $school,
    'teachers' => $teachers
], JSON_UNESCAPED_UNICODE);
