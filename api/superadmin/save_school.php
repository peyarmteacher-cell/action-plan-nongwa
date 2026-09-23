<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$smis_code = trim($data['smis_code'] ?? '');
$name = trim($data['name'] ?? '');
$affiliation = trim($data['affiliation'] ?? '');
$province = trim($data['province'] ?? 'บุรีรัมย์');
$district = trim($data['district'] ?? 'เมืองบุรีรัมย์');
$status = trim($data['status'] ?? 'active');

if (empty($smis_code) || strlen($smis_code) !== 8) {
    echo json_encode(['status' => 'error', 'message' => 'รหัส SMIS ต้องเป็นตัวเลข 8 หลัก']);
    exit;
}
if (empty($name)) {
    echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุชื่อสถานศึกษา']);
    exit;
}

$configFile = __DIR__ . '/../../db-config.json';
$schoolsFile = __DIR__ . '/../../schools-data.json';

// Try MySQL
$savedInDb = false;
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

    $stmt = $pdo->prepare("INSERT INTO schools (smis_code, code, name, affiliation, province, district, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$smis_code, $smis_code, $name, $affiliation, $province, $district, $status]);
    $savedInDb = true;
} catch (Exception $e) {
    // Ignore and fallback to file
}

// Save to JSON storage
$schools = [];
if (file_exists($schoolsFile)) {
    $schools = json_decode(file_get_contents($schoolsFile), true) ?: [];
}
$newId = count($schools) > 0 ? max(array_column($schools, 'id')) + 1 : 1;
$newSchool = [
    'id' => $newId,
    'code' => $smis_code,
    'smis_code' => $smis_code,
    'name' => $name,
    'affiliation' => $affiliation,
    'province' => $province,
    'district' => $district,
    'subdistrict' => '',
    'address' => '',
    'postal_code' => '',
    'phone' => '',
    'email' => '',
    'website' => '',
    'director_name' => '',
    'director_position' => '',
    'plan_officer_name' => '',
    'assigned_admin_name' => '',
    'assigned_admin_id' => null,
    'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png',
    'status' => $status,
    'created_at' => date('Y-m-d')
];
$schools[] = $newSchool;
file_put_contents($schoolsFile, json_encode($schools, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'status' => 'success',
    'message' => "เปิดใช้งานสถานศึกษา $name (SMIS: $smis_code) สำเร็จเรียบร้อยแล้ว",
    'school' => $newSchool
], JSON_UNESCAPED_UNICODE);
