<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config.php';

if (!$pdo) {
    http_response_code(503);
    echo json_encode(['status' => 'error', 'message' => 'ยังไม่ได้เชื่อมต่อฐานข้อมูล MySQL']);
    exit;
}

try {
    $school_id = isset($_GET['school_id']) ? (int)$_GET['school_id'] : 1;
    $stmt = $pdo->prepare("
        SELECT id, school_id, username, name, position, department, role, phone, email, is_approved, created_at
        FROM users 
        WHERE (school_id = ? OR role = 'super_admin')
        ORDER BY 
            CASE role 
                WHEN 'super_admin' THEN 1
                WHEN 'director' THEN 2
                WHEN 'deputy_director' THEN 3
                WHEN 'school_admin' THEN 4
                WHEN 'plan_officer' THEN 5
                WHEN 'department_head' THEN 6
                ELSE 7 
            END, id ASC
    ");
    $stmt->execute([$school_id]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'users' => $users,
        'total' => count($users)
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
