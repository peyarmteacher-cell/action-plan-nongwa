<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบบริหารแผนปฏิบัติการประจำปีของโรงเรียน - เข้าสู่ระบบและลงทะเบียน</title>
    <meta name="description" content="ระบบบริหารแผนปฏิบัติการประจำปีและงบประมาณสถานศึกษา รองรับการกำหนดปีงบประมาณ การจัดสรร 4 กลุ่มงาน เสนอโครงการ กลั่นกรอง อนุมัติ AI ช่วยร่างโครงการ ติดตามผล เบิกจ่ายจริง และพิมพ์รูปเล่มแผนปฏิบัติการราชการ สพฐ.">
    <meta property="og:title" content="ระบบบริหารแผนปฏิบัติการประจำปีของโรงเรียน">
    <meta property="og:description" content="ระบบบริหารแผนปฏิบัติการประจำปีและงบประมาณสถานศึกษา รองรับการกำหนดปีงบประมาณ การจัดสรร 4 กลุ่มงาน เสนอโครงการ กลั่นกรอง อนุมัติ AI ช่วยร่างโครงการ ติดตามผล เบิกจ่ายจริง และพิมพ์รูปเล่มแผนปฏิบัติการราชการ สพฐ.">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { font-family: 'Sarabun', sans-serif; }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 min-h-screen flex items-center justify-center p-4 text-slate-800">

    <div class="w-full max-w-2xl my-6">
        <!-- Header / Official Seal & System Title -->
        <div class="text-center mb-6">
            <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-2xl p-2">
                <img id="loginLogoImg" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png" 
                     alt="ตราสัญลักษณ์โรงเรียน" class="w-14 h-auto drop-shadow-md object-contain">
            </div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold tracking-wider mb-2">
                <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                ปีงบประมาณ พ.ศ. 2568
            </div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">ระบบบริหารแผนปฏิบัติการประจำปี</h1>
            <p id="loginSchoolAffiliation" class="text-blue-200 text-xs md:text-sm mt-1">
                โรงเรียนอนุบาลพัฒนาวิทยา (รหัส SMIS: 10310001) • สพฐ. กระทรวงศึกษาธิการ
            </p>
        </div>

        <!-- Main Card with Tab Switcher -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 transition-all">
            <!-- Tabs Header -->
            <div class="flex items-center p-1 bg-slate-100 rounded-2xl mb-6">
                <button type="button" id="tabBtnLogin" onclick="switchAuthTab('login')"
                        class="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-white text-blue-600 shadow-sm">
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    เข้าสู่ระบบ (Sign In)
                </button>
                <button type="button" id="tabBtnRegister" onclick="switchAuthTab('register')"
                        class="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900">
                    <i data-lucide="user-plus" class="w-4 h-4"></i>
                    ลงทะเบียนครู/บุคลากร (Register)
                </button>
            </div>

            <!-- ============================================== -->
            <!-- TAB 1: LOGIN -->
            <!-- ============================================== -->
            <div id="tabContentLogin">
                <!-- Super Admin Initial Credentials Banner -->
                <div class="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl flex items-start gap-2.5">
                    <div class="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                        <i data-lucide="shield-alert" class="w-4 h-4"></i>
                    </div>
                    <div class="text-xs text-indigo-950 leading-relaxed">
                        <div class="font-bold flex items-center gap-1.5 text-indigo-900">
                            <span>บัญชี Super Admin สำหรับติดตั้งระบบและเชื่อมต่อฐานข้อมูล</span>
                            <span class="px-1.5 py-0.2 rounded bg-indigo-200/60 text-indigo-800 text-[10px]">เริ่มต้น</span>
                        </div>
                        <p class="text-[11px] text-indigo-700/90 mt-0.5">
                            Username: <code class="px-1.5 py-0.5 bg-white rounded font-mono font-bold text-indigo-900 border border-indigo-200">superadmin</code> 
                            &nbsp;|&nbsp; รหัสผ่าน: <code class="px-1.5 py-0.5 bg-white rounded font-mono font-bold text-indigo-900 border border-indigo-200">password123</code> (หรือ 123456)
                        </p>
                        <p class="text-[10px] text-slate-500 mt-1">
                            * เมื่อเข้าสู่ระบบแล้ว สามารถแก้ไข Username และ Password ได้ทันทีในเมนู Super Admin
                        </p>
                    </div>
                </div>

                <!-- One-Click Quick Role Switcher for fast evaluation -->
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2.5">
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                            เข้าสู่ระบบด่วนตามสิทธิ์ (คลิกเพื่อทดสอบทันที)
                        </label>
                        <span class="text-[11px] text-slate-400">คลิกเข้าใช้งานได้ทันที</span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <!-- Super Admin -->
                        <button type="button" onclick="quickLogin('superadmin', 'password123', 'super_admin')" 
                                class="flex flex-col items-start p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition group">
                            <span class="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                                <i data-lucide="globe-2" class="w-3.5 h-3.5 text-indigo-600"></i> Super Admin
                            </span>
                            <span class="text-[11px] text-indigo-700 mt-1 truncate w-full">ติดตั้ง DB & สิทธิ์ SMIS</span>
                        </button>

                        <!-- School Admin -->
                        <button type="button" onclick="quickLogin('schooladmin', '123', 'school_admin')" 
                                class="flex flex-col items-start p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition group">
                            <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <i data-lucide="settings" class="w-3.5 h-3.5 text-slate-600"></i> Admin โรงเรียน
                            </span>
                            <span class="text-[11px] text-slate-500 mt-1 truncate w-full">ตั้งค่าโรงเรียน & โลโก้</span>
                        </button>

                        <!-- Director -->
                        <button type="button" onclick="quickLogin('director', '123', 'director')" 
                                class="flex flex-col items-start p-3 rounded-xl border border-blue-100 bg-blue-50/70 hover:bg-blue-100 text-left transition group">
                            <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                <i data-lucide="award" class="w-3.5 h-3.5 text-blue-600"></i> ผู้อำนวยการ
                            </span>
                            <span class="text-[11px] text-slate-500 mt-1 truncate w-full">อนุมัติแผน/สั่งการ</span>
                        </button>

                        <!-- Plan Officer -->
                        <button type="button" onclick="quickLogin('planofficer', '123', 'plan_officer')" 
                                class="flex flex-col items-start p-3 rounded-xl border border-emerald-100 bg-emerald-50/70 hover:bg-emerald-100 text-left transition group">
                            <span class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                <i data-lucide="calculator" class="w-3.5 h-3.5 text-emerald-600"></i> จนท.แผน/งบประมาณ
                            </span>
                            <span class="text-[11px] text-slate-500 mt-1 truncate w-full">คำนวณงบรายหัว/ตัดแผน</span>
                        </button>

                        <!-- Department Head -->
                        <button type="button" onclick="quickLogin('head_academic', '123', 'department_head')" 
                                class="flex flex-col items-start p-3 rounded-xl border border-purple-100 bg-purple-50/70 hover:bg-purple-100 text-left transition group">
                            <span class="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <i data-lucide="layers" class="w-3.5 h-3.5 text-purple-600"></i> หน.กลุ่มวิชาการ
                            </span>
                            <span class="text-[11px] text-slate-500 mt-1 truncate w-full">กลั่นกรองโครงการกลุ่ม</span>
                        </button>

                        <!-- Teacher -->
                        <button type="button" onclick="quickLogin('teacher_somchai', '123', 'teacher')" 
                                class="flex flex-col items-start p-3 rounded-xl border border-amber-100 bg-amber-50/70 hover:bg-amber-100 text-left transition group">
                            <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <i data-lucide="file-plus" class="w-3.5 h-3.5 text-amber-600"></i> ครูผู้เสนอโครงการ
                            </span>
                            <span class="text-[11px] text-slate-500 mt-1 truncate w-full">เสนอโครงการ / AI ร่าง</span>
                        </button>
                    </div>
                </div>

                <div class="relative flex py-2 items-center mb-6">
                    <div class="flex-grow border-t border-slate-200"></div>
                    <span class="flex-shrink mx-4 text-xs text-slate-400 font-medium">หรือเข้าสู่ระบบด้วยชื่อผู้ใช้ / เลขบัตร ปชช. 13 หลัก</span>
                    <div class="flex-grow border-t border-slate-200"></div>
                </div>

                <!-- Login Form -->
                <form id="loginForm" class="space-y-4" onsubmit="handleFormLogin(event)">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">ชื่อผู้ใช้งาน หรือ หมายเลขประจำตัวประชาชน (13 หลัก)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i data-lucide="user" class="w-4 h-4"></i>
                            </div>
                            <input type="text" id="username" required 
                                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                                   placeholder="เช่น director, schooladmin, planofficer หรือเลข 13 หลัก" value="director">
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="block text-xs font-semibold text-slate-700">รหัสผ่าน</label>
                            <span class="text-[11px] text-slate-400">ครั้งแรกกำหนดคือ 1-6 (123456)</span>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i data-lucide="lock" class="w-4 h-4"></i>
                            </div>
                            <input type="password" id="password" required 
                                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                                   placeholder="กรอกรหัสผ่าน (เริ่มต้น 123456 หรือ 123)" value="123">
                        </div>
                    </div>

                    <div id="loginError" class="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 hidden"></div>

                    <button type="submit" id="loginBtn" 
                            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                        <i data-lucide="log-in" class="w-4 h-4"></i>
                        เข้าสู่ระบบบริหารแผนปฏิบัติการ
                    </button>
                </form>
            </div>

            <!-- ============================================== -->
            <!-- TAB 2: REGISTER -->
            <!-- ============================================== -->
            <div id="tabContentRegister" class="hidden">
                <div class="mb-5 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
                    <div class="flex items-start gap-2.5">
                        <i data-lucide="info" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"></i>
                        <div class="text-xs text-blue-900 leading-relaxed">
                            <span class="font-bold">คำแนะนำการลงทะเบียน:</span> 
                            ผู้สมัครใช้งานต้องระบุหมายเลข SMIS 8 หลักของโรงเรียนที่ Super Admin เปิดใช้งานแล้ว และใช้หมายเลขประจำตัวประชาชน 13 หลัก 
                            โดย <span class="font-bold underline">รหัสผ่านเริ่มต้นกำหนดคือ 1-6 (123456)</span> และระบบจะให้เปลี่ยนรหัสผ่านในการเข้าสู่ระบบครั้งต่อไป
                        </div>
                    </div>
                </div>

                <form id="registerForm" class="space-y-4" onsubmit="handleFormRegister(event)">
                    <!-- SMIS 8-Digit Code Input & Live Verify -->
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="block text-xs font-semibold text-slate-700">
                                รหัส SMIS 8 หลักของสถานศึกษา <span class="text-red-500">*</span>
                            </label>
                            <span class="text-[11px] text-slate-400">ตรวจสอบสิทธิ์กับ Super Admin</span>
                        </div>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <i data-lucide="school" class="w-4 h-4"></i>
                                </div>
                                <input type="text" id="regSmisCode" maxlength="8" required 
                                       oninput="this.value = this.value.replace(/[^0-9]/g, ''); checkSmisRealtime();"
                                       class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm font-mono tracking-wider transition" 
                                       placeholder="เช่น 10310001 (8 หลัก)" value="10310001">
                            </div>
                            <button type="button" onclick="verifySmisCode(true)" 
                                    class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 border border-slate-200">
                                <i data-lucide="check-circle" class="w-4 h-4 text-blue-600"></i> ตรวจสอบ
                            </button>
                        </div>
                        <!-- SMIS Verification Status Box -->
                        <div id="smisFeedbackBox" class="mt-2 text-xs p-2.5 rounded-xl border flex items-center gap-2 bg-emerald-50 text-emerald-800 border-emerald-200">
                            <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                            <div>
                                <span class="font-bold">โรงเรียนอนุบาลพัฒนาวิทยา</span>
                                <span class="text-[11px] text-emerald-700 block">สพป.บุรีรัมย์ เขต 1 (สถานะ: เปิดใช้งานแล้วโดย Super Admin)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Citizen ID (13 Digits) -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                            หมายเลขประจำตัวประชาชน (13 หลัก) <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i data-lucide="id-card" class="w-4 h-4"></i>
                            </div>
                            <input type="text" id="regIdCard" maxlength="13" required 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm font-mono tracking-widest transition" 
                                   placeholder="กรอกเลขบัตรประชาชน 13 หลัก">
                        </div>
                    </div>

                    <!-- Full Name -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                            ชื่อ - นามสกุล (พร้อมคำนำหน้า) <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i data-lucide="user-check" class="w-4 h-4"></i>
                            </div>
                            <input type="text" id="regName" required 
                                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                                   placeholder="เช่น นายวัชระ พัฒนาการ, นางสาวสุจิตรา แก้วมณี">
                        </div>
                    </div>

                    <!-- Position Selection: from Teacher to Director -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                                ตำแหน่งในสถานศึกษา <span class="text-red-500">*</span>
                            </label>
                            <select id="regPosition" required 
                                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-xs sm:text-sm transition">
                                <optgroup label="สายงานบริหารสถานศึกษา">
                                    <option value="ผู้อำนวยการโรงเรียน (ผู้อำนวยการเชี่ยวชาญพิเศษ คศ.5)">ผู้อำนวยการโรงเรียน (ผู้อำนวยการเชี่ยวชาญพิเศษ คศ.5)</option>
                                    <option value="ผู้อำนวยการโรงเรียน (ผู้อำนวยการเชี่ยวชาญ คศ.4)">ผู้อำนวยการโรงเรียน (ผู้อำนวยการเชี่ยวชาญ คศ.4)</option>
                                    <option value="ผู้อำนวยการโรงเรียน (ผู้อำนวยการชำนาญการพิเศษ คศ.3)">ผู้อำนวยการโรงเรียน (ผู้อำนวยการชำนาญการพิเศษ คศ.3)</option>
                                    <option value="ผู้อำนวยการโรงเรียน (ผู้อำนวยการชำนาญการ คศ.2)">ผู้อำนวยการโรงเรียน (ผู้อำนวยการชำนาญการ คศ.2)</option>
                                    <option value="รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการเชี่ยวชาญ คศ.4)">รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการเชี่ยวชาญ คศ.4)</option>
                                    <option value="รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการชำนาญการพิเศษ คศ.3)">รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการชำนาญการพิเศษ คศ.3)</option>
                                    <option value="รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการชำนาญการ คศ.2)">รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการชำนาญการ คศ.2)</option>
                                </optgroup>
                                <optgroup label="สายงานการสอน / บุคลากรทางการศึกษา">
                                    <option value="ครูเชี่ยวชาญพิเศษ (คศ.5)">ครูเชี่ยวชาญพิเศษ (คศ.5)</option>
                                    <option value="ครูเชี่ยวชาญ (คศ.4)">ครูเชี่ยวชาญ (คศ.4)</option>
                                    <option value="ครูชำนาญการพิเศษ (คศ.3)">ครูชำนาญการพิเศษ (คศ.3)</option>
                                    <option value="ครูชำนาญการ (คศ.2)" selected>ครูชำนาญการ (คศ.2)</option>
                                    <option value="ครู (คศ.1)">ครู (คศ.1)</option>
                                    <option value="ครูผู้ช่วย">ครูผู้ช่วย</option>
                                    <option value="ครูอัตราจ้าง">ครูอัตราจ้าง</option>
                                    <option value="พนักงานราชการ">พนักงานราชการ</option>
                                    <option value="เจ้าหน้าที่แผนงานและงบประมาณ">เจ้าหน้าที่แผนงานและงบประมาณ</option>
                                </optgroup>
                            </select>
                        </div>

                        <!-- Department Selection -->
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                                กลุ่มงานที่สังกัด <span class="text-red-500">*</span>
                            </label>
                            <select id="regDepartment" required 
                                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-xs sm:text-sm transition">
                                <option value="academic">กลุ่มบริหารวิชาการ</option>
                                <option value="budget">กลุ่มบริหารงบประมาณและสินทรัพย์</option>
                                <option value="personnel">กลุ่มบริหารงานบุคคล</option>
                                <option value="general">กลุ่มบริหารทั่วไป</option>
                            </select>
                        </div>
                    </div>

                    <!-- Contact Details -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1.5">เบอร์โทรศัพท์ (ถ้ามี)</label>
                            <input type="text" id="regPhone" 
                                   class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                                   placeholder="เช่น 081-234-5678">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1.5">อีเมล (ถ้ามี)</label>
                            <input type="email" id="regEmail" 
                                   class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                                   placeholder="name@school.ac.th">
                        </div>
                    </div>

                    <!-- Password Info Note -->
                    <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2 text-slate-600">
                            <i data-lucide="key" class="w-4 h-4 text-amber-500"></i>
                            <span>รหัสผ่านเริ่มต้นของระบบ:</span>
                            <span class="font-mono font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded">123456</span>
                        </div>
                        <span class="text-[11px] text-slate-500">เปลี่ยนรหัสเมื่อล็อกอินครั้งแรก</span>
                    </div>

                    <div id="registerError" class="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 hidden"></div>
                    <div id="registerSuccess" class="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 hidden"></div>

                    <button type="submit" id="registerBtn" 
                            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                        <i data-lucide="user-plus" class="w-4 h-4"></i>
                        ยืนยันการลงทะเบียนบุคลากร
                    </button>
                </form>
            </div>

            <!-- Features Summary -->
            <div class="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>Super Admin คุมรหัส SMIS 8 หลัก</span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>คำนวณงบอุดหนุนรายหัว & กพพ.</span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>จัดสรรงบ 4 กลุ่มงาน 100%</span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>AI ร่างโครงการ & พิมพ์รูปเล่ม</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 mt-6">
            ระบบบริหารแผนปฏิบัติการประจำปีของโรงเรียน (School Action Plan OS) • สพฐ. กระทรวงศึกษาธิการ
        </p>
    </div>

    <script>
        lucide.createIcons();

        let smisVerified = true;

        function switchAuthTab(tab) {
            const loginTab = document.getElementById('tabContentLogin');
            const registerTab = document.getElementById('tabContentRegister');
            const btnLogin = document.getElementById('tabBtnLogin');
            const btnRegister = document.getElementById('tabBtnRegister');

            if (tab === 'login') {
                loginTab.classList.remove('hidden');
                registerTab.classList.add('hidden');
                btnLogin.className = "flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-white text-blue-600 shadow-sm";
                btnRegister.className = "flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
            } else {
                loginTab.classList.add('hidden');
                registerTab.classList.remove('hidden');
                btnRegister.className = "flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-white text-emerald-600 shadow-sm";
                btnLogin.className = "flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
                checkSmisRealtime();
            }
            lucide.createIcons();
        }

        let debounceTimer;
        function checkSmisRealtime() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const code = document.getElementById('regSmisCode').value.trim();
                if (code.length === 8) {
                    verifySmisCode(false);
                } else {
                    const box = document.getElementById('smisFeedbackBox');
                    box.className = "mt-2 text-xs p-2.5 rounded-xl border flex items-center gap-2 bg-amber-50 text-amber-800 border-amber-200";
                    box.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-amber-600 shrink-0"></i> <span>กรุณาระบุรหัส SMIS ให้ครบ 8 หลัก (ปัจจุบัน ${code.length}/8)</span>`;
                    smisVerified = false;
                    lucide.createIcons();
                }
            }, 300);
        }

        async function verifySmisCode(showAlert) {
            const code = document.getElementById('regSmisCode').value.trim();
            const box = document.getElementById('smisFeedbackBox');

            if (!code || code.length !== 8) {
                box.className = "mt-2 text-xs p-2.5 rounded-xl border flex items-center gap-2 bg-red-50 text-red-800 border-red-200";
                box.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 text-red-600 shrink-0"></i> <span>กรุณากรอกรหัส SMIS ให้ถูกต้องครบ 8 หลัก</span>`;
                smisVerified = false;
                lucide.createIcons();
                return;
            }

            try {
                const res = await fetch('/api/auth/verify_smis.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ smis_code: code })
                });
                const data = await res.json();

                if (data.status === 'success' && data.school) {
                    smisVerified = true;
                    box.className = "mt-2 text-xs p-2.5 rounded-xl border flex items-center gap-2 bg-emerald-50 text-emerald-800 border-emerald-200";
                    box.innerHTML = `
                        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                        <div>
                            <span class="font-bold text-emerald-950">${data.school.name}</span>
                            <span class="text-[11px] text-emerald-700 block">${data.school.affiliation} (เปิดใช้งานแล้วโดย Super Admin)</span>
                        </div>
                    `;
                } else {
                    smisVerified = false;
                    box.className = "mt-2 text-xs p-2.5 rounded-xl border flex items-center gap-2 bg-red-50 text-red-800 border-red-200";
                    box.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 text-red-600 shrink-0"></i> <span>${data.message || 'ไม่พบรหัส SMIS นี้ หรือโรงเรียนยังไม่ได้รับการเปิดใช้งานจาก Super Admin'}</span>`;
                }
            } catch (err) {
                console.error(err);
                box.className = "mt-2 text-xs p-2.5 rounded-xl border flex items-center gap-2 bg-amber-50 text-amber-800 border-amber-200";
                box.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-amber-600 shrink-0"></i> <span>ไม่สามารถตรวจสอบรหัส SMIS ได้ในขณะนี้</span>`;
            }
            lucide.createIcons();
        }

        async function quickLogin(roleUsername, password, role) {
            document.getElementById('username').value = roleUsername;
            document.getElementById('password').value = password || '123';
            await doLogin(roleUsername, password || '123', role);
        }

        async function handleFormLogin(e) {
            e.preventDefault();
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();
            await doLogin(u, p);
        }

        async function doLogin(username, password, explicitRole) {
            const errDiv = document.getElementById('loginError');
            const btn = document.getElementById('loginBtn');
            errDiv.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-2">⏳</span> กำลังเข้าสู่ระบบ...';

            try {
                const res = await fetch('/api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (data.status === 'success' || data.user) {
                    const user = data.user || data;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    if (data.school) {
                        localStorage.setItem('schoolInfo', JSON.stringify(data.school));
                    }
                    // Redirect to dashboard with mock_role
                    const targetRole = explicitRole || user.role || 'director';
                    window.location.href = `dashboard.php?mock_role=${targetRole}`;
                } else {
                    errDiv.innerText = data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
                    errDiv.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                // Preview fallback
                window.location.href = `dashboard.php?mock_role=${explicitRole || username}`;
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="log-in" class="w-4 h-4 mr-2"></i> เข้าสู่ระบบบริหารแผนปฏิบัติการ';
                lucide.createIcons();
            }
        }

        async function handleFormRegister(e) {
            e.preventDefault();
            const errDiv = document.getElementById('registerError');
            const succDiv = document.getElementById('registerSuccess');
            const btn = document.getElementById('registerBtn');

            errDiv.classList.add('hidden');
            succDiv.classList.add('hidden');

            const smis_code = document.getElementById('regSmisCode').value.trim();
            const id_card = document.getElementById('regIdCard').value.trim();
            const name = document.getElementById('regName').value.trim();
            const position = document.getElementById('regPosition').value;
            const department = document.getElementById('regDepartment').value;
            const phone = document.getElementById('regPhone').value.trim();
            const email = document.getElementById('regEmail').value.trim();

            if (!smisVerified) {
                errDiv.innerText = 'รหัส SMIS 8 หลักของโรงเรียนไม่ถูกต้อง หรือยังไม่ได้รับการเปิดใช้งานจาก Super Admin';
                errDiv.classList.remove('hidden');
                return;
            }

            if (id_card.length !== 13) {
                errDiv.innerText = 'กรุณากรอกหมายเลขประจำตัวประชาชนให้ถูกต้องครบ 13 หลัก';
                errDiv.classList.remove('hidden');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-2">⏳</span> กำลังบันทึกข้อมูลการสมัคร...';

            try {
                const res = await fetch('/api/auth/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        smis_code,
                        id_card,
                        name,
                        position,
                        department,
                        phone,
                        email
                    })
                });
                const data = await res.json();

                if (data.status === 'success') {
                    succDiv.innerHTML = `
                        <div class="font-bold mb-1">🎉 ${data.message}</div>
                        <div>ท่านสามารถเข้าสู่ระบบด้วย <b>เลขบัตรประชาชน</b> และรหัสผ่านเริ่มต้น <b>123456</b> ได้ทันที</div>
                    `;
                    succDiv.classList.remove('hidden');

                    // Reset form and fill login field
                    document.getElementById('username').value = id_card;
                    document.getElementById('password').value = '123456';

                    setTimeout(() => {
                        switchAuthTab('login');
                    }, 2500);
                } else {
                    errDiv.innerText = data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน';
                    errDiv.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                errDiv.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
                errDiv.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="user-plus" class="w-4 h-4 mr-2"></i> ยืนยันการลงทะเบียนบุคลากร';
                lucide.createIcons();
            }
        }

        // On load, fetch current school info to customize branding
        window.addEventListener('DOMContentLoaded', async () => {
            try {
                const res = await fetch('/api/school/get_settings.php');
                const data = await res.json();
                if (data.school) {
                    if (data.school.logo_url) {
                        document.getElementById('loginLogoImg').src = data.school.logo_url;
                    }
                    if (data.school.name) {
                        document.getElementById('loginSchoolAffiliation').innerText = 
                            `${data.school.name} (รหัส SMIS: ${data.school.smis_code || '10310001'}) • ${data.school.affiliation || 'สพฐ. กระทรวงศึกษาธิการ'}`;
                    }
                }
            } catch (e) {
                // Ignore
            }
        });
    </script>
</body>
</html>
