<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$school_id = (int)($data['school_id'] ?? 0);
$admin_id = (int)($data['admin_id'] ?? 0);
$admin_name = trim($data['admin_name'] ?? '');

if (!$school_id || !$admin_id) {
    echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน']);
    exit;
}

$configFile = __DIR__ . '/../../db-config.json';
$schoolsFile = __DIR__ . '/../../schools-data.json';

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

    // Promote user in users table
    $stmtU = $pdo->prepare("UPDATE users SET role = 'school_admin' WHERE id = ?");
    $stmtU->execute([$admin_id]);

    // Update school assigned_admin
    $stmtS = $pdo->prepare("UPDATE schools SET assigned_admin_id = ?, assigned_admin_name = ? WHERE id = ?");
    $stmtS->execute([$admin_id, $admin_name, $school_id]);
} catch (Exception $e) {
    // Ignore
}

// Update JSON file
if (file_exists($schoolsFile)) {
    $schools = json_decode(file_get_contents($schoolsFile), true) ?: [];
    foreach ($schools as &$s) {
        if ($s['id'] == $school_id) {
            $s['assigned_admin_id'] = $admin_id;
            $s['assigned_admin_name'] = $admin_name;
            break;
        }
    }
    file_put_contents($schoolsFile, json_encode($schools, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode([
    'status' => 'success',
    'message' => "แต่งตั้งคุณครู \"$admin_name\" เป็น Admin โรงเรียนเรียบร้อยแล้ว"
], JSON_UNESCAPED_UNICODE);
