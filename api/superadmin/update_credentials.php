<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$config_file = __DIR__ . '/../config.php';
$pdo = null;
if (file_exists($config_file)) {
    require_once $config_file;
}

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$new_password = trim($data['new_password'] ?? '');
$name = trim($data['name'] ?? '');
$position = trim($data['position'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');

if (empty($username)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'กรุณาระบุ Username ของ Super Admin'
    ]);
    exit;
}

try {
    if (isset($pdo) && $pdo instanceof PDO) {
        // Find existing super_admin
        $stmt = $pdo->prepare("SELECT * FROM users WHERE role = 'super_admin' LIMIT 1");
        $stmt->execute();
        $admin = $stmt->fetch();

        if ($admin) {
            if (!empty($new_password)) {
                $stmtUpdate = $pdo->prepare("
                    UPDATE users 
                    SET username = ?, password = ?, name = COALESCE(NULLIF(?, ''), name), position = COALESCE(NULLIF(?, ''), position), phone = ?, email = ?
                    WHERE id = ?
                ");
                $stmtUpdate->execute([$username, $new_password, $name, $position, $phone, $email, $admin['id']]);
            } else {
                $stmtUpdate = $pdo->prepare("
                    UPDATE users 
                    SET username = ?, name = COALESCE(NULLIF(?, ''), name), position = COALESCE(NULLIF(?, ''), position), phone = ?, email = ?
                    WHERE id = ?
                ");
                $stmtUpdate->execute([$username, $name, $position, $phone, $email, $admin['id']]);
            }
        } else {
            // Insert Super Admin
            $pw = !empty($new_password) ? $new_password : 'password123';
            $stmtInsert = $pdo->prepare("
                INSERT INTO users (username, password, name, position, role, is_approved, must_change_password)
                VALUES (?, ?, ?, ?, 'super_admin', 1, 0)
            ");
            $stmtInsert->execute([$username, $pw, $name ?: 'ผู้ดูแลระบบระดับเขตพื้นที่ฯ (Super Admin)', $position ?: 'ผู้อำนวยการกลุ่มนโยบายและแผน']);
        }
    }

    // Update Session
    $_SESSION['username'] = $username;
    if (!empty($name)) $_SESSION['name'] = $name;

    echo json_encode([
        'status' => 'success',
        'message' => 'บันทึกการแก้ไข Username และ Password ของ Super Admin สำเร็จเรียบร้อยแล้ว',
        'user' => [
            'username' => $username,
            'name' => $name,
            'position' => $position,
            'phone' => $phone,
            'email' => $email,
            'role' => 'super_admin'
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' . $e->getMessage()
    ]);
}
