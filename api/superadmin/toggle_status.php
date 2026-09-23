<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$school_id = (int)($data['school_id'] ?? 0);
$is_active = (int)($data['is_active'] ?? 1);
$statusStr = $is_active ? 'active' : 'inactive';

$configFile = __DIR__ . '/../../db-config.json';
$schoolsFile = __DIR__ . '/../../schools-data.json';

// Update MySQL
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
    $stmt = $pdo->prepare("UPDATE schools SET status = ? WHERE id = ?");
    $stmt->execute([$statusStr, $school_id]);
} catch (Exception $e) {
    // Ignore
}

// Update JSON
if (file_exists($schoolsFile)) {
    $schools = json_decode(file_get_contents($schoolsFile), true) ?: [];
    foreach ($schools as &$s) {
        if ($s['id'] == $school_id) {
            $s['status'] = $statusStr;
            break;
        }
    }
    file_put_contents($schoolsFile, json_encode($schools, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode([
    'status' => 'success',
    'message' => $is_active ? 'เปิดใช้งานสถานศึกษาสำเร็จ' : 'ระงับสถานศึกษาเรียบร้อยแล้ว'
]);
