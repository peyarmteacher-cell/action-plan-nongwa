<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/../../db-config.json';
$schools = [];

// Fetch from MySQL Database
try {
    $dbConfig = ['host' => 'localhost', 'port' => 3306, 'database' => 'school_action_plan', 'user' => 'root', 'password' => ''];
    if (file_exists($configFile)) {
        $dbConfig = array_merge($dbConfig, json_decode(file_get_contents($configFile), true) ?: []);
    }
    $pdo = new PDO(
        "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset=utf8mb4",
        $dbConfig['user'],
        $dbConfig['password'] ?? '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 3]
    );

    $stmt = $pdo->query("SELECT * FROM schools ORDER BY id ASC");
    $dbSchools = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($dbSchools)) {
        $schools = $dbSchools;
    }
} catch (Exception $e) {
    // Database connection error
}

echo json_encode([
    'status' => 'success',
    'schools' => $schools,
    'total' => count($schools)
], JSON_UNESCAPED_UNICODE);
