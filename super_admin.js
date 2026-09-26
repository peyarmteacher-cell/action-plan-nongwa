// ==========================================
// Super Admin Control Center JavaScript
// ==========================================

let allSchoolsData = [];
let allUsersData = [];
let currentAssignAdminSchoolId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (window.lucide) lucide.createIcons();

    // Verify session user locally
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        try {
            const u = JSON.parse(stored);
            if (u && u.name) {
                const hName = document.getElementById('saHeaderName');
                if (hName) hName.innerText = u.name;
            }
        } catch (e) {}
    }

    // Load initial data
    await loadSuperAdminSchools();
    await loadSuperAdminCredentials();
    await loadPendingUsers();
});

// Tab Switcher for Super Admin Dedicated Modules
function switchSuperAdminTab(tabKey) {
    const vSchools = document.getElementById('saViewSchools');
    const vUsers = document.getElementById('saViewUsers');
    const vSystem = document.getElementById('saViewSystem');

    const btnSchools = document.getElementById('tabBtnSchools');
    const btnUsers = document.getElementById('tabBtnUsers');
    const btnSystem = document.getElementById('tabBtnSystem');

    // Hide all
    if (vSchools) vSchools.classList.add('hidden');
    if (vUsers) vUsers.classList.add('hidden');
    if (vSystem) vSystem.classList.add('hidden');

    // Deactivate buttons
    [btnSchools, btnUsers, btnSystem].forEach(btn => {
        if (btn) {
            btn.className = "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0";
        }
    });

    if (tabKey === 'schools') {
        if (vSchools) vSchools.classList.remove('hidden');
        if (btnSchools) btnSchools.className = "tab-btn-active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-white shrink-0";
        loadSuperAdminSchools();
    } else if (tabKey === 'users') {
        if (vUsers) vUsers.classList.remove('hidden');
        if (btnUsers) btnUsers.className = "tab-btn-active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-white shrink-0";
        loadPendingUsers();
        loadAllUsers();
    } else if (tabKey === 'system') {
        if (vSystem) vSystem.classList.remove('hidden');
        if (btnSystem) btnSystem.className = "tab-btn-active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 text-white shrink-0";
        loadSuperAdminCredentials();
    }

    if (window.lucide) lucide.createIcons();
}
window.switchSuperAdminTab = switchSuperAdminTab;

// Toast notification
function showToast(msg, type = 'success') {
    const el = document.getElementById('toastMessage');
    if (!el) return;

    el.innerText = msg;
    el.className = `p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm transition ${
        type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
    }`;
    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 4000);
}
window.showToast = showToast;

// Toggle Password Visibility
function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    input.type = (input.type === 'password') ? 'text' : 'password';
}
window.togglePasswordVisibility = togglePasswordVisibility;

// ==========================================
// 1. SCHOOL MANAGEMENT FUNCTIONS
// ==========================================

async function loadSuperAdminSchools() {
    try {
        const res = await fetch('/api/superadmin/get_schools.php');
        const data = await res.json();
        if (data.status === 'success') {
            allSchoolsData = data.schools || [];

            // Update stats
            const totalEl = document.getElementById('sa-total-schools');
            const activeEl = document.getElementById('sa-active-schools');
            const pendingEl = document.getElementById('sa-pending-schools');
            const usersEl = document.getElementById('sa-total-users');
            const badgeCount = document.getElementById('badgeSchoolCount');

            const activeCount = allSchoolsData.filter(s => s.is_active === 1 || s.is_active === true).length;
            const pendingCount = allSchoolsData.length - activeCount;

            if (totalEl) totalEl.innerText = `${allSchoolsData.length} แห่ง`;
            if (activeEl) activeEl.innerText = `${activeCount} แห่ง`;
            if (pendingEl) pendingEl.innerText = `${pendingCount} แห่ง`;
            if (usersEl) usersEl.innerText = `${data.total_users || 0} คน`;
            if (badgeCount) badgeCount.innerText = allSchoolsData.length;

            renderSchoolsTable(allSchoolsData);
        }
    } catch (err) {
        console.error('Error loading schools:', err);
    }
}
window.loadSuperAdminSchools = loadSuperAdminSchools;

function renderSchoolsTable(schools) {
    const tbody = document.getElementById('superAdminSchoolsTableBody');
    if (!tbody) return;

    if (schools.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">ยังไม่มีข้อมูลสถานศึกษาในระบบ</td></tr>`;
        return;
    }

    tbody.innerHTML = schools.map(s => {
        const isActive = (s.is_active === 1 || s.is_active === true);
        const hasAdmin = !!s.admin_name;

        return `
            <tr class="hover:bg-slate-50/80 transition">
                <td class="p-3.5 font-mono font-bold text-indigo-900">${s.smis_code}</td>
                <td class="p-3.5 font-bold text-slate-900">${s.name}</td>
                <td class="p-3.5 text-slate-500">${s.affiliation || '-'}</td>
                <td class="p-3.5">
                    ${hasAdmin ? `
                        <div class="flex items-center gap-1.5">
                            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                ${s.admin_name.charAt(0)}
                            </span>
                            <div>
                                <span class="font-bold text-slate-900 text-xs block">${s.admin_name}</span>
                                <span class="text-[10px] text-slate-400">${s.admin_position || 'Admin โรงเรียน'}</span>
                            </div>
                        </div>
                    ` : `
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            ยังไม่ได้กำหนด
                        </span>
                    `}
                </td>
                <td class="p-3.5 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }">
                        ${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                </td>
                <td class="p-3.5 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="toggleSchoolStatus(${s.id}, ${isActive ? 0 : 1})" 
                                class="px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                                    isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }">
                            ${isActive ? 'ระงับ' : 'เปิดใช้งาน'}
                        </button>
                        <button onclick="openAssignAdminModal(${s.id})" 
                                class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition flex items-center gap-1">
                            <i data-lucide="user-check" class="w-3 h-3"></i>
                            <span>${hasAdmin ? 'เปลี่ยน Admin' : 'เลือก Admin จากครู'}</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function filterSchoolsTable() {
    const q = (document.getElementById('schoolSearchInput')?.value || '').toLowerCase().trim();
    if (!q) {
        renderSchoolsTable(allSchoolsData);
        return;
    }
    const filtered = allSchoolsData.filter(s => 
        (s.name || '').toLowerCase().includes(q) || 
        (s.smis_code || '').includes(q) || 
        (s.affiliation || '').toLowerCase().includes(q)
    );
    renderSchoolsTable(filtered);
}
window.filterSchoolsTable = filterSchoolsTable;

// Toggle School Status
async function toggleSchoolStatus(schoolId, newStatus) {
    try {
        const res = await fetch('/api/superadmin/toggle_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ school_id: schoolId, is_active: newStatus })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast(data.message || 'เปลี่ยนสถานะสถานศึกษาเรียบร้อยแล้ว', 'success');
            await loadSuperAdminSchools();
        } else {
            showToast(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error');
    }
}
window.toggleSchoolStatus = toggleSchoolStatus;

// Add New School
async function handleSuperAdminAddSchool(e) {
    e.preventDefault();
    const smis_code = document.getElementById('sa_new_smis').value.trim();
    const name = document.getElementById('sa_new_name').value.trim();
    const affiliation = document.getElementById('sa_new_affiliation').value.trim();
    const district = document.getElementById('sa_new_district').value.trim();
    const province = document.getElementById('sa_new_province').value.trim();
    const is_active = document.getElementById('sa_new_active').checked ? 1 : 0;

    if (smis_code.length !== 8) {
        showToast('รหัส SMIS ต้องมีความยาว 8 หลัก', 'error');
        return;
    }

    try {
        const res = await fetch('/api/superadmin/save_school.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                smis_code,
                name,
                affiliation,
                district,
                province,
                is_active
            })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('เปิดใช้งานสถานศึกษาใหม่เรียบร้อยแล้ว', 'success');
            document.getElementById('newSchoolForm').reset();
            document.getElementById('sa_new_affiliation').value = 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1';
            document.getElementById('sa_new_province').value = 'บุรีรัมย์';
            document.getElementById('sa_new_active').checked = true;
            await loadSuperAdminSchools();
        } else {
            showToast(data.message || 'เกิดข้อผิดพลาดในการบันทึกโรงเรียน', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
}
window.handleSuperAdminAddSchool = handleSuperAdminAddSchool;

// Assign School Admin Modal
async function openAssignAdminModal(schoolId) {
    currentAssignAdminSchoolId = schoolId;
    const modal = document.getElementById('assignAdminModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    const nameEl = document.getElementById('assignAdminSchoolName');
    const smisEl = document.getElementById('assignAdminSmisBadge');
    const affEl = document.getElementById('assignAdminAffiliation');
    const currAdminEl = document.getElementById('assignAdminCurrentAdmin');
    const teacherList = document.getElementById('assignAdminTeacherList');
    const teacherCount = document.getElementById('assignAdminTeacherCount');

    nameEl.innerText = 'กำลังโหลดข้อมูล...';
    smisEl.innerText = 'SMIS: -';
    affEl.innerText = '-';
    currAdminEl.innerText = '-';
    teacherList.innerHTML = `
        <div class="py-8 text-center text-slate-400">
            <span class="animate-spin inline-block mr-2">⏳</span> กำลังโหลดรายชื่อคุณครูที่ลงทะเบียนในโรงเรียนนี้...
        </div>
    `;

    try {
        const res = await fetch(`/api/superadmin/get_school_teachers.php?school_id=${schoolId}`);
        const data = await res.json();

        if (data.status === 'success') {
            const school = data.school || {};
            const teachers = data.teachers || [];

            nameEl.innerText = school.name || 'สถานศึกษา';
            smisEl.innerText = `SMIS: ${school.smis_code || '-'}`;
            affEl.innerText = `${school.affiliation || '-'} • อ.${school.district || '-'} จ.${school.province || '-'}`;
            currAdminEl.innerText = school.admin_name || 'ยังไม่ได้แต่งตั้ง Admin';

            teacherCount.innerText = `${teachers.length} คน`;

            if (teachers.length === 0) {
                teacherList.innerHTML = `
                    <div class="p-6 text-center space-y-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                            <i data-lucide="user-x" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-amber-900">ยังไม่มีคุณครูหรือบุคลากรสมัครสมาชิกภายใต้รหัส SMIS นี้ (${school.smis_code})</h4>
                            <p class="text-xs text-amber-700 mt-1 max-w-md mx-auto leading-relaxed">
                                การแต่งตั้ง Admin ดูแลระบบของโรงเรียน จำเป็นต้องให้คุณครูของโรงเรียนนี้ลงทะเบียนสมัครสมาชิกเข้าสู่ระบบก่อน
                            </p>
                        </div>
                    </div>
                `;
            } else {
                teacherList.innerHTML = teachers.map(t => {
                    const isCurrentAdmin = (school.assigned_admin_id === t.id || t.is_school_admin);
                    const maskedIdCard = t.id_card ? `${t.id_card.substring(0, 1)}-${t.id_card.substring(1, 5)}-xxxxx-${t.id_card.substring(10, 12)}-${t.id_card.substring(12, 13)}` : '-';
                    
                    return `
                        <div class="p-3.5 bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrentAdmin ? 'bg-indigo-50/30 border-indigo-300' : ''
                        }">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isCurrentAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                }">
                                    ${t.name.charAt(0)}
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-bold text-slate-900">${t.name}</span>
                                        ${isCurrentAdmin ? `
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                                <i data-lucide="shield-check" class="w-3 h-3"></i> Admin โรงเรียนปัจจุบัน
                                            </span>
                                        ` : ''}
                                    </div>
                                    <div class="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                        <span>ตำแหน่ง: <b class="text-slate-700">${t.position || 'ครู'}</b></span>
                                        <span>•</span>
                                        <span>เลข ปชช.: <span class="font-mono text-slate-600">${maskedIdCard}</span></span>
                                    </div>
                                </div>
                            </div>
                            <div class="shrink-0 flex items-center gap-2">
                                ${isCurrentAdmin ? `
                                    <span class="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1">
                                        <i data-lucide="check" class="w-3.5 h-3.5"></i> เป็น Admin แล้ว
                                    </span>
                                ` : `
                                    <button onclick="assignTeacherAsSchoolAdmin(${school.id}, ${t.id}, '${t.name.replace(/'/g, "\\'")}')" 
                                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95">
                                        <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                                        <span>แต่งตั้งเป็น Admin</span>
                                    </button>
                                `}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            if (window.lucide) lucide.createIcons();
        } else {
            showToast(data.message || 'ไม่สามารถดึงข้อมูลคุณครูได้', 'error');
        }
    } catch (err) {
        console.error('Error fetching teachers:', err);
        showToast('เกิดข้อผิดพลาดในการโหลดรายชื่อคุณครู', 'error');
    }
}
window.openAssignAdminModal = openAssignAdminModal;

async function assignTeacherAsSchoolAdmin(schoolId, teacherId, teacherName) {
    if (!confirm(`ยืนยันการแต่งตั้ง "${teacherName}" เป็น Admin ผู้ดูแลระบบประจำโรงเรียนนี้หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch('/api/superadmin/assign_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                school_id: schoolId,
                admin_id: teacherId,
                admin_name: teacherName
            })
        });
        const result = await res.json();
        if (result.status === 'success') {
            showToast(result.message || `แต่งตั้ง ${teacherName} เป็น Admin เรียบร้อยแล้ว`, 'success');
            await openAssignAdminModal(schoolId);
            await loadSuperAdminSchools();
        } else {
            showToast(result.message || 'แต่งตั้งไม่สำเร็จ', 'error');
        }
    } catch (err) {
        console.error('Error assigning admin:', err);
        showToast('เกิดข้อผิดพลาดในการแต่งตั้ง Admin', 'error');
    }
}
window.assignTeacherAsSchoolAdmin = assignTeacherAsSchoolAdmin;

function closeAssignAdminModal() {
    const modal = document.getElementById('assignAdminModal');
    if (modal) modal.classList.add('hidden');
    currentAssignAdminSchoolId = null;
}
window.closeAssignAdminModal = closeAssignAdminModal;

// ==========================================
// 2. USERS & REGISTRATION REQUESTS FUNCTIONS
// ==========================================

async function loadPendingUsers() {
    try {
        const res = await fetch('/api/get_pending_users.php');
        const data = await res.json();
        const pendingUsers = Array.isArray(data) ? data : (data.users || []);

        const badge = document.getElementById('pendingRequestsBadge');
        const topBadge = document.getElementById('badgePendingCount');
        if (badge) badge.innerText = `${pendingUsers.length} คำขอ`;
        if (topBadge) {
            topBadge.innerText = pendingUsers.length;
            if (pendingUsers.length > 0) topBadge.classList.remove('hidden');
            else topBadge.classList.add('hidden');
        }

        const tbody = document.getElementById('pendingUsersTableBody');
        if (!tbody) return;

        if (pendingUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-8 text-center text-slate-400">
                        <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i data-lucide="check" class="w-5 h-5"></i>
                        </div>
                        <p class="font-bold text-slate-700">ไม่มีคำขอสมัครสมาชิกค้างการอนุมัติ</p>
                        <p class="text-xs text-slate-400 mt-0.5">บุคลากรที่ลงทะเบียนทุกคนได้รับการอนุมัติเรียบร้อยแล้ว</p>
                    </td>
                </tr>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = pendingUsers.map(u => {
            const maskedId = u.id_card ? `${u.id_card.substring(0, 1)}-${u.id_card.substring(1, 5)}-xxxxx-${u.id_card.substring(10, 12)}-${u.id_card.substring(12, 13)}` : '-';
            return `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3.5 font-bold text-slate-900">${u.name}</td>
                    <td class="p-3.5 font-mono text-slate-600 font-bold">${maskedId}</td>
                    <td class="p-3.5">
                        <span class="font-bold text-slate-800">${u.school_name || 'โรงเรียน'}</span>
                        <span class="text-[11px] text-slate-400 block">SMIS: ${u.smis_code || '-'}</span>
                    </td>
                    <td class="p-3.5 text-slate-700">${u.position || 'ครู'}</td>
                    <td class="p-3.5 text-slate-500">
                        <div>${u.phone || '-'}</div>
                        <div class="text-[11px] text-slate-400">${u.email || '-'}</div>
                    </td>
                    <td class="p-3.5 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="approveUser(${u.id}, 'teacher', '${u.name.replace(/'/g, "\\'")}')" 
                                    class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition">
                                อนุมัติ (ครู)
                            </button>
                            <button onclick="approveUser(${u.id}, 'school_admin', '${u.name.replace(/'/g, "\\'")}')" 
                                    class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition">
                                อนุมัติ (Admin)
                            </button>
                            <button onclick="rejectUser(${u.id}, '${u.name.replace(/'/g, "\\'")}')" 
                                    class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg border border-red-200 transition">
                                ปฏิเสธ
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    } catch (err) {
        console.error('Error loading pending users:', err);
    }
}
window.loadPendingUsers = loadPendingUsers;

async function approveUser(userId, role, name) {
    if (!confirm(`ยืนยันการอนุมัติผู้ใช้งาน "${name}" ในสิทธิ์ "${role === 'school_admin' ? 'Admin โรงเรียน' : 'ครูผู้ใช้งาน'}" หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch('/api/approve_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, role })
        });
        const data = await res.json();
        if (data.message || data.status === 'success') {
            showToast(data.message || `อนุมัติ ${name} สำเร็จเรียบร้อย`, 'success');
            await loadPendingUsers();
            await loadAllUsers();
        } else {
            showToast(data.error || 'อนุมัติไม่สำเร็จ', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการอนุมัติ', 'error');
    }
}
window.approveUser = approveUser;

async function rejectUser(userId, name) {
    if (!confirm(`คุณต้องการปฏิเสธคำขอและลบข้อมูลของ "${name}" ใช่หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch('/api/reject_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        const data = await res.json();
        if (data.message || data.status === 'success') {
            showToast(data.message || `ปฏิเสธคำขอเรียบร้อย`, 'success');
            await loadPendingUsers();
            await loadAllUsers();
        } else {
            showToast(data.error || 'ปฏิเสธคำขอไม่สำเร็จ', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการปฏิเสธคำขอ', 'error');
    }
}
window.rejectUser = rejectUser;

async function loadAllUsers() {
    try {
        const res = await fetch('/api/superadmin/get_all_users.php');
        const data = await res.json();
        if (data.status === 'success') {
            allUsersData = data.users || [];
            renderAllUsersTable(allUsersData);
        }
    } catch (err) {
        console.error('Error loading all users:', err);
    }
}
window.loadAllUsers = loadAllUsers;

function renderAllUsersTable(users) {
    const tbody = document.getElementById('allUsersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">ไม่พบรายชื่อผู้ใช้งาน</td></tr>`;
        return;
    }

    const ROLE_LABELS = {
        super_admin: 'Super Admin เขตฯ',
        school_admin: 'Admin โรงเรียน',
        director: 'ผู้อำนวยการ',
        plan_officer: 'จนท.แผนงานและงบประมาณ',
        department_head: 'หัวหน้ากลุ่มบริหาร',
        teacher: 'ครูผู้ใช้งาน'
    };

    tbody.innerHTML = users.map(u => {
        const isApproved = (u.is_approved === 1 || u.is_approved === true || u.is_approved === undefined);
        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3.5 font-bold text-slate-900">${u.name}</td>
                <td class="p-3.5 font-mono text-slate-600">${u.username || u.id_card || '-'}</td>
                <td class="p-3.5 text-slate-700">${u.school_name || 'โรงเรียน'}</td>
                <td class="p-3.5 text-slate-500">${u.position || '-'}</td>
                <td class="p-3.5 font-semibold text-slate-800">
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'school_admin' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'director' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                    }">
                        ${ROLE_LABELS[u.role] || u.role}
                    </span>
                </td>
                <td class="p-3.5 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }">
                        ${isApproved ? 'ใช้งานได้' : 'รออนุมัติ'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function filterAllUsersTable() {
    const q = (document.getElementById('userSearchInput')?.value || '').toLowerCase().trim();
    if (!q) {
        renderAllUsersTable(allUsersData);
        return;
    }
    const filtered = allUsersData.filter(u => 
        (u.name || '').toLowerCase().includes(q) || 
        (u.username || '').toLowerCase().includes(q) || 
        (u.id_card || '').includes(q) || 
        (u.school_name || '').toLowerCase().includes(q)
    );
    renderAllUsersTable(filtered);
}
window.filterAllUsersTable = filterAllUsersTable;

// ==========================================
// 3. SYSTEM & DATABASE SETTINGS FUNCTIONS
// ==========================================

async function loadSuperAdminCredentials() {
    try {
        const res = await fetch('/api/superadmin/get_credentials.php');
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'success') {
            const u = data.user || {};
            const saUserEl = document.getElementById('sa_username');
            const saNameEl = document.getElementById('sa_name');
            const saPosEl = document.getElementById('sa_position');
            const saPhoneEl = document.getElementById('sa_phone');
            const saEmailEl = document.getElementById('sa_email');
            const saPwdStatusEl = document.getElementById('sa-pwd-status');

            if (saUserEl) saUserEl.value = u.username || 'superadmin';
            if (saNameEl) saNameEl.value = u.name || '';
            if (saPosEl) saPosEl.value = u.position || '';
            if (saPhoneEl) saPhoneEl.value = u.phone || '';
            if (saEmailEl) saEmailEl.value = u.email || '';

            if (saPwdStatusEl) {
                if (u.has_custom_password) {
                    saPwdStatusEl.className = "px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]";
                    saPwdStatusEl.innerText = "✓ ตั้งค่ารหัสผ่านส่วนตัวแล้ว";
                } else {
                    saPwdStatusEl.className = "px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 text-[11px]";
                    saPwdStatusEl.innerText = "เริ่มต้น (password123)";
                }
            }

            if (data.db_config) {
                const cfg = data.db_config;
                const dbHost = document.getElementById('db_host');
                const dbPort = document.getElementById('db_port');
                const dbName = document.getElementById('db_name');
                const dbUser = document.getElementById('db_user');
                const dbPass = document.getElementById('db_pass');

                if (dbHost && cfg.host) dbHost.value = cfg.host;
                if (dbPort && cfg.port) dbPort.value = cfg.port;
                if (dbName && cfg.database) dbName.value = cfg.database;
                if (dbUser && cfg.user) dbUser.value = cfg.user;
                if (dbPass && cfg.password !== undefined) dbPass.value = cfg.password;
            }
        }
    } catch (err) {
        console.error('Error loading Super Admin credentials:', err);
    }
}
window.loadSuperAdminCredentials = loadSuperAdminCredentials;

async function handleSuperAdminCredentialsSubmit(event) {
    event.preventDefault();
    const alertBox = document.getElementById('saCredentialsAlert');
    const submitBtn = document.getElementById('btnSaveSaCredentials');

    const username = document.getElementById('sa_username').value.trim();
    const name = document.getElementById('sa_name').value.trim();
    const newPassword = document.getElementById('sa_new_password').value;
    const confirmPassword = document.getElementById('sa_confirm_password').value;
    const position = document.getElementById('sa_position').value.trim();
    const phone = document.getElementById('sa_phone').value.trim();
    const email = document.getElementById('sa_email').value.trim();

    if (alertBox) {
        alertBox.className = 'hidden p-3 rounded-xl text-xs font-medium';
        alertBox.innerText = '';
    }

    if (newPassword || confirmPassword) {
        if (newPassword.length < 6) {
            if (alertBox) {
                alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
                alertBox.innerText = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
            }
            return;
        }
        if (newPassword !== confirmPassword) {
            if (alertBox) {
                alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
                alertBox.innerText = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง';
            }
            return;
        }
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin mr-1.5">⏳</span> กำลังบันทึกข้อมูล...';
    }

    try {
        const res = await fetch('/api/superadmin/update_credentials.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                name,
                password: newPassword,
                position,
                phone,
                email
            })
        });

        const data = await res.json();
        if (data.status === 'success') {
            if (alertBox) {
                alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2';
                alertBox.innerHTML = `<span>✓</span> <span>${data.message || 'บันทึกข้อมูลและรหัสผ่าน Super Admin สำเร็จเรียบร้อยแล้ว'}</span>`;
            }
            showToast('บันทึกข้อมูล Super Admin สำเร็จเรียบร้อย', 'success');

            document.getElementById('sa_new_password').value = '';
            document.getElementById('sa_confirm_password').value = '';

            const hName = document.getElementById('saHeaderName');
            if (hName && name) hName.innerText = name;

            await loadSuperAdminCredentials();
        } else {
            if (alertBox) {
                alertBox.className = 'p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
                alertBox.innerText = data.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
            }
            showToast(data.message || 'บันทึกไม่สำเร็จ', 'error');
        }
    } catch (err) {
        console.error('Error updating Super Admin credentials:', err);
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> <span>บันทึกการแก้ไขบัญชี Super Admin</span>';
            if (window.lucide) lucide.createIcons();
        }
    }
}
window.handleSuperAdminCredentialsSubmit = handleSuperAdminCredentialsSubmit;

function toggleDbConfigPanel() {
    const panel = document.getElementById('dbConfigPanel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}
window.toggleDbConfigPanel = toggleDbConfigPanel;

async function testDatabaseConnection() {
    const btn = document.getElementById('btnTestDb');
    const badge = document.getElementById('dbConnBadge');
    const msg = document.getElementById('dbTestMsg');

    const host = document.getElementById('db_host').value.trim();
    const port = document.getElementById('db_port').value.trim();
    const database = document.getElementById('db_name').value.trim();
    const user = document.getElementById('db_user').value.trim();
    const password = document.getElementById('db_pass').value;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin mr-1.5">⏳</span> กำลังทดสอบ...';
    }
    if (badge) {
        badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
        badge.innerText = 'สถานะ: กำลังเชื่อมต่อ...';
    }

    try {
        const res = await fetch('/api/superadmin/test_db_connection.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, port, database, user, password })
        });
        const data = await res.json();
        if (data.status === 'success' && data.connected) {
            if (badge) {
                badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                badge.innerText = '✓ เชื่อมต่อสำเร็จ (Connected)';
            }
            if (msg) msg.innerHTML = `<span class="text-emerald-300">✓ ${data.message}</span>`;
            showToast('เชื่อมต่อฐานข้อมูล MySQL สำเร็จ', 'success');
        } else {
            if (badge) {
                badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30';
                badge.innerText = '✕ เชื่อมต่อล้มเหลว';
            }
            if (msg) msg.innerHTML = `<span class="text-rose-300">✕ ${data.message}</span>`;
            showToast('ไม่สามารถเชื่อมต่อ MySQL ได้', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการทดสอบเชื่อมต่อ', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="activity" class="w-3.5 h-3.5"></i> <span>ทดสอบการเชื่อมต่อ</span>';
            if (window.lucide) lucide.createIcons();
        }
    }
}
window.testDatabaseConnection = testDatabaseConnection;

async function saveDatabaseConnection() {
    const btn = document.getElementById('btnSaveDb');
    const msg = document.getElementById('dbTestMsg');

    const host = document.getElementById('db_host').value.trim();
    const port = document.getElementById('db_port').value.trim();
    const database = document.getElementById('db_name').value.trim();
    const user = document.getElementById('db_user').value.trim();
    const password = document.getElementById('db_pass').value;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin mr-1.5">⏳</span> กำลังบันทึก...';
    }

    try {
        const res = await fetch('/api/superadmin/save_db_config.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, port, database, user, password })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast(data.message || 'บันทึกการตั้งค่า MySQL เรียบร้อยแล้ว', 'success');
            if (msg) msg.innerHTML = `<span class="text-emerald-300">✓ บันทึกสำเร็จ: ${data.message}</span>`;
            await loadSuperAdminCredentials();
        } else {
            showToast(data.message || 'บันทึกไม่สำเร็จ', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่าฐานข้อมูล', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>บันทึกการตั้งค่า</span>';
            if (window.lucide) lucide.createIcons();
        }
    }
}
window.saveDatabaseConnection = saveDatabaseConnection;

async function runInstallDatabase() {
    if (!confirm('ยืนยันการรัน Migration เพื่อติดตั้งหรืออัปเดตตารางฐานข้อมูล MySQL จริงทั้ง 10 ตารางหรือไม่?')) {
        return;
    }

    const btn = document.getElementById('btnInstallDb');
    const box = document.getElementById('dbInstallResultBox');
    const logEl = document.getElementById('dbInstallLogContent');
    const badge = document.getElementById('dbInstallStatusBadge');

    if (box) box.classList.remove('hidden');
    if (logEl) {
        logEl.innerHTML = `
            <div class="text-indigo-300">🚀 เริ่มต้นกระบวนการเชื่อมต่อและติดตั้งโครงสร้างฐานข้อมูล...</div>
            <div class="text-slate-400">⏳ กำลังตรวจสอบการเชื่อมต่อ MySQL Server...</div>
        `;
    }
    if (badge) {
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300';
        badge.innerText = 'สถานะ: กำลังประมวลผล Migration...';
    }
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin mr-1.5">⏳</span> กำลังรัน Migration...';
    }

    try {
        const res = await fetch('/api/superadmin/install_database.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.status === 'success') {
            if (badge) {
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300';
                badge.innerText = `✓ สำเร็จ (${new Date().toLocaleTimeString('th-TH')})`;
            }

            let html = `
                <div class="text-emerald-400 font-bold">✓ การติดตั้งโครงสร้างฐานข้อมูล MySQL สำเร็จสมบูรณ์!</div>
                <div class="text-slate-300">📦 ติดตั้งตารางหลักสำเร็จ ${data.tables_created ? data.tables_created.length : 10} ตาราง:</div>
                <div class="text-slate-400 pl-4 space-y-0.5">
                    ${(data.tables_created || []).map(t => `<div>• <span class="text-emerald-300 font-bold">${t}</span> (พร้อมโครงสร้างความสัมพันธ์และดัชนี)</div>`).join('')}
                </div>
            `;

            if (data.superadmin) {
                html += `<div class="text-amber-300 mb-2">👑 บัญชี Super Admin: Username "${data.superadmin.username}" (${data.superadmin.name || 'ผู้ดูแลระบบ'}) ได้รับการซิงค์พร้อมใช้งาน</div>`;
            }

            if (data.schools_count !== undefined) {
                html += `<div class="text-indigo-300">🏫 ข้อมูลเริ่มต้นสถานศึกษา: นำเข้าเรียบร้อย (${data.schools_count} แห่ง)</div>`;
            }

            if (logEl) logEl.innerHTML = html;
            showToast('ติดตั้งโครงสร้างฐานข้อมูล MySQL สำเร็จครบถ้วน', 'success');

            await loadSuperAdminSchools();
            await loadSuperAdminCredentials();
        } else {
            if (badge) {
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300';
                badge.innerText = '✕ พบข้อผิดพลาด';
            }
            if (logEl) {
                logEl.innerHTML = `
                    <div class="text-rose-400 font-bold">✕ ไม่สามารถติดตั้งฐานข้อมูลได้:</div>
                    <div class="text-slate-300 mt-1">${data.message || 'โปรดตรวจสอบการตั้งค่า Host, Port, User, Password ของ MySQL Server'}</div>
                `;
            }
            showToast(data.message || 'การติดตั้งฐานข้อมูลไม่สำเร็จ', 'error');
        }
    } catch (err) {
        console.error('Error running install database:', err);
        showToast('เกิดข้อผิดพลาดในการรัน Migration', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> <span>ติดตั้ง / อัปเดตตารางฐานข้อมูล</span>';
            if (window.lucide) lucide.createIcons();
        }
    }
}
window.runInstallDatabase = runInstallDatabase;

// ==========================================
// 4. PASSWORD CHANGE MODAL
// ==========================================

function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.classList.remove('hidden');
}
window.openChangePasswordModal = openChangePasswordModal;

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.classList.add('hidden');
}
window.closeChangePasswordModal = closeChangePasswordModal;

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const oldPwd = document.getElementById('chg_old_password').value;
    const newPwd = document.getElementById('chg_new_password').value;
    const confirmPwd = document.getElementById('chg_confirm_password').value;

    if (newPwd !== confirmPwd) {
        showToast('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
        return;
    }

    if (newPwd.length < 6) {
        showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
        return;
    }

    try {
        const res = await fetch('/api/auth/change_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1,
                username: 'superadmin',
                old_password: oldPwd,
                new_password: newPwd
            })
        });
        const result = await res.json();
        if (result.status === 'success') {
            showToast('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว', 'success');
            closeChangePasswordModal();
            await loadSuperAdminCredentials();
        } else {
            showToast(result.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ ตรวจสอบรหัสผ่านเดิม', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
    }
}
window.handleChangePasswordSubmit = handleChangePasswordSubmit;
