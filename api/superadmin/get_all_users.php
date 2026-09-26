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
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}

echo json_encode(['status' => 'success', 'users' => []], JSON_UNESCAPED_UNICODE);
