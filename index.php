<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบบริหารแผนปฏิบัติการประจำปีของโรงเรียน - เข้าสู่ระบบ</title>
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

    <div class="w-full max-w-xl">
        <!-- Header / School Seal -->
        <div class="text-center mb-8">
            <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl p-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png" 
                     alt="ตราครุฑ" class="w-14 h-auto drop-shadow-md">
            </div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold tracking-wider mb-2">
                <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                ปีงบประมาณ พ.ศ. 2568
            </div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">ระบบบริหารแผนปฏิบัติการประจำปี</h1>
            <p class="text-blue-200 text-sm mt-1">โรงเรียนอนุบาลพัฒนาวิทยา สังกัด สพฐ. กระทรวงศึกษาธิการ</p>
        </div>

        <!-- Main Login Card -->
        <div class="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 transition-all">
            <div class="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                    <h2 class="text-xl font-bold text-slate-900">เข้าสู่ระบบปฏิบัติงาน</h2>
                    <p class="text-xs text-slate-500 mt-0.5">เลือกบทบาทสำหรับเข้าใช้งาน หรือกรอกชื่อผู้ใช้</p>
                </div>
                <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <i data-lucide="shield-check" class="w-6 h-6"></i>
                </div>
            </div>

            <!-- One-Click Quick Role Switcher for fast evaluation -->
            <div class="mb-6">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    เข้าสู่ระบบด่วนตามสิทธิ์ (5 บทบาท)
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button type="button" onclick="quickLogin('director', 'นายธีระพล เกียรติวิทยา')" 
                            class="flex flex-col items-start p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-left transition group">
                        <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <i data-lucide="award" class="w-3.5 h-3.5 text-blue-600"></i> ผู้อำนวยการ
                        </span>
                        <span class="text-[11px] text-slate-500 mt-1 truncate w-full">อนุมัติแผน/สั่งการ</span>
                    </button>

                    <button type="button" onclick="quickLogin('planofficer', 'นางวิไลพร งบมั่นคง')" 
                            class="flex flex-col items-start p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition group">
                        <span class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <i data-lucide="calculator" class="w-3.5 h-3.5 text-emerald-600"></i> จนท.แผน/งบประมาณ
                        </span>
                        <span class="text-[11px] text-slate-500 mt-1 truncate w-full">จัดสรร 100% / กลั่นกรอง</span>
                    </button>

                    <button type="button" onclick="quickLogin('head_academic', 'นางกัญญา วิชาการดี')" 
                            class="flex flex-col items-start p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-left transition group">
                        <span class="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                            <i data-lucide="layers" class="w-3.5 h-3.5 text-purple-600"></i> หน.กลุ่มวิชาการ
                        </span>
                        <span class="text-[11px] text-slate-500 mt-1 truncate w-full">เห็นชอบโครงการกลุ่ม</span>
                    </button>

                    <button type="button" onclick="quickLogin('teacher_somchai', 'นายสมชาย สอนสนุก')" 
                            class="flex flex-col items-start p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 text-left transition group">
                        <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <i data-lucide="file-plus" class="w-3.5 h-3.5 text-amber-600"></i> ครูผู้เสนอโครงการ
                        </span>
                        <span class="text-[11px] text-slate-500 mt-1 truncate w-full">เสนอโครงการ / AI ร่าง</span>
                    </button>

                    <button type="button" onclick="quickLogin('admin', 'ผู้ดูแลระบบส่วนกลาง')" 
                            class="flex flex-col items-start p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition group col-span-2 sm:col-span-1">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <i data-lucide="settings" class="w-3.5 h-3.5 text-slate-600"></i> ผู้ดูแลระบบ
                        </span>
                        <span class="text-[11px] text-slate-500 mt-1 truncate w-full">จัดการสิทธิ์/ปีงบ</span>
                    </button>
                </div>
            </div>

            <div class="relative flex py-2 items-center mb-6">
                <div class="flex-grow border-t border-slate-200"></div>
                <span class="flex-shrink mx-4 text-xs text-slate-400 font-medium">หรือเข้าสู่ระบบด้วยชื่อผู้ใช้</span>
                <div class="flex-grow border-t border-slate-200"></div>
            </div>

            <!-- Login Form -->
            <form id="loginForm" class="space-y-4" onsubmit="handleFormLogin(event)">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">ชื่อผู้ใช้งาน</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <i data-lucide="user" class="w-4 h-4"></i>
                        </div>
                        <input type="text" id="username" required 
                               class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                               placeholder="เช่น director, planofficer, teacher_somchai" value="director">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">รหัสผ่าน</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <i data-lucide="lock" class="w-4 h-4"></i>
                        </div>
                        <input type="password" id="password" required 
                               class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-sm transition" 
                               placeholder="กรอกรหัสผ่าน (ค่าเริ่มต้น 123)" value="123">
                    </div>
                </div>

                <div id="loginError" class="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 hidden"></div>

                <button type="submit" id="loginBtn" 
                        class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    เข้าสู่ระบบบริหารแผนปฏิบัติการ
                </button>
            </form>

            <!-- Feature Pills -->
            <div class="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>จัดสรรงบ 4 กลุ่มงาน 100%</span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>AI ช่วยร่างโครงการ สพฐ.</span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>กลั่นกรองและอนุมัติออนไลน์</span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                    <span>พิมพ์รูปเล่มแผนและโครงการ</span>
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

        async function quickLogin(roleUsername, name) {
            document.getElementById('username').value = roleUsername;
            document.getElementById('password').value = '123';
            await doLogin(roleUsername, '123');
        }

        async function handleFormLogin(e) {
            e.preventDefault();
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();
            await doLogin(u, p);
        }

        async function doLogin(username, password) {
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
                    // Redirect to dashboard
                    window.location.href = `dashboard.php?mock_role=${user.role || 'director'}`;
                } else {
                    errDiv.innerText = data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
                    errDiv.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                // Fallback for seamless preview experience
                window.location.href = `dashboard.php?mock_role=${username}`;
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="log-in" class="w-4 h-4 mr-2"></i> เข้าสู่ระบบบริหารแผนปฏิบัติการ';
                lucide.createIcons();
            }
        }
    </script>
</body>
</html>
