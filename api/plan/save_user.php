<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config.php';

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name = trim($data['name'] ?? '');
$position = trim($data['position'] ?? 'ครู');
$department = $data['department'] ?? 'academic';
$role = $data['role'] ?? 'teacher';
$id_card = trim($data['id_card'] ?? '');
$school_id = (int)($data['school_id'] ?? 1);

if (empty($name)) {
    echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุชื่อ-นามสกุล']);
    exit;
}

if (!$pdo) {
    http_response_code(503);
    echo json_encode(['status' => 'error', 'message' => 'ยังไม่ได้เชื่อมต่อฐานข้อมูล MySQL กรุณาตั้งค่าการเชื่อมต่อในส่วน Super Admin']);
    exit;
}

try {
    $username = !empty($data['username']) ? trim($data['username']) : ('user_' . time());
    $pwd = password_hash('123456', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users (school_id, name, username, id_card, password, role, position, department, must_change_password, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    ");
    $stmt->execute([$school_id, $name, $username, $id_card, $pwd, $role, $position, $department]);

    echo json_encode(['status' => 'success', 'message' => 'เพิ่มผู้ใช้งานสำเร็จ รหัสผ่านเริ่มต้นคือ 123456']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
