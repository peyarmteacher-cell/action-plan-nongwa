<?php
session_start();

// 1. Check PHP Session - Must be logged in
if (!isset($_SESSION['user_id']) || empty($_SESSION['role'])) {
    header('Location: index.php?error=unauthorized');
    exit;
}

// 2. Strict Role Enforcement - Only super_admin is allowed
if ($_SESSION['role'] !== 'super_admin') {
    header('Location: dashboard.php?error=access_denied');
    exit;
}

// 3. Verify real role against MySQL database if connection exists
$configFile = __DIR__ . '/api/config.php';
if (file_exists($configFile)) {
    require_once $configFile;
    if (isset($pdo) && $pdo instanceof PDO) {
        try {
            $stmt = $pdo->prepare('SELECT id, username, role FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['user_id']]);
            $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$dbUser || $dbUser['role'] !== 'super_admin') {
                header('Location: dashboard.php?error=access_denied');
                exit;
            }
        } catch (Exception $e) {
            // DB error fallback
        }
    }
}

$currentUserName = $_SESSION['name'] ?? 'ผู้ดูแลระบบระดับเขตพื้นที่ฯ';
$currentUserAccount = $_SESSION['username'] ?? 'superadmin';
$systemAffiliation = 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.) กระทรวงศึกษาธิการ';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ศูนย์ควบคุม Super Admin (ระดับเขตพื้นที่ฯ) - ระบบบริหารแผนปฏิบัติการ</title>
    <meta name="description" content="หน้าศูนย์ควบคุมสำหรับ Super Admin เขตพื้นที่การศึกษา จัดการสถานศึกษา รหัส SMIS คำขอสมัครสมาชิก และตั้งค่าฐานข้อมูลระบบ">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Sarabun', sans-serif; background-color: #f8fafc; }
        .tab-btn-active {
            background-color: #4f46e5 !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }
        .tab-btn-active i, .tab-btn-active svg {
            color: #ffffff !important;
        }
    </style>
</head>
<body class="min-h-screen text-slate-800 flex flex-col antialiased">

    <!-- Top Navigation Bar (Super Admin Dedicated) -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <!-- Brand & Official Emblem -->
            <div class="flex items-center gap-3">
                <div class="w-11 h-11 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png" 
                         alt="ตราครุฑราชการ" class="w-full h-full object-contain">
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-extrabold text-slate-900 text-base leading-tight tracking-tight">ศูนย์ควบคุม Super Admin</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            ระดับเขตพื้นที่ฯ / สพฐ.
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 truncate">
                        ระบบบริหารแผนปฏิบัติการประจำปีสถานศึกษา • จัดการสถานศึกษา & บัญชีระบบ
                    </p>
                </div>
            </div>

            <!-- Super Admin Profile & Quick Logout -->
            <div class="flex items-center gap-3">
                <div class="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <?= mb_substr($currentUserName, 0, 1) ?>
                    </div>
                    <div class="text-left leading-tight">
                        <p class="text-xs font-bold text-slate-900 truncate max-w-[160px]" id="saHeaderName"><?= htmlspecialchars($currentUserName) ?></p>
                        <p class="text-[11px] text-indigo-600 font-semibold">Super Admin (ผู้ดูแลระบบสูงสุด)</p>
                    </div>
                </div>

                <button onclick="openChangePasswordModal()" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200">
                    <i data-lucide="key" class="w-3.5 h-3.5 text-amber-600"></i>
                    <span>เปลี่ยนรหัสผ่าน</span>
                </button>

                <a href="logout.php" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition border border-red-200">
                    <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                    <span>ออกจากระบบ</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Super Admin Navigation Tabs (Dedicated 3 Functions) -->
    <div class="bg-white border-b border-slate-200 shadow-2xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button onclick="switchSuperAdminTab('schools')" id="tabBtnSchools" 
                        class="tab-btn-active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0">
                    <i data-lucide="building-2" class="w-4 h-4 text-indigo-600"></i>
                    <span>1. จัดการสถานศึกษา (SMIS 8 หลัก)</span>
                    <span id="badgeSchoolCount" class="px-2 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono font-bold">0</span>
                </button>

                <button onclick="switchSuperAdminTab('users')" id="tabBtnUsers" 
                        class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0">
                    <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
                    <span>2. ผู้ใช้งาน & คำขอสมัครสมาชิก</span>
                    <span id="badgePendingCount" class="hidden px-2 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono font-bold animate-pulse">0</span>
                </button>

                <button onclick="switchSuperAdminTab('system')" id="tabBtnSystem" 
                        class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0">
                    <i data-lucide="database" class="w-4 h-4 text-indigo-600"></i>
                    <span>3. ตั้งค่าระบบ & ฐานข้อมูล MySQL</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Main Content Area -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <!-- Notification Toast -->
        <div id="toastMessage" class="hidden p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm transition"></div>

        <!-- ============================================== -->
        <!-- TAB 1: SCHOOL MANAGEMENT (SMIS 8 DIGITS)       -->
        <!-- ============================================== -->
        <div id="saViewSchools" class="space-y-6">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-indigo-500/20">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-semibold mb-2">
                            <i data-lucide="globe-2" class="w-3.5 h-3.5 text-indigo-400"></i>
                            ศูนย์เปิดใช้งานสถานศึกษา SMIS ระดับเขตพื้นที่การศึกษา
                        </div>
                        <h1 class="text-xl md:text-2xl font-extrabold tracking-tight">การจัดการสถานศึกษาและเปิดใช้งานสิทธิ์ SMIS 8 หลัก</h1>
                        <p class="text-xs text-indigo-200/90 mt-1 max-w-2xl">
                            Super Admin เปิดใช้งานโรงเรียนด้วยรหัส SMIS 8 หลักเพื่อให้คุณครูและบุคลากรลงทะเบียนเข้าสู่ระบบ จากนั้นจึงแต่งตั้ง School Admin ดูแลระบบของโรงเรียนต่อไป
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="loadSuperAdminSchools()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition flex items-center gap-1.5">
                            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> รีเฟรชข้อมูล
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">สถานศึกษาทั้งหมด</span>
                        <div class="p-2 rounded-xl bg-indigo-50 text-indigo-600"><i data-lucide="school" class="w-5 h-5"></i></div>
                    </div>
                    <p class="text-2xl font-extrabold text-slate-900 mt-2" id="sa-total-schools">0 แห่ง</p>
                    <p class="text-xs text-slate-500 mt-1">ในเขตพื้นที่การศึกษา</p>
                </div>

                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">เปิดใช้งานแล้ว (Active)</span>
                        <div class="p-2 rounded-xl bg-emerald-50 text-emerald-600"><i data-lucide="check-circle" class="w-5 h-5"></i></div>
                    </div>
                    <p class="text-2xl font-extrabold text-emerald-600 mt-2" id="sa-active-schools">0 แห่ง</p>
                    <p class="text-xs text-slate-500 mt-1">บุคลากรสามารถลงทะเบียนได้</p>
                </div>

                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">รอเปิดใช้งาน (Pending)</span>
                        <div class="p-2 rounded-xl bg-amber-50 text-amber-600"><i data-lucide="clock" class="w-5 h-5"></i></div>
                    </div>
                    <p class="text-2xl font-extrabold text-amber-600 mt-2" id="sa-pending-schools">0 แห่ง</p>
                    <p class="text-xs text-slate-500 mt-1">รอดำเนินการตรวจสอบ</p>
                </div>

                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">บุคลากรในระบบ</span>
                        <div class="p-2 rounded-xl bg-blue-50 text-blue-600"><i data-lucide="users" class="w-5 h-5"></i></div>
                    </div>
                    <p class="text-2xl font-extrabold text-blue-600 mt-2" id="sa-total-users">0 คน</p>
                    <p class="text-xs text-slate-500 mt-1">ลงทะเบียนด้วยเลข 13 หลัก</p>
                </div>
            </div>

            <!-- Open New School Card -->
            <div class="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xs bg-gradient-to-br from-white via-white to-indigo-50/30">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
                        <i data-lucide="plus-circle" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900">เปิดใช้งานสถานศึกษาใหม่ (Activate School ด้วยรหัส SMIS 8 หลัก)</h3>
                        <p class="text-xs text-slate-500">
                            ระบุรหัส SMIS 8 หลักเพื่อเปิดระบบให้โรงเรียน (ยังไม่ต้องกำหนด Admin ในขั้นตอนนี้ เมื่อครูสมัครเข้ามาแล้วจึงเลือกแต่งตั้งต่อไป)
                        </p>
                    </div>
                </div>

                <div class="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2.5">
                    <i data-lucide="info" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
                    <div>
                        <span class="font-bold">ขั้นตอนการเปิดใช้งาน:</span> เมื่อ Super Admin เปิดใช้งานโรงเรียนแล้ว คุณครูและบุคลากรของโรงเรียนนั้นจะสามารถสมัครสมาชิกที่หน้าระบบด้วยรหัส SMIS 8 หลักได้ จากนั้น Super Admin จึงจะมาคลิกปุ่ม <b>"เลือก Admin จากครูในโรงเรียน"</b> เพื่อแต่งตั้งผู้ดูแลระบบของโรงเรียนนั้น
                    </div>
                </div>

                <form id="newSchoolForm" onsubmit="handleSuperAdminAddSchool(event)" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                รหัส SMIS 8 หลัก <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="sa_new_smis" maxlength="8" required 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                                   placeholder="เช่น 10310004" 
                                   class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-indigo-500">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                ชื่อสถานศึกษา <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="sa_new_name" required 
                                   placeholder="เช่น โรงเรียนมัธยมวิทยาคมบุรีรัมย์" 
                                   class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">สังกัดเขตพื้นที่ฯ</label>
                            <input type="text" id="sa_new_affiliation" value="สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">อำเภอ</label>
                            <input type="text" id="sa_new_district" value="เมืองบุรีรัมย์" placeholder="อำเภอ" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">จังหวัด</label>
                            <input type="text" id="sa_new_province" value="บุรีรัมย์" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none">
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="sa_new_active" checked class="w-4 h-4 rounded text-indigo-600 cursor-pointer">
                            <label for="sa_new_active" class="text-xs font-bold text-slate-700 cursor-pointer">เปิดใช้งานทันที (Active Status)</label>
                        </div>
                        <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5">
                            <i data-lucide="check" class="w-4 h-4"></i> บันทึกและเปิดใช้งานสถานศึกษา
                        </button>
                    </div>
                </form>
            </div>

            <!-- Schools Management Table -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900">บัญชีสถานศึกษาในระบบ (SMIS Management)</h3>
                        <p class="text-xs text-slate-500 mt-0.5">เปิด-ปิดการใช้งาน และเลือกแต่งตั้งผู้ดูแลระบบของโรงเรียนจากครูที่สมัครสมาชิก</p>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <input type="text" id="schoolSearchInput" oninput="filterSchoolsTable()" placeholder="ค้นหารหัส SMIS หรือชื่อโรงเรียน..." 
                               class="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white w-full sm:w-64">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th class="p-3.5 w-28">รหัส SMIS (8 หลัก)</th>
                                <th class="p-3.5">ชื่อสถานศึกษา</th>
                                <th class="p-3.5">หน่วยงานสังกัด</th>
                                <th class="p-3.5">Admin โรงเรียนที่กำหนด</th>
                                <th class="p-3.5 w-28 text-center">สถานะ</th>
                                <th class="p-3.5 w-44 text-center">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="superAdminSchoolsTableBody" class="divide-y divide-slate-100">
                            <tr><td colspan="6" class="p-6 text-center text-slate-400">กำลังโหลดข้อมูลสถานศึกษา...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 2: USERS & REGISTRATION REQUESTS           -->
        <!-- ============================================== -->
        <div id="saViewUsers" class="hidden space-y-6">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-blue-500/20">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold mb-2">
                            <i data-lucide="user-check" class="w-3.5 h-3.5 text-blue-400"></i>
                            ศูนย์บริหารจัดการผู้ใช้งานและคำขอสมัครสมาชิก
                        </div>
                        <h1 class="text-xl md:text-2xl font-extrabold tracking-tight">การอนุมัติคำขอสมัครสมาชิกและบริหารสิทธิ์ผู้ใช้</h1>
                        <p class="text-xs text-blue-200/90 mt-1 max-w-2xl">
                            ตรวจสอบคำขอลงทะเบียนของครูและบุคลากรจากสถานศึกษาต่างๆ ในสังกัด อนุมัติการเข้าใช้งาน และตรวจสอบบัญชีผู้ใช้ทั้งหมด
                        </p>
                    </div>
                    <button onclick="loadPendingUsers(); loadAllUsers();" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition flex items-center gap-1.5 shrink-0">
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> รีเฟรชรายชื่อ
                    </button>
                </div>
            </div>

            <!-- Pending Requests Section -->
            <div class="bg-white rounded-3xl border border-amber-200/80 shadow-xs overflow-hidden">
                <div class="p-5 border-b border-amber-100 bg-amber-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                                คำขอสมัครสมาชิกที่รอการอนุมัติ (Pending Approvals)
                                <span id="pendingRequestsBadge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    0 คำขอ
                                </span>
                            </h3>
                            <p class="text-xs text-slate-500 mt-0.5">บุคลากรที่ลงทะเบียนด้วยรหัส SMIS ของโรงเรียน และรอการตรวจสอบสิทธิ์</p>
                        </div>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th class="p-3.5">ชื่อ - นามสกุล</th>
                                <th class="p-3.5">เลขประจำตัวประชาชน (13 หลัก)</th>
                                <th class="p-3.5">สถานศึกษา / สังกัด</th>
                                <th class="p-3.5">ตำแหน่งที่ระบุ</th>
                                <th class="p-3.5">ช่องทางติดต่อ</th>
                                <th class="p-3.5 w-44 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody id="pendingUsersTableBody" class="divide-y divide-slate-100">
                            <tr><td colspan="6" class="p-6 text-center text-slate-400">กำลังโหลดคำขอ...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- All System Users Section -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900">รายชื่อผู้ใช้งานทั้งหมดในระบบ (All Registered Users)</h3>
                        <p class="text-xs text-slate-500 mt-0.5">รายชื่อบัญชีผู้ใช้งานที่ได้รับการอนุมัติแล้วในทุกสถานศึกษา</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <input type="text" id="userSearchInput" oninput="filterAllUsersTable()" placeholder="ค้นหาชื่อ, เลข 13 หลัก หรือโรงเรียน..." 
                               class="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white w-full sm:w-64">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th class="p-3.5">ชื่อ - นามสกุล</th>
                                <th class="p-3.5">Username / เลข 13 หลัก</th>
                                <th class="p-3.5">สถานศึกษา</th>
                                <th class="p-3.5">ตำแหน่ง</th>
                                <th class="p-3.5">บทบาท (Role)</th>
                                <th class="p-3.5 w-28 text-center">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="allUsersTableBody" class="divide-y divide-slate-100">
                            <tr><td colspan="6" class="p-6 text-center text-slate-400">กำลังโหลดรายชื่อผู้ใช้...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 3: SYSTEM & DATABASE SETTINGS              -->
        <!-- ============================================== -->
        <div id="saViewSystem" class="hidden space-y-6">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-indigo-500/20">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-semibold mb-2">
                            <i data-lucide="settings" class="w-3.5 h-3.5 text-indigo-400"></i>
                            ศูนย์ตั้งค่าระบบและการเชื่อมต่อฐานข้อมูล
                        </div>
                        <h1 class="text-xl md:text-2xl font-extrabold tracking-tight">ตั้งค่าบัญชี Super Admin และโครงสร้างฐานข้อมูล MySQL</h1>
                        <p class="text-xs text-indigo-200/90 mt-1 max-w-2xl">
                            จัดการบัญชีผู้ดูแลระบบสูงสุด กำหนดค่าเซิร์ฟเวอร์ MySQL จริง ทดสอบการเชื่อมต่อ และรัน Migration สร้างตารางอัตโนมัติ
                        </p>
                    </div>
                </div>
            </div>

            <!-- Card 1: Super Admin Credentials -->
            <div class="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
                            <i data-lucide="user-cog" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                ตั้งค่าบัญชีและรหัสผ่าน Super Admin
                                <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                                    ผู้ดูแลระบบสูงสุด
                                </span>
                            </h3>
                            <p class="text-xs text-slate-500">สามารถแก้ไข Username และ Password ของผู้ดูแลระบบเขตพื้นที่ฯ ได้ที่นี่</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <span class="text-slate-500">สถานะรหัสผ่าน:</span>
                        <span id="sa-pwd-status" class="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                            เริ่มต้น (password123)
                        </span>
                    </div>
                </div>

                <form id="superAdminCredentialsForm" onsubmit="handleSuperAdminCredentialsSubmit(event)" class="mt-4 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                Username Super Admin <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <i data-lucide="at-sign" class="w-4 h-4"></i>
                                </div>
                                <input type="text" id="sa_username" required placeholder="เช่น superadmin" 
                                       class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                ชื่อ-นามสกุล Super Admin
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <i data-lucide="user" class="w-4 h-4"></i>
                                </div>
                                <input type="text" id="sa_name" placeholder="ผู้ดูแลระบบระดับเขตพื้นที่ฯ (Super Admin)" 
                                       class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                กำหนดรหัสผ่านใหม่ (หากต้องการเปลี่ยน)
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <i data-lucide="key" class="w-4 h-4"></i>
                                </div>
                                <input type="password" id="sa_new_password" minlength="6" placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" 
                                       class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-indigo-500 transition">
                                <button type="button" onclick="togglePasswordVisibility('sa_new_password')" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                    <i data-lucide="eye" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <i data-lucide="check-circle" class="w-4 h-4"></i>
                                </div>
                                <input type="password" id="sa_confirm_password" minlength="6" placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง" 
                                       class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-indigo-500 transition">
                                <button type="button" onclick="togglePasswordVisibility('sa_confirm_password')" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                    <i data-lucide="eye" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ตำแหน่ง / สังกัด</label>
                            <input type="text" id="sa_position" placeholder="ผู้อำนวยการกลุ่มนโยบายและแผน (สพป./สพฐ.)" 
                                   class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                            <input type="text" id="sa_phone" placeholder="เช่น 0812345678" 
                                   class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">อีเมลติดต่อ</label>
                            <input type="email" id="sa_email" placeholder="superadmin@obec.go.th" 
                                   class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition">
                        </div>
                    </div>

                    <div id="saCredentialsAlert" class="hidden p-3 rounded-xl text-xs font-medium"></div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <span class="text-[11px] text-slate-400">
                            * บันทึกแล้วสามารถใช้ Username และ Password ใหม่ในการเข้าสู่ระบบครั้งถัดไปได้ทันที
                        </span>
                        <button type="submit" id="btnSaveSaCredentials" 
                                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i>
                            <span>บันทึกการแก้ไขบัญชี Super Admin</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Card 2: Real Database Installation & MySQL Configuration -->
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/30">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="space-y-1.5 max-w-2xl">
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            ศูนย์บริหารและติดตั้งฐานข้อมูลจริง (MySQL / MariaDB Migrations)
                        </div>
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i data-lucide="database" class="w-5 h-5 text-indigo-400"></i>
                            ติดตั้งและเชื่อมต่อโครงสร้างฐานข้อมูลระบบจริง
                        </h3>
                        <p class="text-xs text-slate-300 leading-relaxed">
                            สั่งการติดตั้งตาราง MySQL ทั้ง 10 ตารางหลักโดยอัตโนมัติ (ตาราง schools, users พร้อม Super Admin, student_subsidies, fiscal_years, budget_sources, department_allocations, projects, budget_items, expenses, progress_logs)
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
                        <button type="button" onclick="toggleDbConfigPanel()" 
                                class="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition flex items-center gap-1.5">
                            <i data-lucide="settings" class="w-3.5 h-3.5 text-indigo-300"></i>
                            <span>ตั้งค่าการเชื่อมต่อ MySQL</span>
                        </button>
                        <a href="/database.sql" download="school_action_plan_database.sql"
                           class="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition flex items-center gap-1.5">
                            <i data-lucide="download" class="w-3.5 h-3.5 text-emerald-300"></i>
                            <span>ดาวน์โหลด .sql</span>
                        </a>
                        <button id="btnInstallDb" onclick="runInstallDatabase()" 
                                class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            <span>ติดตั้ง / อัปเดตตารางฐานข้อมูล</span>
                        </button>
                    </div>
                </div>

                <!-- MySQL Connection Configuration Panel -->
                <div id="dbConfigPanel" class="hidden mt-5 pt-4 border-t border-indigo-500/20">
                    <div class="bg-black/30 rounded-2xl p-4 border border-white/10">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-xs font-bold text-indigo-200 flex items-center gap-2">
                                <i data-lucide="server" class="w-4 h-4 text-indigo-400"></i>
                                กำหนดค่าเชื่อมต่อฐานข้อมูล MySQL จริง (Real MySQL Server Connection)
                            </h4>
                            <span id="dbConnBadge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                สถานะ: รอการทดสอบ
                            </span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                            <div>
                                <label class="block text-slate-400 text-[11px] mb-1">Host / IP</label>
                                <input type="text" id="db_host" value="localhost" 
                                       class="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-indigo-400">
                            </div>
                            <div>
                                <label class="block text-slate-400 text-[11px] mb-1">Port</label>
                                <input type="number" id="db_port" value="3306" 
                                       class="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-indigo-400">
                            </div>
                            <div>
                                <label class="block text-slate-400 text-[11px] mb-1">ชื่อฐานข้อมูล (Database)</label>
                                <input type="text" id="db_name" value="school_action_plan" 
                                       class="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-indigo-400">
                            </div>
                            <div>
                                <label class="block text-slate-400 text-[11px] mb-1">ผู้ใช้ (User)</label>
                                <input type="text" id="db_user" value="root" 
                                       class="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-indigo-400">
                            </div>
                            <div>
                                <label class="block text-slate-400 text-[11px] mb-1">รหัสผ่าน (Password)</label>
                                <input type="password" id="db_pass" placeholder="เว้นว่างถ้าไม่มี" 
                                       class="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-indigo-400">
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/5">
                            <div id="dbTestMsg" class="text-[11px] text-slate-300">
                                ค่านี้จะถูกบันทึกใน <code class="text-indigo-300">api/config.php</code> และ <code class="text-indigo-300">db-config.json</code>
                            </div>
                            <div class="flex items-center gap-2">
                                <button type="button" onclick="testDatabaseConnection()" id="btnTestDb" 
                                        class="px-3.5 py-1.5 bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5">
                                    <i data-lucide="activity" class="w-3.5 h-3.5"></i>
                                    <span>ทดสอบการเชื่อมต่อ</span>
                                </button>
                                <button type="button" onclick="saveDatabaseConnection()" id="btnSaveDb" 
                                        class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5">
                                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                                    <span>บันทึกการตั้งค่า</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Migration Log Box -->
                <div id="dbInstallResultBox" class="hidden mt-5 pt-4 border-t border-indigo-500/20">
                    <div class="flex items-center justify-between mb-2.5">
                        <span class="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <i data-lucide="terminal" class="w-3.5 h-3.5 text-emerald-400"></i>
                            บันทึกผลการติดตั้งและอัปเดตฐานข้อมูล (Migration Log)
                        </span>
                        <span id="dbInstallStatusBadge" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            อัปเดตล่าสุด: กำลังประมวลผล...
                        </span>
                    </div>
                    <div id="dbInstallLogContent" class="bg-black/40 rounded-xl p-3.5 font-mono text-[11px] text-slate-200 max-h-56 overflow-y-auto space-y-1.5 border border-white/5">
                        <!-- Populated dynamically via JS -->
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- ============================================== -->
    <!-- MODALS SECTION                                 -->
    <!-- ============================================== -->

    <!-- Modal 1: Assign School Admin Modal -->
    <div id="assignAdminModal" class="hidden fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                        <i data-lucide="shield-check" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900">แต่งตั้งผู้ดูแลระบบประจำโรงเรียน (School Admin)</h3>
                        <p class="text-xs text-slate-500">เลือกคุณครูที่ลงทะเบียนในสถานศึกษานี้เพื่อมอบหมายสิทธิ์ Admin ดูแลระบบ</p>
                    </div>
                </div>
                <button type="button" onclick="closeAssignAdminModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- School Info Summary Box -->
            <div class="my-4 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl shrink-0">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span id="assignAdminSchoolName" class="font-bold text-slate-900 text-sm">กำลังโหลด...</span>
                            <span id="assignAdminSmisBadge" class="px-2 py-0.5 bg-indigo-200/60 text-indigo-800 text-[11px] font-mono font-bold rounded-md">SMIS: -</span>
                        </div>
                        <p id="assignAdminAffiliation" class="text-xs text-slate-500 mt-0.5">-</p>
                    </div>
                    <div class="text-left sm:text-right">
                        <span class="text-[11px] text-slate-500 block">Admin ปัจจุบัน:</span>
                        <span id="assignAdminCurrentAdmin" class="text-xs font-bold text-indigo-900">-</span>
                    </div>
                </div>
            </div>

            <!-- Registered Teachers List Container -->
            <div class="flex-1 overflow-y-auto pr-1">
                <div class="flex items-center justify-between mb-2.5">
                    <h4 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
                        รายชื่อคุณครูและบุคลากรที่สมัครสมาชิกแล้วในโรงเรียนนี้
                        <span id="assignAdminTeacherCount" class="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">0 คน</span>
                    </h4>
                </div>

                <div id="assignAdminTeacherList" class="space-y-2.5">
                    <!-- Populated dynamically via JS -->
                </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-end shrink-0 mt-4">
                <button type="button" onclick="closeAssignAdminModal()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    </div>

    <!-- Modal 2: Change Password Modal -->
    <div id="changePasswordModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                <div class="flex items-center gap-2.5">
                    <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <i data-lucide="key" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-slate-900">เปลี่ยนรหัสผ่าน Super Admin</h3>
                        <p class="text-[11px] text-slate-500">กำหนดรหัสผ่านใหม่เพื่อความปลอดภัย</p>
                    </div>
                </div>
                <button type="button" onclick="closeChangePasswordModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <form id="changePasswordForm" onsubmit="handleChangePasswordSubmit(event)" class="mt-4 space-y-3.5">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
                    <input type="password" id="chg_old_password" required placeholder="กรอกรหัสผ่านเดิม" 
                           class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านใหม่</label>
                    <input type="password" id="chg_new_password" required minlength="6" placeholder="อย่างน้อย 6 ตัวอักษร" 
                           class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                    <input type="password" id="chg_confirm_password" required minlength="6" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" 
                           class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500">
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button type="button" onclick="closeChangePasswordModal()" class="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold rounded-xl transition">
                        ยกเลิก
                    </button>
                    <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        <span>บันทึกรหัสผ่านใหม่</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Super Admin Frontend JavaScript -->
    <script src="super_admin.js"></script>
</body>
</html>
