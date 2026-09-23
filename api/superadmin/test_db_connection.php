<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$host = trim($data['host'] ?? 'localhost');
$port = trim($data['port'] ?? '3306');
$db   = trim($data['database'] ?? 'school_action_plan');
$user = trim($data['user'] ?? 'root');
$pass = $data['password'] ?? '';

try {
    // Attempt PDO connection test
    $pdoTest = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3
    ]);

    // Check or create database
    $pdoTest->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdoTest->exec("USE `$db`");

    echo json_encode([
        'status' => 'success',
        'connected' => true,
        'message' => "เชื่อมต่อ MySQL Server ($host:$port/$db) สำเร็จเรียบร้อย พร้อมสำหรับการติดตั้งและใช้งานจริง"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'connected' => false,
        'message' => 'ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL ได้: ' . $e->getMessage()
    ]);
}
