<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/../../db-config.json';
$schoolsFile = __DIR__ . '/../../schools-data.json';

// Default Seed Schools
$defaultSchools = [
    [
        'id' => 1,
        'code' => '10310001',
        'smis_code' => '10310001',
        'name' => 'โรงเรียนอนุบาลพัฒนาวิทยา',
        'affiliation' => 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1',
        'province' => 'บุรีรัมย์',
        'district' => 'เมืองบุรีรัมย์',
        'subdistrict' => 'ในเมือง',
        'address' => '123 ถนนจิระ ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000',
        'postal_code' => '31000',
        'phone' => '044-611234',
        'email' => 'contact@anubanpat.ac.th',
        'website' => 'https://www.anubanpat.ac.th',
        'director_name' => 'นายธีระพล เกียรติวิทยา',
        'director_position' => 'ผู้อำนวยการโรงเรียนอนุบาลพัฒนาวิทยา (ผู้อำนวยการเชี่ยวชาญ)',
        'plan_officer_name' => 'นางวิไลพร งบมั่นคง',
        'assigned_admin_name' => 'นางสาวสุภาวดี ดูแลระบบ',
        'assigned_admin_id' => 2,
        'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png',
        'status' => 'active',
        'created_at' => '2024-05-01'
    ],
    [
        'id' => 2,
        'code' => '10310002',
        'smis_code' => '10310002',
        'name' => 'โรงเรียนมัธยมศึกษาเกียรติวิทยาคาร',
        'affiliation' => 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาบุรีรัมย์',
        'province' => 'บุรีรัมย์',
        'district' => 'เมืองบุรีรัมย์',
        'subdistrict' => 'อิสาณ',
        'address' => '456 ถนนบุรีรัมย์-ประโคนชัย ตำบลอิสาณ อำเภอเมือง จังหวัดบุรีรัมย์ 31000',
        'postal_code' => '31000',
        'phone' => '044-622345',
        'email' => 'contact@kiatwit.ac.th',
        'website' => 'https://www.kiatwit.ac.th',
        'director_name' => 'ดร.สมศักดิ์ ปัญญารัตน์',
        'director_position' => 'ผู้อำนวยการโรงเรียนมัธยมศึกษาเกียรติวิทยาคาร (ผู้อำนวยการเชี่ยวชาญพิเศษ)',
        'plan_officer_name' => 'นายเกรียงไกร รอบรู้',
        'assigned_admin_name' => 'นายปกรณ์ มีสาระ',
        'assigned_admin_id' => 12,
        'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png',
        'status' => 'active',
        'created_at' => '2024-06-15'
    ],
    [
        'id' => 3,
        'code' => '10310003',
        'smis_code' => '10310003',
        'name' => 'โรงเรียนบ้านหนองบัวโคก',
        'affiliation' => 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1',
        'province' => 'บุรีรัมย์',
        'district' => 'เมืองบุรีรัมย์',
        'subdistrict' => 'หนองตาด',
        'address' => 'หมู่ 4 บ้านหนองบัวโคก ตำบลหนองตาด อำเภอเมือง จังหวัดบุรีรัมย์ 31000',
        'postal_code' => '31000',
        'phone' => '044-633456',
        'email' => 'nongbuakhok@obec.go.th',
        'website' => '',
        'director_name' => 'นางวรรณา รุ่งเรือง',
        'director_position' => 'ผู้อำนวยการโรงเรียน (ผู้อำนวยการชำนาญการพิเศษ)',
        'plan_officer_name' => 'นายธนกฤต วิเศษ',
        'assigned_admin_name' => '',
        'assigned_admin_id' => null,
        'logo_url' => '',
        'status' => 'pending',
        'created_at' => '2024-09-01'
    ]
];

$schools = $defaultSchools;

// If persistent JSON exists
if (file_exists($schoolsFile)) {
    $savedSchools = json_decode(file_get_contents($schoolsFile), true);
    if (is_array($savedSchools) && count($savedSchools) > 0) {
        $schools = $savedSchools;
    }
}

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

    $stmt = $pdo->query("SELECT * FROM schools ORDER BY id ASC");
    $dbSchools = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($dbSchools)) {
        $schools = $dbSchools;
    }
} catch (Exception $e) {
    // Fall back to memory/file
}

echo json_encode([
    'status' => 'success',
    'schools' => $schools,
    'total' => count($schools)
], JSON_UNESCAPED_UNICODE);
