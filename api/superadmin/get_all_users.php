<?php
session_start();
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id']) || empty($_SESSION['role'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

if ($_SESSION['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
    exit;
}

try {
    if ($pdo instanceof PDO) {
        $stmt = $pdo->query('
            SELECT u.id, u.username, u.name, u.role, u.department, u.position, u.phone, u.email, u.is_approved, u.id_card, s.name as school_name, s.smis_code 
            FROM users u 
            LEFT JOIN schools s ON u.school_id = s.id 
            ORDER BY u.id ASC
        ');
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'users' => $users], JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (Exception $e) {
    // Fallback below
}

// Fallback demo list
$users = [
    ['id' => 1, 'username' => 'superadmin', 'name' => 'ผู้ดูแลระบบระดับเขตพื้นที่ฯ (Super Admin)', 'role' => 'super_admin', 'position' => 'ผู้อำนวยการกลุ่มนโยบายและแผน', 'school_name' => 'ส่วนกลาง / เขตพื้นที่ฯ', 'smis_code' => '10310001', 'is_approved' => 1],
    ['id' => 2, 'username' => 'schooladmin', 'name' => 'นางสาวสุภาวดี ดูแลระบบ', 'role' => 'school_admin', 'position' => 'ผู้ดูแลระบบสารสนเทศโรงเรียน', 'school_name' => 'โรงเรียนอนุบาลพัฒนาวิทยา', 'smis_code' => '10310001', 'is_approved' => 1],
    ['id' => 3, 'username' => 'director', 'name' => 'นายธีระพล เกียรติวิทยา', 'role' => 'director', 'position' => 'ผู้อำนวยการโรงเรียน', 'school_name' => 'โรงเรียนอนุบาลพัฒนาวิทยา', 'smis_code' => '10310001', 'is_approved' => 1],
    ['id' => 5, 'username' => 'planofficer', 'name' => 'นางวิไลพร งบมั่นคง', 'role' => 'plan_officer', 'position' => 'เจ้าหน้าที่แผนงานและงบประมาณ', 'school_name' => 'โรงเรียนอนุบาลพัฒนาวิทยา', 'smis_code' => '10310001', 'is_approved' => 1],
    ['id' => 6, 'username' => 'head_academic', 'name' => 'นางกัญญา วิชาการดี', 'role' => 'department_head', 'position' => 'หัวหน้ากลุ่มบริหารวิชาการ', 'school_name' => 'โรงเรียนอนุบาลพัฒนาวิทยา', 'smis_code' => '10310001', 'is_approved' => 1],
    ['id' => 10, 'username' => 'teacher_somchai', 'name' => 'นายสมชาย สอนสนุก', 'role' => 'teacher', 'position' => 'ครู คศ.1', 'school_name' => 'โรงเรียนอนุบาลพัฒนาวิทยา', 'smis_code' => '10310001', 'is_approved' => 1],
];

echo json_encode(['status' => 'success', 'users' => $users], JSON_UNESCAPED_UNICODE);
