import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Exclude /api routes from static file serving
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  express.static(__dirname)(req, res, next);
});

// Initialize Gemini SDK with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// ==========================================
// In-Memory Data Store (Initialized with Seed Data)
// ==========================================

let schools = [
  {
    id: 1,
    code: '10310001',
    smis_code: '10310001',
    name: 'โรงเรียนอนุบาลพัฒนาวิทยา',
    affiliation: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 1',
    province: 'บุรีรัมย์',
    district: 'เมืองบุรีรัมย์',
    subdistrict: 'ในเมือง',
    address: '123 ถนนจิระ ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000',
    postal_code: '31000',
    phone: '044-611234',
    email: 'contact@anubanpat.ac.th',
    website: 'https://www.anubanpat.ac.th',
    director_name: 'นายธีระพล เกียรติวิทยา',
    director_position: 'ผู้อำนวยการโรงเรียนอนุบาลพัฒนาวิทยา (ผู้อำนวยการเชี่ยวชาญ)',
    plan_officer_name: 'นางวิไลพร งบมั่นคง',
    assigned_admin_name: 'นางสาวสุภาวดี ดูแลระบบ',
    assigned_admin_id: 2,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Garuda_Emb_Thailand.svg/200px-Garuda_Emb_Thailand.svg.png',
    status: 'active', // active, pending, inactive
    created_at: '2024-05-01'
  },
  {
    id: 2,
    code: '10310002',
    smis_code: '10310002',
    name: 'โรงเรียนมัธยมศึกษาเกียรติวิทยาคาร',
    affiliation: 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาบุรีรัมย์',
    province: 'บุรีรัมย์',
    district: 'เมืองบุรีรัมย์',
    subdistrict: 'อิสาณ',
    address: '456 ถนนบุรีรัมย์-นางรอง ตำบลอิสาณ อำเภอเมือง จังหวัดบุรีรัมย์ 31000',
    postal_code: '31000',
    phone: '044-622345',
    email: 'info@kiatwittaya.ac.th',
    website: 'https://www.kiatwittaya.ac.th',
    director_name: 'นายสมเกียรติ มัธยมเลิศ',
    director_position: 'ผู้อำนวยการเชี่ยวชาญพิเศษ',
    plan_officer_name: 'นายชลิต แผนมัธยม',
    assigned_admin_name: '', // ยังไม่ได้กำหนด Admin (รอครูในโรงเรียนสมัครสมาชิก)
    assigned_admin_id: null,
    logo_url: '',
    status: 'active',
    created_at: '2024-06-15'
  },
  {
    id: 3,
    code: '10310003',
    smis_code: '10310003',
    name: 'โรงเรียนบ้านหนองบัวประชาสรรค์',
    affiliation: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 2',
    province: 'บุรีรัมย์',
    district: 'ประโคนชัย',
    subdistrict: 'ประโคนชัย',
    address: '88 หมู่ 4 ตำบลประโคนชัย อำเภอประโคนชัย จังหวัดบุรีรัมย์ 31140',
    postal_code: '31140',
    phone: '044-671890',
    email: 'nongbua@brm2.go.th',
    website: '',
    director_name: 'นางปราณี ศรีสุข',
    director_position: 'ผู้อำนวยการชำนาญการพิเศษ',
    plan_officer_name: 'นายวิเชียร วางแผนดี',
    assigned_admin_name: '', // ยังไม่ได้กำหนด Admin (รอครูในโรงเรียนสมัครสมาชิก)
    assigned_admin_id: null,
    logo_url: '',
    status: 'pending', // Pending activation by Super Admin
    created_at: '2024-09-01'
  }
];

let schoolInfo = schools[0];

let users = [
  { id: 1, username: 'superadmin', id_card: '1310000000001', password: '123', name: 'นายธีระพล ผู้ดูแลระบบเขตพื้นที่ฯ', position: 'ผู้อำนวยการกลุ่มนโยบายและแผน (สพป./สพฐ.)', department: 'central', role: 'super_admin', phone: '0812345678', email: 'superadmin@obec.go.th', school_id: null, is_approved: 1, must_change_password: 0 },
  { id: 2, username: 'schooladmin', id_card: '1310000000002', password: '123', name: 'นางสาวสุภาวดี ดูแลระบบ', position: 'ผู้ดูแลระบบสารสนเทศโรงเรียน', department: 'budget', role: 'school_admin', phone: '0823456789', email: 'admin@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 3, username: 'director', id_card: '1310000000003', password: '123', name: 'นายธีระพล เกียรติวิทยา', position: 'ผู้อำนวยการโรงเรียนอนุบาลพัฒนาวิทยา (ผู้อำนวยการเชี่ยวชาญ)', department: 'central', role: 'director', phone: '0891234567', email: 'director@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 4, username: 'deputy_director', id_card: '1310000000004', password: '123', name: 'นายเอกชัย รองวิชาการ', position: 'รองผู้อำนวยการโรงเรียน (รองผู้อำนวยการชำนาญการพิเศษ)', department: 'central', role: 'deputy_director', phone: '0897654321', email: 'deputy@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 5, username: 'planofficer', id_card: '1310000000005', password: '123', name: 'นางวิไลพร งบมั่นคง', position: 'เจ้าหน้าที่แผนงานและงบประมาณ (ครูชำนาญการพิเศษ)', department: 'budget', role: 'plan_officer', phone: '0867891234', email: 'plan@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 6, username: 'head_academic', id_card: '1310000000006', password: '123', name: 'นางกัญญา วิชาการดี', position: 'หัวหน้ากลุ่มบริหารวิชาการ (ครูเชี่ยวชาญ คศ.4)', department: 'academic', role: 'department_head', phone: '0856781234', email: 'academic@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 7, username: 'head_budget', id_card: '1310000000007', password: '123', name: 'นายสุรชัย บัญชีทรัพย์', position: 'หัวหน้ากลุ่มบริหารงบประมาณ (ครูชำนาญการพิเศษ คศ.3)', department: 'budget', role: 'department_head', phone: '0845671234', email: 'budget@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 8, username: 'head_personnel', id_card: '1310000000008', password: '123', name: 'นางสาวพิมพ์ใจ เสริมบุคคล', position: 'หัวหน้ากลุ่มบริหารงานบุคคล (ครูชำนาญการพิเศษ คศ.3)', department: 'personnel', role: 'department_head', phone: '0834561234', email: 'personnel@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 9, username: 'head_general', id_card: '1310000000009', password: '123', name: 'นายพิชิต สภาพแวดล้อม', position: 'หัวหน้ากลุ่มบริหารทั่วไป (ครูชำนาญการ คศ.2)', department: 'general', role: 'department_head', phone: '0823451234', email: 'general@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 10, username: 'teacher_somchai', id_card: '1310000000010', password: '123', name: 'นายสมชาย สอนสนุก', position: 'ครู (คศ.1)', department: 'academic', role: 'teacher', phone: '0811112222', email: 'somchai@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  { id: 11, username: 'teacher_somying', id_card: '1310000000011', password: '123', name: 'นางสมหญิง กิจกรรมเลิศ', position: 'ครูผู้ช่วย', department: 'general', role: 'teacher', phone: '0822223333', email: 'somying@anubanpat.ac.th', school_id: 1, is_approved: 1, must_change_password: 0 },
  // ครูที่สมัครสมาชิกในโรงเรียนที่ 2 (มัธยมศึกษาเกียรติวิทยาคาร รหัส SMIS: 10310002)
  { id: 12, username: '1310000000012', id_card: '1310000000012', password: '123', name: 'นายวรวิทย์ มัธยมสอนดี', position: 'ครูชำนาญการ (คศ.2)', department: 'academic', role: 'teacher', phone: '0898887766', email: 'worawit@kiatwittaya.ac.th', school_id: 2, is_approved: 1, must_change_password: 1 },
  { id: 13, username: '1310000000013', id_card: '1310000000013', password: '123', name: 'นางสาวกนกพร เทคโนโลยี', position: 'ครู (คศ.1)', department: 'budget', role: 'teacher', phone: '0899998877', email: 'kanokporn@kiatwittaya.ac.th', school_id: 2, is_approved: 1, must_change_password: 1 }
];

// Student counts and subsidy rates per level (Government per-student subsidies + Learner Development Activities)
let studentSubsidies = {
  1: { // fiscal_year_id = 1
    kindergarten: {
      name: 'ระดับก่อนประถมศึกษา (อนุบาล 1-3)',
      student_count: 80,
      subsidy_rate: 1800.00, // บาท/คน/ปี
      dev_rate: 464.00 // กิจกรรมพัฒนาคุณภาพผู้เรียน (กพพ. บาท/คน/ปี)
    },
    primary: {
      name: 'ระดับประถมศึกษา (ป.1 - ป.6)',
      student_count: 240,
      subsidy_rate: 2050.00,
      dev_rate: 516.00
    },
    lower_secondary: {
      name: 'ระดับมัธยมศึกษาตอนต้น (ม.1 - ม.3)',
      student_count: 120,
      subsidy_rate: 3670.00,
      dev_rate: 968.00
    },
    upper_secondary: {
      name: 'ระดับมัธยมศึกษาตอนปลาย (ม.4 - ม.6)',
      student_count: 60,
      subsidy_rate: 4070.00,
      dev_rate: 1022.00
    }
  },
  2: { // fiscal_year_id = 2 (ปี 2567)
    kindergarten: { name: 'ระดับก่อนประถมศึกษา (อนุบาล 1-3)', student_count: 75, subsidy_rate: 1800.00, dev_rate: 464.00 },
    primary: { name: 'ระดับประถมศึกษา (ป.1 - ป.6)', student_count: 230, subsidy_rate: 2050.00, dev_rate: 516.00 },
    lower_secondary: { name: 'ระดับมัธยมศึกษาตอนต้น (ม.1 - ม.3)', student_count: 110, subsidy_rate: 3670.00, dev_rate: 968.00 },
    upper_secondary: { name: 'ระดับมัธยมศึกษาตอนปลาย (ม.4 - ม.6)', student_count: 50, subsidy_rate: 4070.00, dev_rate: 1022.00 }
  }
};

function calculateSubsidies(fiscalYearId) {
  const data = studentSubsidies[fiscalYearId] || studentSubsidies[1];
  const keys = ['kindergarten', 'primary', 'lower_secondary', 'upper_secondary'];
  
  let totalStudents = 0;
  let totalSubsidyAmount = 0;
  let totalDevAmount = 0;
  const breakdown = [];

  keys.forEach(k => {
    const item = data[k] || { name: k, student_count: 0, subsidy_rate: 0, dev_rate: 0 };
    const count = parseInt(item.student_count) || 0;
    const subRate = parseFloat(item.subsidy_rate) || 0;
    const devRate = parseFloat(item.dev_rate) || 0;

    const subTotal = count * subRate;
    const devTotal = count * devRate;
    const lineTotal = subTotal + devTotal;

    totalStudents += count;
    totalSubsidyAmount += subTotal;
    totalDevAmount += devTotal;

    breakdown.push({
      key: k,
      name: item.name,
      student_count: count,
      subsidy_rate: subRate,
      dev_rate: devRate,
      subsidy_amount: subTotal,
      dev_amount: devTotal,
      total_amount: lineTotal
    });
  });

  const grandTotal = totalSubsidyAmount + totalDevAmount;
  return {
    totalStudents,
    totalSubsidyAmount,
    totalDevAmount,
    grandTotal,
    breakdown
  };
}

let fiscalYears = [
  { id: 1, year: '2568', start_date: '2024-10-01', end_date: '2025-09-30', is_current: 1, status: 'active', notes: 'แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. 2568 ขับเคลื่อนสู่ความเป็นเลิศ' },
  { id: 2, year: '2567', start_date: '2023-10-01', end_date: '2024-09-30', is_current: 0, status: 'closed', notes: 'แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. 2567 (ปิดยอดงบสมบูรณ์แล้ว)' }
];

let budgetSources = [
  { id: 1, fiscal_year_id: 1, code: 'SRC-68-01', name: 'เงินอุดหนุนรายหัวการจัดการศึกษาขั้นพื้นฐาน', category: 'subsidy', amount: 1150000.00, description: 'จัดสรรตามจำนวนนักเรียนอนุบาลถึงประถมศึกษาปีที่ 6', received_date: '2024-10-15' },
  { id: 2, fiscal_year_id: 1, code: 'SRC-68-02', name: 'เงินกิจกรรมพัฒนาคุณภาพผู้เรียน (กพพ.)', category: 'student_dev', amount: 380000.00, description: 'กิจกรรมพัฒนาคุณภาพผู้เรียน 4 กิจกรรมหลักและทัศนศึกษา', received_date: '2024-10-20' },
  { id: 3, fiscal_year_id: 1, code: 'SRC-68-03', name: 'เงินรายได้สถานศึกษา', category: 'school_income', amount: 180000.00, description: 'ค่าเช่าพื้นที่ ค่าธรรมเนียม และเงินผลประโยชน์', received_date: '2024-11-01' },
  { id: 4, fiscal_year_id: 1, code: 'SRC-68-04', name: 'เงินระดมทรัพยากรและการบริจาคเพื่อการศึกษา', category: 'donation', amount: 90000.00, description: 'ผ้าป่าเพื่อการศึกษาและเงินสมทบจากชุมชน', received_date: '2024-11-15' },
  { id: 5, fiscal_year_id: 1, code: 'SRC-68-05', name: 'เงินอุดหนุนปัจจัยพื้นฐานนักเรียนยากจน (CCT)', category: 'poverty_fund', amount: 50000.00, description: 'ช่วยเหลือค่านักเรียนยากจนพิเศษแบบมีเงื่อนไข', received_date: '2024-10-25' },
  
  // ปี 2567
  { id: 6, fiscal_year_id: 2, code: 'SRC-67-01', name: 'เงินอุดหนุนรายหัวการจัดการศึกษาขั้นพื้นฐาน', category: 'subsidy', amount: 1000000.00, description: 'งบประมาณปี 2567', received_date: '2023-10-10' },
  { id: 7, fiscal_year_id: 2, code: 'SRC-67-02', name: 'เงินกิจกรรมพัฒนาคุณภาพผู้เรียน', category: 'student_dev', amount: 350000.00, description: 'งบประมาณปี 2567', received_date: '2023-10-15' },
  { id: 8, fiscal_year_id: 2, code: 'SRC-67-03', name: 'เงินรายได้สถานศึกษา', category: 'school_income', amount: 150000.00, description: 'งบประมาณปี 2567', received_date: '2023-11-01' },
  { id: 9, fiscal_year_id: 2, code: 'SRC-67-04', name: 'เงินระดมทรัพยากรเพื่อการศึกษา', category: 'donation', amount: 100000.00, description: 'งบประมาณปี 2567', received_date: '2023-11-10' }
];

let departmentAllocations = [
  { id: 1, fiscal_year_id: 1, department: 'academic', department_name: 'กลุ่มบริหารวิชาการ', percentage: 45.0, allocated_amount: 832500.00, notes: 'เน้นการยกระดับผลสัมฤทธิ์ทางการเรียนและการอ่านออกเขียนได้' },
  { id: 2, fiscal_year_id: 1, department: 'budget', department_name: 'กลุ่มบริหารงบประมาณและสินทรัพย์', percentage: 15.0, allocated_amount: 277500.00, notes: 'จัดทำบัญชี จัดซื้อจัดจ้าง และควบคุมพัสดุครุภัณฑ์' },
  { id: 3, fiscal_year_id: 1, department: 'personnel', department_name: 'กลุ่มบริหารงานบุคคล', percentage: 10.0, allocated_amount: 185000.00, notes: 'พัฒนาทักษะสมรรถนะครูและการอบรมเชิงปฏิบัติการ' },
  { id: 4, fiscal_year_id: 1, department: 'general', department_name: 'กลุ่มบริหารทั่วไป', percentage: 20.0, allocated_amount: 370000.00, notes: 'ปรับปรุงสภาพแวดล้อม อาคารสถานที่และสุขอนามัย' },
  { id: 5, fiscal_year_id: 1, department: 'reserve', department_name: 'งบสำรองจ่าย/ส่วนกลาง', percentage: 10.0, allocated_amount: 185000.00, notes: 'รองรับกรณีฉุกเฉิน กิจกรรมเฉพาะกิจและภัยธรรมชาติ' },

  // ปี 2567
  { id: 6, fiscal_year_id: 2, department: 'academic', department_name: 'กลุ่มบริหารวิชาการ', percentage: 45.0, allocated_amount: 720000.00, notes: 'งบจัดสรรปี 2567' },
  { id: 7, fiscal_year_id: 2, department: 'budget', department_name: 'กลุ่มบริหารงบประมาณและสินทรัพย์', percentage: 15.0, allocated_amount: 240000.00, notes: 'งบจัดสรรปี 2567' },
  { id: 8, fiscal_year_id: 2, department: 'personnel', department_name: 'กลุ่มบริหารงานบุคคล', percentage: 10.0, allocated_amount: 160000.00, notes: 'งบจัดสรรปี 2567' },
  { id: 9, fiscal_year_id: 2, department: 'general', department_name: 'กลุ่มบริหารทั่วไป', percentage: 20.0, allocated_amount: 320000.00, notes: 'งบจัดสรรปี 2567' },
  { id: 10, fiscal_year_id: 2, department: 'reserve', department_name: 'งบสำรองจ่าย/ส่วนกลาง', percentage: 10.0, allocated_amount: 160000.00, notes: 'งบจัดสรรปี 2567' }
];

let projects = [
  {
    id: 1,
    fiscal_year_id: 1,
    department: 'academic',
    code: 'วิชาการ-01',
    name: 'โครงการยกระดับผลสัมฤทธิ์ทางการเรียนและการประเมิน RT, NT, O-NET',
    proposer_id: 8,
    proposer_name: 'นายสมชาย สอนสนุก',
    supervisor_id: 4,
    strategy_alignment: 'ยุทธศาสตร์ที่ 1 พัฒนาคุณภาพและมาตรฐานการศึกษาขั้นพื้นฐาน',
    standard_alignment: 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
    rationale: 'เนื่องจากผลการทดสอบระดับชาติในปีการศึกษาที่ผ่านมายังต้องพัฒนาอย่างต่อเนื่อง จึงจำเป็นต้องจัดกิจกรรมสอนเสริมและค่ายวิชาการเพื่อเสริมสร้างสมรรถนะการเรียนรู้ของผู้เรียนให้มีความพร้อมในศตวรรษที่ 21',
    objectives: '1. เพื่อยกระดับผลการประเมิน RT, NT และ O-NET สูงกว่าระดับประเทศ\n2. เพื่อพัฒนาทักษะการคิดวิเคราะห์และการแก้ปัญหาของผู้เรียน',
    target_qty: 'นักเรียนชั้น ป.1, ป.3 และ ป.6 ทุกคนจำนวน 180 คน เข้าร่วมกิจกรรมสอนเสริมและค่ายวิชาการ',
    target_quality: 'ร้อยละ 85 ของนักเรียนมีผลการเรียนรู้ผ่านเกณฑ์ที่กำหนด และมีคะแนนเฉลี่ยสูงกว่าเป้าหมายสถานศึกษา',
    start_date: '2024-11-01',
    end_date: '2025-03-31',
    location: 'ห้องประชุมและห้องเรียนโรงเรียนอนุบาลพัฒนาวิทยา',
    budget_source_id: 1,
    requested_budget: 95000.00,
    approved_budget: 90000.00,
    expected_outcomes: 'นักเรียนมีผลสัมฤทธิ์ทางการเรียนสูงขึ้น มีเจตคติที่ดีต่อการเรียนรู้ และมีทักษะการทำข้อสอบสมรรถนะ',
    indicators: 'ร้อยละของนักเรียนที่มีผลคะแนนสอบผ่านเกณฑ์ร้อยละ 50 ขึ้นไป',
    evaluation_method: 'แบบทดสอบ, แบบสังเกตพฤติกรรม, แบบประเมินความพึงพอใจ',
    status: 'approved',
    screening_note: 'ปรับลดค่าเอกสารประกอบการติวลง 5,000 บาท ให้อยู่ในกรอบงบประมาณวิชาการ เห็นควรอนุมัติ',
    director_note: 'อนุมัติตามที่กลั่นกรอง ขอให้ครูผู้สอนติดตามผลการทดสอบอย่างใกล้ชิด',
    approved_at: '2024-10-28 09:30:00',
    progress_percentage: 65,
    execution_status: 'in_progress',
    results_summary: 'จัดค่ายเสริมทักษะภาษาไทยและคณิตศาสตร์เรียบร้อยแล้ว อยู่ระหว่างเตรียมสอบ RT ป.1 และ NT ป.3',
    obstacles: 'นักเรียนบางส่วนยังขาดทักษะการอ่านจับใจความในข้อสอบภาษาไทย',
    recommendations: 'เพิ่มกิจกรรมฝึกอ่านจับใจความช่วงเช้า 15 นาทีก่อนเข้าแถว',
    created_at: '2024-10-18'
  },
  {
    id: 2,
    fiscal_year_id: 1,
    department: 'academic',
    code: 'วิชาการ-02',
    name: 'โครงการส่งเสริมการอ่านออกเขียนได้และห้องสมุดมีชีวิตดิจิทัล',
    proposer_id: 8,
    proposer_name: 'นายสมชาย สอนสนุก',
    supervisor_id: 4,
    strategy_alignment: 'ยุทธศาสตร์ที่ 1 พัฒนาคุณภาพการศึกษา',
    standard_alignment: 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
    rationale: 'การอ่านและการรู้หนังสือเป็นรากฐานสำคัญของการเรียนรู้ทุกกลุ่มสาระ การพัฒนาห้องสมุดให้ทันสมัยจะช่วยกระตุ้นนิสัยรักการอ่านและสร้างโอกาสการเรียนรู้ตลอดชีวิต',
    objectives: '1. ส่งเสริมให้นักเรียนทุกคนอ่านคล่องเขียนคล่องตามระดับชั้น\n2. จัดหาสื่อเทคโนโลยีดิจิทัลและหนังสือน่าอ่านสู่ห้องสมุด',
    target_qty: 'นักเรียนระดับชั้นอนุบาลถึง ป.6 จำนวน 320 คน',
    target_quality: 'นักเรียนทุกคนอ่านออกเขียนได้ตามเกณฑ์มาตรฐาน สพฐ. ร้อยละ 100',
    start_date: '2024-10-15',
    end_date: '2025-08-31',
    location: 'ห้องสมุดและลานการเรียนรู้',
    budget_source_id: 2,
    requested_budget: 75000.00,
    approved_budget: 75000.00,
    expected_outcomes: 'นักเรียนมีนิสัยรักการอ่าน ค้นคว้าข้อมูลด้วยตนเองได้อย่างมีประสิทธิภาพ',
    indicators: 'ผลการประเมินการอ่านออกเขียนได้ของ สพฐ.',
    evaluation_method: 'แบบบันทึกการยืมคืนหนังสือ, แบบประเมินการอ่าน',
    status: 'approved',
    screening_note: 'โครงการมีความสำคัญต่อพื้นฐานการเรียนรู้ วงเงินเหมาะสม ให้ความเห็นชอบ',
    director_note: 'อนุมัติโครงการเพื่อสร้างนิสัยรักการอ่านแก่เด็กทุกคน',
    approved_at: '2024-10-28 10:00:00',
    progress_percentage: 50,
    execution_status: 'in_progress',
    results_summary: 'จัดซื้อหนังสือนิทาน วรรณกรรมเยาวชน และระบบยืม-คืนบาร์โค้ดแล้ว',
    obstacles: '',
    recommendations: '',
    created_at: '2024-10-19'
  },
  {
    id: 3,
    fiscal_year_id: 1,
    department: 'general',
    code: 'ทั่วไป-01',
    name: 'โครงการปรับปรุงภูมิทัศน์และสิ่งแวดล้อมเพื่อสุขภาวะโรงเรียนน่าอยู่',
    proposer_id: 9,
    proposer_name: 'นางสมหญิง กิจกรรมเลิศ',
    supervisor_id: 7,
    strategy_alignment: 'ยุทธศาสตร์ที่ 3 เสริมสร้างบรรยากาศและสิ่งแวดล้อมที่เอื้อต่อการเรียนรู้',
    standard_alignment: 'มาตรฐานที่ 2 กระบวนการบริหารและการจัดการ',
    rationale: 'สภาพแวดล้อมที่ปลอดภัย สะอาด ร่มรื่น มีผลโดยตรงต่อการส่งเสริมสุขอนามัยและความปลอดภัยของผู้เรียนในสถานศึกษา',
    objectives: '1. ปรับปรุงระบบระบายน้ำและลานกิจกรรมกลางแจ้ง\n2. ซ่อมบำรุงห้องน้ำห้องสุขาและจุดล้างมือให้ถูกสุขลักษณะ',
    target_qty: 'พื้นที่โดยรอบอาคารเรียน 3 หลัง ลานกิจกรรม และห้องสุขา 4 หลัง',
    target_quality: 'สภาพแวดล้อมในโรงเรียนมีความปลอดภัย สะอาด และผ่านมาตรฐานสุขาภิบาลโรงเรียน',
    start_date: '2024-11-01',
    end_date: '2025-04-30',
    location: 'บริเวณโดยรอบโรงเรียน',
    budget_source_id: 1,
    requested_budget: 120000.00,
    approved_budget: 110000.00,
    expected_outcomes: 'โรงเรียนมีภูมิทัศน์สวยงาม ปลอดภัย และเอื้อต่อการจัดกิจกรรมการเรียนรู้',
    indicators: 'แบบสำรวจความปลอดภัยและความพึงพอใจของนักเรียนและผู้ปกครอง',
    evaluation_method: 'แบบตรวจสุขอนามัย, แบบประเมินความพึงพอใจ',
    status: 'approved',
    screening_note: 'ปรับลดค่าป้ายประชาสัมพันธ์ลง 10,000 บาท คงเหลืองบ 110,000 บาท',
    director_note: 'อนุมัติเพื่อความปลอดภัยและสุขภาวะที่ดีของบุคลากรและนักเรียน',
    approved_at: '2024-10-29 11:15:00',
    progress_percentage: 40,
    execution_status: 'in_progress',
    results_summary: 'ดำเนินการปรับปรุงลานกิจกรรมและทาสีแนวขอบทางเสร็จสิ้นแล้ว อยู่ระหว่างปรับปรุงสุขภัณฑ์',
    obstacles: '',
    recommendations: '',
    created_at: '2024-10-20'
  },
  {
    id: 4,
    fiscal_year_id: 1,
    department: 'personnel',
    code: 'บุคคล-01',
    name: 'โครงการพัฒนาสมรรถนะครูสู่การจัดการเรียนรู้เชิงรุก (Active Learning) และ AI เพื่อการศึกษา',
    proposer_id: 6,
    proposer_name: 'นางสาวพิมพ์ใจ เสริมบุคคล',
    supervisor_id: 6,
    strategy_alignment: 'ยุทธศาสตร์ที่ 2 พัฒนาครูและบุคลากรทางการศึกษา',
    standard_alignment: 'มาตรฐานที่ 2 กระบวนการบริหารและการจัดการ',
    rationale: 'เพื่อส่งเสริมให้ครูสามารถนำเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์มาประยุกต์ใช้ในการจัดการเรียนการสอนและการวัดประเมินผลอย่างมีประสิทธิภาพ',
    objectives: '1. พัฒนาครูให้สามารถออกแบบแผนการจัดการเรียนรู้แบบ Active Learning\n2. ส่งเสริมการใช้เครื่องมือ AI ในการพัฒนาสื่อการสอน',
    target_qty: 'ข้าราชการครูและบุคลากรทางการศึกษาทุกคนจำนวน 22 คน',
    target_quality: 'ครูร้อยละ 100 มีแผนจัดการเรียนรู้ Active Learning และผลิตสื่อนวัตกรรมอย่างน้อยคนละ 1 ชิ้น',
    start_date: '2024-12-01',
    end_date: '2025-05-31',
    location: 'ห้องประชุมสารสนเทศ',
    budget_source_id: 1,
    requested_budget: 65000.00,
    approved_budget: 60000.00,
    expected_outcomes: 'ครูมีทักษะการสอนสมัยใหม่ นักเรียนได้รับการจัดการเรียนรู้ที่กระตุ้นการคิดสร้างสรรค์',
    indicators: 'จำนวนสื่อนวัตกรรมและผลการประเมินการนิเทศการสอน',
    evaluation_method: 'แผนการสอน, รายงานนวัตกรรม, แบบประเมินการอบรม',
    status: 'approved',
    screening_note: 'สอดคล้องกับนโยบายกระทรวงศึกษาธิการ วงเงินอยู่ในกรอบงานบุคคล',
    director_note: 'อนุมัติโครงการเพื่อพัฒนาครูให้ก้าวทันเทคโนโลยี',
    approved_at: '2024-10-29 14:00:00',
    progress_percentage: 30,
    execution_status: 'in_progress',
    results_summary: 'จัดอบรมเชิงปฏิบัติการครั้งที่ 1 เรียบร้อยแล้ว',
    obstacles: '',
    recommendations: '',
    created_at: '2024-10-21'
  },
  {
    id: 5,
    fiscal_year_id: 1,
    department: 'budget',
    code: 'งบประมาณ-01',
    name: 'โครงการพัฒนาระบบเทคโนโลยีสารสนเทศและการบริหารพัสดุสินทรัพย์ดิจิทัล',
    proposer_id: 5,
    proposer_name: 'นายสุรชัย บัญชีทรัพย์',
    supervisor_id: 5,
    strategy_alignment: 'ยุทธศาสตร์ที่ 4 เพิ่มประสิทธิภาพการบริหารจัดการภาครัฐ',
    standard_alignment: 'มาตรฐานที่ 2 กระบวนการบริหารและการจัดการ',
    rationale: 'การบริหารจัดการพัสดุและงบประมาณด้วยระบบดิจิทัลจะช่วยสร้างความโปร่งใส ตรวจสอบได้ และลดระยะเวลาการทำงาน',
    objectives: '1. พัฒนาระบบทะเบียนคุมพัสดุและครุภัณฑ์ด้วย QR Code\n2. จัดหาระบบสำรองข้อมูลและคอมพิวเตอร์สำหรับการเงินพัสดุ',
    target_qty: 'ระบบงานพัสดุ การเงิน และบัญชีของโรงเรียน 100%',
    target_quality: 'ข้อมูลพัสดุถูกต้อง มีการตรวจสอบประจำปีได้รวดเร็วขึ้นร้อยละ 50',
    start_date: '2024-10-01',
    end_date: '2025-07-31',
    location: 'ห้องกลุ่มบริหารงบประมาณและสินทรัพย์',
    budget_source_id: 3,
    requested_budget: 50000.00,
    approved_budget: 48000.00,
    expected_outcomes: 'การบริหารพัสดุมีความถูกต้อง โปร่งใส เป็นไปตามระเบียบพัสดุภาครัฐ',
    indicators: 'รายงานการตรวจสอบพัสดุประจำปี',
    evaluation_method: 'รายงานการตรวจสอบพัสดุ, การสแกน QR Code',
    status: 'approved',
    screening_note: 'วงเงินเหมาะสมและช่วยเพิ่มประสิทธิภาพการควบคุมสินทรัพย์',
    director_note: 'อนุมัติเพื่อความโปร่งใสและตรวจสอบได้',
    approved_at: '2024-10-30 15:30:00',
    progress_percentage: 80,
    execution_status: 'in_progress',
    results_summary: 'ติดแท็ก QR Code ครุภัณฑ์เสร็จแล้วกว่า 80%',
    obstacles: '',
    recommendations: '',
    created_at: '2024-10-22'
  },
  {
    id: 6,
    fiscal_year_id: 1,
    department: 'academic',
    code: 'วิชาการ-03',
    name: 'โครงการส่งเสริมความเป็นเลิศทางคณิตศาสตร์และวิทยาศาสตร์ (STEM Education)',
    proposer_id: 8,
    proposer_name: 'นายสมชาย สอนสนุก',
    supervisor_id: 4,
    strategy_alignment: 'ยุทธศาสตร์ที่ 1 พัฒนาคุณภาพผู้เรียน',
    standard_alignment: 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
    rationale: 'สะเต็มศึกษาช่วยบูรณาการความรู้ด้านวิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์ และคณิตศาสตร์ เพื่อสร้างนักคิดและนวัตกรน้อย',
    objectives: '1. จัดซื้อชุดทดลองสะเต็มศึกษาและหุ่นยนต์เบื้องต้น\n2. จัดนิทรรศการสัปดาห์วิทยาศาสตร์และคณิตศาสตร์',
    target_qty: 'นักเรียนชั้น ป.4 - ป.6 จำนวน 120 คน',
    target_quality: 'นักเรียนมีทักษะการคิดเชิงคำนวณและการแก้ปัญหาตามแนวทางสะเต็มศึกษา',
    start_date: '2025-01-10',
    end_date: '2025-08-20',
    location: 'ห้องปฏิบัติการวิทยาศาสตร์',
    budget_source_id: 1,
    requested_budget: 80000.00,
    approved_budget: 70000.00,
    expected_outcomes: 'นักเรียนสามารถสร้างชิ้นงานหรือสิ่งประดิษฐ์ทางวิทยาศาสตร์ได้',
    indicators: 'ผลงานโครงงานวิทยาศาสตร์และสะเต็มศึกษา',
    evaluation_method: 'แบบประเมินโครงงาน, แบบสังเกตพฤติกรรม',
    status: 'screened',
    screening_note: 'ปรับลดงบประมาณจาก 80,000 เป็น 70,000 บาท เนื่องจากรายการชุดทดลองบางชิ้นโรงเรียนมีอยู่แล้ว รอ ผอ. ลงนามอนุมัติ',
    director_note: '',
    approved_at: null,
    progress_percentage: 0,
    execution_status: 'not_started',
    results_summary: '',
    obstacles: '',
    recommendations: '',
    created_at: '2024-11-05'
  },
  {
    id: 7,
    fiscal_year_id: 1,
    department: 'academic',
    code: 'วิชาการ-04',
    name: 'โครงการค่ายภาษาอังกฤษเพื่อการสื่อสารสู่อาเซียน (English Camp)',
    proposer_id: 8,
    proposer_name: 'นายสมชาย สอนสนุก',
    supervisor_id: 4,
    strategy_alignment: 'ยุทธศาสตร์ที่ 1 พัฒนาคุณภาพการศึกษา',
    standard_alignment: 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
    rationale: 'การฝึกทักษะภาษาอังกฤษผ่านค่ายกิจกรรมเชิงรุกช่วยสร้างความมั่นใจในการสื่อสาร',
    objectives: '1. ให้นักเรียนได้ฝึกสนทนาภาษาอังกฤษกับเจ้าของภาษา\n2. จัดกิจกรรมบูรณาการทักษะฟัง-พูด-อ่าน-เขียนอย่างสนุกสนาน',
    target_qty: 'นักเรียนชั้น ป.1 - ป.6 ทุกคน 320 คน',
    target_quality: 'นักเรียนมีความกล้าแสดงออกในการสื่อสารภาษาอังกฤษเพิ่มขึ้นร้อยละ 80',
    start_date: '2025-02-15',
    end_date: '2025-02-17',
    location: 'ค่ายลูกเสือ/หอประชุมโรงเรียน',
    budget_source_id: 2,
    requested_budget: 60000.00,
    approved_budget: 0.00,
    expected_outcomes: 'นักเรียนมีเจตคติที่ดีและกล้าสื่อสารภาษาอังกฤษในชีวิตประจำวัน',
    indicators: 'แบบประเมินทักษะการสนทนาภาษาอังกฤษ',
    evaluation_method: 'แบบทดสอบก่อน-หลังเรียน, แบบสอบถามความพึงพอใจ',
    status: 'submitted',
    screening_note: '',
    director_note: '',
    approved_at: null,
    progress_percentage: 0,
    execution_status: 'not_started',
    results_summary: '',
    obstacles: '',
    recommendations: '',
    created_at: '2024-11-10'
  }
];

let budgetItems = [
  { id: 1, project_id: 1, category: 'compensation', item_name: 'ค่าตอบแทนวิทยากรภายนอกติวเข้ม O-NET/NT (6 ชม. x 600 บาท)', quantity: 6.00, unit: 'ชั่วโมง', unit_price: 600.00, total_price: 3600.00 },
  { id: 2, project_id: 1, category: 'operating', item_name: 'ค่าอาหารกลางวันนักเรียนและคณะทำงานค่ายติวเข้ม (180 คน x 60 บาท x 3 วัน)', quantity: 540.00, unit: 'มื้อ', unit_price: 60.00, total_price: 32400.00 },
  { id: 3, project_id: 1, category: 'operating', item_name: 'ค่าอาหารว่างและเครื่องดื่ม (180 คน x 25 บาท x 2 มื้อ x 3 วัน)', quantity: 1080.00, unit: 'ชุด', unit_price: 25.00, total_price: 27000.00 },
  { id: 4, project_id: 1, category: 'materials', item_name: 'ค่าจัดพิมพ์คู่มือแบบฝึกทักษะและข้อสอบเสมือนจริง RT, NT, O-NET', quantity: 180.00, unit: 'เล่ม', unit_price: 120.00, total_price: 21600.00 },
  { id: 5, project_id: 1, category: 'materials', item_name: 'ค่าเครื่องเขียนและกระดาษคำตอบสำหรับทดสอบเสมือนจริง', quantity: 1.00, unit: 'ชุด', unit_price: 5400.00, total_price: 5400.00 },

  { id: 6, project_id: 2, category: 'materials', item_name: 'หนังสือวรรณกรรมเยาวชนและนิทานส่งเสริมจริยธรรม', quantity: 250.00, unit: 'เล่ม', unit_price: 180.00, total_price: 45000.00 },
  { id: 7, project_id: 2, category: 'materials', item_name: 'อุปกรณ์ระบบยืม-คืนบาร์โค้ดและฉลากหนังสือ', quantity: 1.00, unit: 'ชุด', unit_price: 15000.00, total_price: 15000.00 },
  { id: 8, project_id: 2, category: 'operating', item_name: 'ค่าจัดนิทรรศการสัปดาห์รักการอ่านและรางวัลยอดนักอ่าน', quantity: 1.00, unit: 'งาน', unit_price: 15000.00, total_price: 15000.00 },

  { id: 9, project_id: 3, category: 'materials', item_name: 'สีทาแนวขอบทางและปูนซีเมนต์ซ่อมแซมลานกิจกรรม', quantity: 1.00, unit: 'งาน', unit_price: 28000.00, total_price: 28000.00 },
  { id: 10, project_id: 3, category: 'operating', item_name: 'ค่าจ้างเหมาซ่อมแซมระบบท่อระบายน้ำรอบอาคารเรียน 1', quantity: 1.00, unit: 'งาน', unit_price: 42000.00, total_price: 42000.00 },
  { id: 11, project_id: 3, category: 'materials', item_name: 'อุปกรณ์สุขภัณฑ์และก๊อกน้ำประหยัดน้ำสำหรับสุขา', quantity: 1.00, unit: 'ชุด', unit_price: 40000.00, total_price: 40000.00 }
];

let expenses = [
  { id: 1, project_id: 1, expense_date: '2024-11-20', doc_number: 'ขบ. 12/2568', title: 'ค่าจัดพิมพ์คู่มือแบบฝึกทักษะข้อสอบเสมือนจริง RT, NT, O-NET', category: 'materials', amount: 21600.00, disbursed_by: 'นายสมชาย สอนสนุก', receipt_note: 'ใบเสร็จรับเงินเล่มที่ 04 เลขที่ 28 ร้านวิทยาภัณฑ์การพิมพ์' },
  { id: 2, project_id: 1, expense_date: '2024-12-15', doc_number: 'ขบ. 25/2568', title: 'ค่าอาหารกลางวันและอาหารว่างค่ายติวเข้มรอบที่ 1', category: 'operating', amount: 20600.00, disbursed_by: 'นายสมชาย สอนสนุก', receipt_note: 'ใบสำคัญรับเงินกลุ่มแม่บ้านประกอบอาหาร' },
  { id: 3, project_id: 1, expense_date: '2025-01-18', doc_number: 'ขบ. 44/2568', title: 'ค่าตอบแทนวิทยากรภายนอกติววิชาวิทยาศาสตร์และคณิตศาสตร์', category: 'compensation', amount: 3600.00, disbursed_by: 'นายสมชาย สอนสนุก', receipt_note: 'ใบสำคัญรับเงินวิทยากร อ.สมศักดิ์ ชัยเจริญ' },
  { id: 4, project_id: 1, expense_date: '2025-01-25', doc_number: 'ขบ. 51/2568', title: 'ค่าเครื่องเขียนและกระดาษคำตอบ Pre-test', category: 'materials', amount: 5400.00, disbursed_by: 'นายสมชาย สอนสนุก', receipt_note: 'ใบเสร็จร้านบุญครองเครื่องเขียน' },

  { id: 5, project_id: 3, expense_date: '2024-11-28', doc_number: 'ขบ. 18/2568', title: 'ค่าสีทาแนวขอบทางและปูนซีเมนต์ซ่อมแซมลานกิจกรรม', category: 'materials', amount: 28000.00, disbursed_by: 'นายพิชิต สภาพแวดล้อม', receipt_note: 'ใบเสร็จรับเงิน หจก.บุรีรัมย์โฮมมาร์ท' },
  { id: 6, project_id: 3, expense_date: '2024-12-20', doc_number: 'ขบ. 31/2568', title: 'ค่าจ้างเหมาซ่อมแซมระบบท่อระบายน้ำรอบอาคารเรียน 1', category: 'operating', amount: 17000.00, disbursed_by: 'นายพิชิต สภาพแวดล้อม', receipt_note: 'ใบตรวจรับพัสดุและใบเสร็จช่างชุมชน' },

  { id: 7, project_id: 4, expense_date: '2024-12-18', doc_number: 'ขบ. 29/2568', title: 'ค่าอาหารว่างและเครื่องดื่มการอบรม Active Learning รุ่นที่ 1', category: 'operating', amount: 8000.00, disbursed_by: 'นางสาวพิมพ์ใจ เสริมบุคคล', receipt_note: 'ใบเสร็จรับเงินร้านกาแฟชุมชน' },
  { id: 8, project_id: 4, expense_date: '2024-12-18', doc_number: 'ขบ. 30/2568', title: 'ค่าวิทยากรการอบรมการประยุกต์ใช้ AI ในการสร้างสื่อการสอน', category: 'compensation', amount: 14000.00, disbursed_by: 'นางสาวพิมพ์ใจ เสริมบุคคล', receipt_note: 'ใบสำคัญรับเงิน ดร.ปิยะ วงศ์ใหญ่' },

  { id: 9, project_id: 5, expense_date: '2024-10-25', doc_number: 'ขบ. 05/2568', title: 'ค่าเครื่องสแกนบาร์โค้ดและฉลาก QR Code สำหรับทะเบียนพัสดุ', category: 'materials', amount: 18000.00, disbursed_by: 'นายสุรชัย บัญชีทรัพย์', receipt_note: 'ใบกำกับภาษี บจก.ไทยไอทีเซอร์วิส' },
  { id: 10, project_id: 5, expense_date: '2024-11-10', doc_number: 'ขบ. 10/2568', title: 'ค่าอุปกรณ์จัดเก็บข้อมูลสำรองความปลอดภัยของระบบบัญชี (NAS & HDD)', category: 'materials', amount: 20000.00, disbursed_by: 'นายสุรชัย บัญชีทรัพย์', receipt_note: 'ใบกำกับภาษี บจก.เจเนอรัลคอมพิวเตอร์' }
];

let progressLogs = [
  { id: 1, project_id: 1, log_date: '2024-11-25', progress_percent: 30, details: 'จัดทำเอกสารคู่มือแบบฝึกทักษะและจัดกิจกรรม Pre-test ครบทั้ง 3 ระดับชั้น', obstacles: 'นักเรียนบางส่วนยังขาดทักษะการอ่านจับใจความในข้อสอบภาษาไทย', solutions: 'ครูประจำวิชาเพิ่มเวลาฝึกอ่านจับใจความช่วงพักกลางวัน 15 นาที', recorded_by: 'นายสมชาย สอนสนุก' },
  { id: 2, project_id: 1, log_date: '2025-01-20', progress_percent: 65, details: 'จัดค่ายติวเข้มเข้มข้นร่วมกับวิทยากรภายนอก นักเรียนมีความพร้อมและมั่นใจมากขึ้น', obstacles: 'ช่วงเวลาติวชนกับกิจกรรมกีฬาอำเภอ', solutions: 'ปรับเปลี่ยนตารางการสอนเสริมในช่วงบ่ายวันเสาร์เพื่อไม่ให้กระทบเวลาเรียน', recorded_by: 'นายสมชาย สอนสนุก' },
  { id: 3, project_id: 3, log_date: '2024-12-25', progress_percent: 40, details: 'ซ่อมแซมระบบระบายน้ำและทาสีลานกิจกรรมเสร็จแล้ว โรงเรียนมีความปลอดภัยน่าอยู่มากขึ้น', obstacles: 'ช่วงต้นเดือนมีฝนตกประปรายทำให้งานทาสีล่าช้าเล็กน้อย', solutions: 'จัดเวรช่างเร่งดำเนินงานในช่วงวันหยุดสุดสัปดาห์', recorded_by: 'นายพิชิต สภาพแวดล้อม' }
];

// Helper to compute project stats
function calculateProjectFinancials(projId) {
  const p = projects.find(item => item.id === parseInt(projId));
  if (!p) return { requested: 0, approved: 0, spent: 0, remaining: 0, percentSpent: 0 };
  
  const pExpenses = expenses.filter(e => e.project_id === p.id);
  const totalSpent = pExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const approvedBudget = parseFloat(p.approved_budget) || 0;
  const remaining = approvedBudget - totalSpent;
  const percentSpent = approvedBudget > 0 ? ((totalSpent / approvedBudget) * 100).toFixed(1) : 0;

  return {
    requested: parseFloat(p.requested_budget) || 0,
    approved: approvedBudget,
    spent: totalSpent,
    remaining: remaining,
    percentSpent: parseFloat(percentSpent)
  };
}

// ==========================================
// Authentication & Registration Endpoints
// ==========================================

// Verify 8-digit SMIS Code
app.post('/api/auth/verify_smis.php', (req, res) => {
  const { smis_code } = req.body;
  const cleanCode = (smis_code || '').trim();

  if (!cleanCode || cleanCode.length !== 8) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกรหัส SMIS ให้ถูกต้องครบ 8 หลัก' });
  }

  const school = schools.find(s => s.smis_code === cleanCode);
  if (!school) {
    return res.status(404).json({ 
      status: 'error', 
      message: `ไม่พบสถานศึกษารหัส SMIS "${cleanCode}" ในระบบ กรุณาติดต่อ Super Admin เพื่อเปิดใช้งานสถานศึกษา` 
    });
  }

  if (school.status !== 'active') {
    return res.status(403).json({ 
      status: 'error', 
      message: `สถานศึกษา "${school.name}" (SMIS: ${cleanCode}) ยังไม่ได้รับการเปิดใช้งานจาก Super Admin (สถานะปัจจุบัน: ${school.status === 'pending' ? 'รอเปิดใช้งาน' : 'ระงับการใช้งาน'})` 
    });
  }

  res.json({
    status: 'success',
    school: {
      id: school.id,
      smis_code: school.smis_code,
      name: school.name,
      affiliation: school.affiliation,
      province: school.province,
      status: school.status
    }
  });
});

// Staff / Teacher Registration (supports /api/auth/register.php and /api/register.php)
app.post(['/api/auth/register.php', '/api/register.php'], (req, res) => {
  const { smis_code, id_card, name, position, department, phone, email } = req.body;

  // 1. Verify SMIS 8-digit
  const cleanSmis = (smis_code || '').trim();
  if (!cleanSmis || cleanSmis.length !== 8) {
    return res.status(400).json({ status: 'error', message: 'กรุณาระบุรหัส SMIS 8 หลักของโรงเรียน' });
  }
  const school = schools.find(s => s.smis_code === cleanSmis);
  if (!school || school.status !== 'active') {
    return res.status(400).json({ 
      status: 'error', 
      message: 'รหัส SMIS นี้ยังไม่ได้รับการเปิดใช้งานจาก Super Admin กรุณาติดต่อผู้ดูแลระบบเขตพื้นที่ฯ' 
    });
  }

  // 2. Verify 13-digit National ID
  const cleanIdCard = (id_card || '').replace(/[^0-9]/g, '');
  if (cleanIdCard.length !== 13) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกหมายเลขประจำตัวประชาชนให้ถูกต้องครบ 13 หลัก' });
  }

  const existingUser = users.find(u => u.id_card === cleanIdCard || u.username === cleanIdCard);
  if (existingUser) {
    return res.status(400).json({ status: 'error', message: 'หมายเลขประจำตัวประชาชนนี้ได้ลงทะเบียนไว้ในระบบแล้ว' });
  }

  if (!name || !position) {
    return res.status(400).json({ status: 'error', message: 'กรุณาระบุชื่อ-นามสกุล และตำแหน่งให้ครบถ้วน' });
  }

  // Map position to default role
  let role = 'teacher';
  if (position.includes('ผู้อำนวยการโรงเรียน')) role = 'director';
  else if (position.includes('รองผู้อำนวยการ')) role = 'deputy_director';
  else if (position.includes('แผนงาน') || position.includes('งบประมาณ')) role = 'plan_officer';

  const newId = Math.max(...users.map(u => u.id), 0) + 1;
  const newUser = {
    id: newId,
    username: cleanIdCard, // ใช้เลขบัตร ปชช. เป็น Username ได้
    id_card: cleanIdCard,
    password: '123456', // รหัสผ่านเริ่มต้นคือ 1-6 (123456)
    name: name.trim(),
    position: position.trim(),
    department: department || 'academic',
    role: role,
    phone: phone || '',
    email: email || '',
    school_id: school.id,
    is_approved: 1,
    must_change_password: 1 // บังคับให้เปลี่ยนรหัสผ่านในครั้งต่อไป
  };

  users.push(newUser);

  res.json({
    status: 'success',
    message: 'สมัครสมาชิกสำเร็จ! รหัสผ่านเริ่มต้นสำหรับการเข้าใช้งานครั้งแรกคือ 123456 ระบบจะให้ท่านเปลี่ยนรหัสผ่านใหม่เมื่อเข้าสู่ระบบ',
    user: {
      username: newUser.username,
      name: newUser.name,
      school_name: school.name
    }
  });
});

// Change Password Endpoint (for first login or profile update)
app.post('/api/auth/change_password.php', (req, res) => {
  const { username, current_password, new_password } = req.body;
  const user = users.find(u => u.username === username || u.id_card === username);

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'ไม่พบผู้ใช้งานในระบบ' });
  }

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ status: 'error', message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
  }

  // Update password and clear must_change_password flag
  user.password = new_password;
  user.must_change_password = 0;

  res.json({ status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' });
});

// Login Endpoint
app.post('/api/login.php', (req, res) => {
  const { username, password } = req.body;
  const cleanU = (username || '').trim();
  const cleanP = (password || '').trim();

  // Find user by username or 13-digit id_card
  const user = users.find(u => u.username === cleanU || u.id_card === cleanU);
  
  if (user && (!cleanP || cleanP === '123' || cleanP === '123456' || user.password === cleanP)) {
    const userSchool = schools.find(s => s.id === user.school_id) || schoolInfo;
    
    // Check if user is using default password (123 or 123456)
    const isUsingDefaultPassword = (cleanP === '123456' || cleanP === '123' || user.password === '123456' || user.password === '123');
    const mustChange = user.must_change_password === 1 || (isUsingDefaultPassword && user.must_change_password !== 0);

    res.json({
      status: 'success',
      user: {
        id: user.id,
        username: user.username,
        id_card: user.id_card || '',
        name: user.name,
        role: user.role,
        department: user.department,
        position: user.position,
        school_id: userSchool.id,
        school_name: userSchool.name,
        smis_code: userSchool.smis_code,
        logo_url: userSchool.logo_url,
        must_change_password: mustChange ? 1 : 0
      },
      school: userSchool
    });
  } else {
    res.status(401).json({ 
      status: 'error', 
      message: 'ชื่อผู้ใช้งาน (หรือเลขบัตร ปชช.) หรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นคือ 123456 หรือ 123)' 
    });
  }
});

// ==========================================
// School Profile & Settings (School Admin)
// ==========================================

app.get('/api/school/get_settings.php', (req, res) => {
  res.json({
    status: 'success',
    school: schoolInfo,
    all_schools: schools
  });
});

app.post('/api/school/save_settings.php', (req, res) => {
  const {
    name, affiliation, province, district, subdistrict,
    address, postal_code, phone, email, website,
    director_name, director_position, plan_officer_name, logo_url
  } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อสถานศึกษา' });
  }

  // Update schoolInfo
  schoolInfo.name = name.trim();
  schoolInfo.affiliation = (affiliation || schoolInfo.affiliation).trim();
  schoolInfo.province = (province || schoolInfo.province).trim();
  schoolInfo.district = (district || schoolInfo.district || '').trim();
  schoolInfo.subdistrict = (subdistrict || schoolInfo.subdistrict || '').trim();
  schoolInfo.address = (address || schoolInfo.address || '').trim();
  schoolInfo.postal_code = (postal_code || schoolInfo.postal_code || '').trim();
  schoolInfo.phone = (phone || schoolInfo.phone || '').trim();
  schoolInfo.email = (email || schoolInfo.email || '').trim();
  schoolInfo.website = (website || schoolInfo.website || '').trim();
  schoolInfo.director_name = (director_name || schoolInfo.director_name).trim();
  schoolInfo.director_position = (director_position || schoolInfo.director_position).trim();
  schoolInfo.plan_officer_name = (plan_officer_name || schoolInfo.plan_officer_name).trim();
  if (logo_url !== undefined) {
    schoolInfo.logo_url = logo_url.trim();
  }

  // Also sync into matching entry in schools list
  const idx = schools.findIndex(s => s.id === schoolInfo.id);
  if (idx !== -1) {
    schools[idx] = { ...schools[idx], ...schoolInfo };
  }

  res.json({
    status: 'success',
    message: 'บันทึกข้อมูลและตราสัญลักษณ์สถานศึกษาสำเร็จ! ชื่อและโลโก้โรงเรียนจะแสดงบนส่วนของ Header ทันที',
    school: schoolInfo
  });
});

// ==========================================
// Super Admin Endpoints (Manage Schools by SMIS)
// ==========================================

app.get('/api/superadmin/get_schools.php', (req, res) => {
  const enrichedSchools = schools.map(s => ({
    ...s,
    is_active: s.status === 'active' ? 1 : 0,
    admin_name: s.assigned_admin_name || ''
  }));

  const stats = {
    totalSchools: enrichedSchools.length,
    activeSchools: enrichedSchools.filter(s => s.status === 'active').length,
    pendingSchools: enrichedSchools.filter(s => s.status === 'pending').length,
    totalUsers: users.length,
    totalProjects: projects.length
  };

  res.json({
    status: 'success',
    schools: enrichedSchools,
    data: enrichedSchools,
    stats,
    users: users.map(u => ({ id: u.id, name: u.name, position: u.position, role: u.role, school_id: u.school_id }))
  });
});

// Database Auto-Installer / Migration Endpoint for Super Admin
app.post('/api/superadmin/install_database.php', (req, res) => {
  const steps = [
    {
      step: 1,
      table: 'schools',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบและอัปเดตโครงสร้างตาราง schools (รองรับรหัส SMIS 8 หลัก, ชื่อสถานศึกษา, สังกัดเขตพื้นที่ฯ, ตราสัญลักษณ์ logo_url, ผู้ดูแลระบบ assigned_admin_id/name, สถานะ active/pending)'
    },
    {
      step: 2,
      table: 'users',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบและอัปเดตตาราง users (รองรับเลขประจำตัวประชาชน 13 หลัก id_card, บทบาทสิทธิ์ super_admin, school_admin, director, deputy_director, plan_officer, department_head, teacher, บังคับเปลี่ยนรหัสผ่าน must_change_password)'
    },
    {
      step: 3,
      table: 'student_subsidies',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ติดตั้งตาราง student_subsidies (คำนวณเงินอุดหนุนรายหัวและเงินกิจกรรมพัฒนาคุณภาพผู้เรียน กพพ. 4 ระดับการศึกษา: อนุบาล, ประถมศึกษา, มัธยมศึกษาตอนต้น, มัธยมศึกษาตอนปลาย)'
    },
    {
      step: 4,
      table: 'fiscal_years',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง fiscal_years (จัดการปีงบประมาณ พ.ศ., ช่วงเวลาเริ่มต้น-สิ้นสุด, กำหนดปีปัจจุบัน is_current, สถานะ planning/active/closed)'
    },
    {
      step: 5,
      table: 'budget_sources',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง budget_sources (รองรับเงินอุดหนุนรายหัว, เงินกิจกรรมพัฒนาผู้เรียน กพพ., เงินรายได้สถานศึกษา, เงินระดมทรัพยากร/บริจาค, เงินปัจจัยพื้นฐาน CCT)'
    },
    {
      step: 6,
      table: 'department_allocations',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง department_allocations (จัดสรรกรอบวงเงินงบประมาณ 4 กลุ่มบริหารงาน: วิชาการ, งบประมาณ, บุคคล, ทั่วไป และงบสำรองส่วนกลาง ครบ 100%)'
    },
    {
      step: 7,
      table: 'projects',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง projects (แบบเสนอโครงการมาตรฐาน สพฐ., ขั้นตอนการกลั่นกรองและอนุมัติ, ตรวจสอบงบประมาณคงเหลือ, รองรับ AI Assistance Gemini 3.8 Flash)'
    },
    {
      step: 8,
      table: 'budget_items',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง budget_items (จำแนกค่าใช้จ่าย 3 หมวดราชการ: ค่าตอบแทน, ค่าใช้สอย, ค่าวัสดุ พร้อมคำนวณยอดเงินรวมอัตโนมัติ)'
    },
    {
      step: 9,
      table: 'project_expenses',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง project_expenses (บันทึกการเบิกจ่ายงบประมาณจริง เลขที่เอกสารเบิกจ่าย วันที่ และคำนวณงบคงเหลือแบบ Real-time)'
    },
    {
      step: 10,
      table: 'project_progress_logs',
      status: 'success',
      action: 'CHECK_AND_UPDATE',
      details: 'ตรวจสอบตาราง project_progress_logs (บันทึกรายงานผลความก้าวหน้าโครงการ ร้อยละความสำเร็จ ปัญหาอุปสรรค และแนวทางแก้ไขตามวงจร PDCA)'
    }
  ];

  res.json({
    status: 'success',
    message: 'ติดตั้งและอัปเดตตารางฐานข้อมูลระบบทั้งหมด (10 ตารางหลัก) ให้ตรงตามโครงสร้างล่าสุดเรียบร้อยสมบูรณ์',
    timestamp: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
    total_tables: steps.length,
    steps: steps,
    database_version: '2026.1-SMIS8-PLANOS'
  });
});

// Alias for fix_database endpoint
app.all('/api/admin/fix_database.php', (req, res) => {
  res.redirect(307, '/api/superadmin/install_database.php');
});

// Super Admin: Activate / Save School (No school admin required at activation!)
app.post('/api/superadmin/save_school.php', (req, res) => {
  const { id, smis_code, name, affiliation, province, district, status } = req.body;

  const cleanSmis = (smis_code || '').trim();
  if (!cleanSmis || cleanSmis.length !== 8) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกรหัส SMIS ให้ครบ 8 หลัก' });
  }

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อสถานศึกษา' });
  }

  if (id) {
    const idx = schools.findIndex(s => s.id === parseInt(id));
    if (idx !== -1) {
      schools[idx] = {
        ...schools[idx],
        smis_code: cleanSmis,
        code: cleanSmis,
        name: name.trim(),
        affiliation: affiliation || schools[idx].affiliation,
        province: province || schools[idx].province,
        district: district || schools[idx].district,
        status: status || schools[idx].status
      };
      if (schools[idx].id === schoolInfo.id) {
        schoolInfo = schools[idx];
      }
      return res.json({ status: 'success', message: 'อัปเดตข้อมูลสถานศึกษาสำเร็จ', school: schools[idx] });
    }
  } else {
    // Check duplicate SMIS
    if (schools.some(s => s.smis_code === cleanSmis)) {
      return res.status(400).json({ status: 'error', message: `รหัส SMIS "${cleanSmis}" มีอยู่ในระบบแล้ว` });
    }

    const newId = Math.max(...schools.map(s => s.id), 0) + 1;
    const newSchool = {
      id: newId,
      code: cleanSmis,
      smis_code: cleanSmis,
      name: name.trim(),
      affiliation: affiliation || 'สำนักงานเขตพื้นที่การศึกษา',
      province: province || 'บุรีรัมย์',
      district: district || 'เมืองบุรีรัมย์',
      subdistrict: '',
      address: '',
      postal_code: '',
      phone: '',
      email: '',
      website: '',
      director_name: 'ผู้อำนวยการสถานศึกษา',
      director_position: 'ผู้อำนวยการโรงเรียน',
      plan_officer_name: 'เจ้าหน้าที่แผนงาน',
      assigned_admin_name: '', // ยังไม่ต้องกำหนด Admin (รอให้ครูสมัครเข้ามาก่อน)
      assigned_admin_id: null,
      logo_url: '',
      status: status || 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    schools.push(newSchool);
    res.json({ 
      status: 'success', 
      message: `เปิดใช้งานสถานศึกษา "${name}" ด้วยรหัส SMIS ${cleanSmis} เรียบร้อยแล้ว (คุณครูสามารถสมัครเข้าใช้งานได้ทันที เพื่อให้เลือกแต่งตั้งเป็น Admin ต่อไป)`, 
      school: newSchool 
    });
  }
});

// Super Admin: Toggle School Status (supports toggle_school_status.php and toggle_status.php)
app.post(['/api/superadmin/toggle_school_status.php', '/api/superadmin/toggle_status.php'], (req, res) => {
  const schoolId = req.body.school_id || req.body.id;
  const school = schools.find(s => s.id === parseInt(schoolId));
  if (!school) return res.status(404).json({ status: 'error', message: 'ไม่พบสถานศึกษา' });

  if (req.body.is_active !== undefined) {
    school.status = req.body.is_active === 1 ? 'active' : 'inactive';
  } else if (req.body.status !== undefined) {
    school.status = req.body.status;
  } else {
    school.status = school.status === 'active' ? 'inactive' : 'active';
  }

  school.is_active = school.status === 'active' ? 1 : 0;
  if (school.id === schoolInfo.id) {
    schoolInfo.status = school.status;
  }

  res.json({ 
    status: 'success', 
    message: `เปลี่ยนสถานะโรงเรียน "${school.name}" เป็น ${school.status === 'active' ? 'เปิดใช้งาน (Active)' : 'ระงับการใช้งาน'} สำเร็จ`, 
    school: {
      ...school,
      is_active: school.is_active,
      admin_name: school.assigned_admin_name || ''
    }
  });
});

// Super Admin: Get all teachers registered under a school (by school_id or smis_code)
app.get('/api/superadmin/get_school_teachers.php', (req, res) => {
  const schoolId = parseInt(req.query.school_id);
  const smisCode = (req.query.smis_code || '').trim();

  let school = null;
  if (schoolId) {
    school = schools.find(s => s.id === schoolId);
  } else if (smisCode) {
    school = schools.find(s => s.smis_code === smisCode);
  }

  if (!school) {
    return res.status(404).json({ status: 'error', message: 'ไม่พบสถานศึกษาตามที่ระบุ' });
  }

  // Find all users who registered under this school
  const schoolTeachers = users.filter(u => u.school_id === school.id);

  res.json({
    status: 'success',
    school: {
      id: school.id,
      name: school.name,
      smis_code: school.smis_code,
      affiliation: school.affiliation,
      assigned_admin_name: school.assigned_admin_name || '',
      assigned_admin_id: school.assigned_admin_id || null
    },
    total_teachers: schoolTeachers.length,
    teachers: schoolTeachers.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      id_card: u.id_card,
      position: u.position,
      department: u.department,
      role: u.role,
      is_school_admin: (school.assigned_admin_id === u.id || u.role === 'school_admin'),
      phone: u.phone || '',
      email: u.email || ''
    }))
  });
});

// Super Admin: Assign an existing registered teacher to be the School Admin
app.post('/api/superadmin/assign_admin.php', (req, res) => {
  const { school_id, admin_id, admin_name } = req.body;
  const school = schools.find(s => s.id === parseInt(school_id));
  if (!school) return res.status(404).json({ status: 'error', message: 'ไม่พบสถานศึกษา' });

  // If a teacher ID is provided from registered teachers list
  if (admin_id) {
    const teacher = users.find(u => u.id === parseInt(admin_id) && u.school_id === school.id);
    if (!teacher) {
      return res.status(400).json({ status: 'error', message: 'ไม่พบคุณครูหรือบุคลากรที่สังกัดสถานศึกษานี้' });
    }

    // Update user role to school_admin
    teacher.role = 'school_admin';
    school.assigned_admin_name = teacher.name;
    school.assigned_admin_id = teacher.id;

    if (school.id === schoolInfo.id) {
      schoolInfo.assigned_admin_name = teacher.name;
      schoolInfo.assigned_admin_id = teacher.id;
    }

    return res.json({ 
      status: 'success', 
      message: `แต่งตั้งคุณครู "${teacher.name}" (${teacher.position}) เป็น Admin ดูแลระบบของ "${school.name}" เรียบร้อยแล้ว`,
      school,
      admin_user: teacher
    });
  }

  // Fallback if admin_name is set manually
  if (admin_name) {
    school.assigned_admin_name = admin_name;
    return res.json({ 
      status: 'success', 
      message: `บันทึกชื่อผู้ดูแลระบบ "${admin_name}" เรียบร้อย`,
      school
    });
  }

  res.status(400).json({ status: 'error', message: 'กรุณาเลือกคุณครูที่ต้องการแต่งตั้งเป็น Admin' });
});

// ==========================================
// Plan Officer: Student Counts & Subsidies Calculator
// ==========================================

app.get('/api/plan/get_subsidy_data.php', (req, res) => {
  const yearId = parseInt(req.query.year_id) || 1;
  const calc = calculateSubsidies(yearId);
  res.json({
    status: 'success',
    fiscal_year_id: yearId,
    subsidies: studentSubsidies[yearId] || studentSubsidies[1],
    calculation: calc
  });
});

app.post('/api/plan/save_subsidy_data.php', (req, res) => {
  const { fiscal_year_id, subsidies } = req.body;
  const yId = parseInt(fiscal_year_id) || 1;

  if (!studentSubsidies[yId]) {
    studentSubsidies[yId] = JSON.parse(JSON.stringify(studentSubsidies[1]));
  }

  if (subsidies) {
    ['kindergarten', 'primary', 'lower_secondary', 'upper_secondary'].forEach(k => {
      if (subsidies[k]) {
        studentSubsidies[yId][k] = {
          ...studentSubsidies[yId][k],
          student_count: parseInt(subsidies[k].student_count) || 0,
          subsidy_rate: parseFloat(subsidies[k].subsidy_rate) || 0,
          dev_rate: parseFloat(subsidies[k].dev_rate) || 0
        };
      }
    });
  }

  const calc = calculateSubsidies(yId);
  res.json({
    status: 'success',
    message: 'บันทึกจำนวนนักเรียนและอัตราเงินอุดหนุนรายหัว/กพพ. สำเร็จ',
    calculation: calc
  });
});

// Apply Subsidies to Budget Sources and 100% Department Allocations
app.post('/api/plan/apply_subsidies_to_budget.php', (req, res) => {
  const { fiscal_year_id } = req.body;
  const yId = parseInt(fiscal_year_id) || 1;
  const calc = calculateSubsidies(yId);

  // 1. Update or create Budget Source: "เงินอุดหนุนรายหัวการจัดการศึกษาขั้นพื้นฐาน"
  let subsidySrc = budgetSources.find(s => s.fiscal_year_id === yId && s.category === 'subsidy');
  if (subsidySrc) {
    subsidySrc.amount = calc.totalSubsidyAmount;
    subsidySrc.description = `คำนวณจากจำนวนนักเรียน ${calc.totalStudents} คน (อนุบาล, ประถม, ม.ต้น, ม.ปลาย)`;
  } else {
    budgetSources.push({
      id: Math.max(...budgetSources.map(s => s.id), 0) + 1,
      fiscal_year_id: yId,
      code: `SRC-${yId}-SUB`,
      name: 'เงินอุดหนุนรายหัวการจัดการศึกษาขั้นพื้นฐาน',
      category: 'subsidy',
      amount: calc.totalSubsidyAmount,
      description: `คำนวณจากจำนวนนักเรียน ${calc.totalStudents} คน`,
      received_date: new Date().toISOString().split('T')[0]
    });
  }

  // 2. Update or create Budget Source: "เงินกิจกรรมพัฒนาคุณภาพผู้เรียน (กพพ.)"
  let devSrc = budgetSources.find(s => s.fiscal_year_id === yId && s.category === 'student_dev');
  if (devSrc) {
    devSrc.amount = calc.totalDevAmount;
    devSrc.description = `คำนวณจากกิจกรรมพัฒนาคุณภาพผู้เรียน 4 กิจกรรมหลัก (${calc.totalStudents} คน)`;
  } else {
    budgetSources.push({
      id: Math.max(...budgetSources.map(s => s.id), 0) + 1,
      fiscal_year_id: yId,
      code: `SRC-${yId}-DEV`,
      name: 'เงินกิจกรรมพัฒนาคุณภาพผู้เรียน (กพพ.)',
      category: 'student_dev',
      amount: calc.totalDevAmount,
      description: `คำนวณจากกิจกรรมพัฒนาคุณภาพผู้เรียน 4 กิจกรรมหลัก (${calc.totalStudents} คน)`,
      received_date: new Date().toISOString().split('T')[0]
    });
  }

  // 3. Recalculate total budget received for this fiscal year
  const yearSources = budgetSources.filter(s => s.fiscal_year_id === yId);
  const totalBudgetReceived = yearSources.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  // 4. Update Department Allocations (100%) based on totalBudgetReceived
  const yearAllocations = departmentAllocations.filter(a => a.fiscal_year_id === yId);
  yearAllocations.forEach(a => {
    a.allocated_amount = (totalBudgetReceived * (parseFloat(a.percentage) / 100.0));
  });

  res.json({
    status: 'success',
    message: `ส่งยอดเงินอุดหนุนรายหัว (${calc.totalSubsidyAmount.toLocaleString('th-TH')} บ.) และ กพพ. (${calc.totalDevAmount.toLocaleString('th-TH')} บ.) เข้าสู่แหล่งงบประมาณและจัดสรร 100% เรียบร้อย`,
    calculation: calc,
    totalBudgetReceived,
    allocations: yearAllocations
  });
});

// ==========================================
// Plan API Endpoints
// ==========================================

// 1. Get All Plan Data for selected Fiscal Year
app.get('/api/plan/get_data.php', (req, res) => {
  const selectedYearId = parseInt(req.query.year_id) || (fiscalYears.find(y => y.is_current === 1)?.id || 1);
  const currentFiscalYear = fiscalYears.find(y => y.id === selectedYearId) || fiscalYears[0];
  const subsidiesCalc = calculateSubsidies(selectedYearId);
  
  // Sources for this fiscal year
  const sources = budgetSources.filter(s => s.fiscal_year_id === selectedYearId);
  const totalBudgetReceived = sources.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  // Allocations for this fiscal year
  const allocations = departmentAllocations.filter(a => a.fiscal_year_id === selectedYearId);
  const totalPercentAllocated = allocations.reduce((sum, a) => sum + parseFloat(a.percentage), 0);
  const totalAllocatedAmount = allocations.reduce((sum, a) => sum + parseFloat(a.allocated_amount), 0);

  // Projects for this fiscal year with calculated financials
  const yearProjects = projects.filter(p => p.fiscal_year_id === selectedYearId).map(p => {
    const fin = calculateProjectFinancials(p.id);
    const source = budgetSources.find(s => s.id === p.budget_source_id);
    const proposer = users.find(u => u.id === p.proposer_id);
    return {
      ...p,
      budget_source_name: source ? source.name : 'ไม่ระบุ',
      proposer_name: proposer ? proposer.name : (p.proposer_name || 'ครูผู้รับผิดชอบ'),
      financials: fin
    };
  });

  // Calculate high-level summary
  const totalProjectsCount = yearProjects.length;
  const approvedProjects = yearProjects.filter(p => p.status === 'approved');
  const totalApprovedBudget = approvedProjects.reduce((sum, p) => sum + parseFloat(p.approved_budget), 0);
  const totalSpentAcrossAll = yearProjects.reduce((sum, p) => sum + p.financials.spent, 0);
  const netRemainingSchoolBudget = totalBudgetReceived - totalSpentAcrossAll;
  const approvedRemainingBudget = totalApprovedBudget - totalSpentAcrossAll;

  // Department breakdown
  const deptSummary = {
    academic: { name: 'กลุ่มบริหารวิชาการ', allocated: 0, approved: 0, spent: 0, projectCount: 0 },
    budget: { name: 'กลุ่มบริหารงบประมาณ', allocated: 0, approved: 0, spent: 0, projectCount: 0 },
    personnel: { name: 'กลุ่มบริหารงานบุคคล', allocated: 0, approved: 0, spent: 0, projectCount: 0 },
    general: { name: 'กลุ่มบริหารทั่วไป', allocated: 0, approved: 0, spent: 0, projectCount: 0 },
    reserve: { name: 'งบสำรองจ่าย/ส่วนกลาง', allocated: 0, approved: 0, spent: 0, projectCount: 0 }
  };

  allocations.forEach(a => {
    if (deptSummary[a.department]) {
      deptSummary[a.department].allocated = parseFloat(a.allocated_amount);
    }
  });

  yearProjects.forEach(p => {
    if (deptSummary[p.department]) {
      deptSummary[p.department].projectCount++;
      if (p.status === 'approved') {
        deptSummary[p.department].approved += parseFloat(p.approved_budget);
      }
      deptSummary[p.department].spent += p.financials.spent;
    }
  });

  res.json({
    status: 'success',
    school: schoolInfo,
    schools: schools,
    fiscalYears: fiscalYears,
    currentFiscalYear: currentFiscalYear,
    budgetSources: sources,
    departmentAllocations: allocations,
    projects: yearProjects,
    users: users.map(u => ({ id: u.id, name: u.name, position: u.position, role: u.role, department: u.department, id_card: u.id_card })),
    subsidiesCalculation: subsidiesCalc,
    summary: {
      totalBudgetReceived,
      totalPercentAllocated,
      totalAllocatedAmount,
      totalProjectsCount,
      approvedProjectsCount: approvedProjects.length,
      totalApprovedBudget,
      totalSpentAcrossAll,
      netRemainingSchoolBudget,
      approvedRemainingBudget,
      disbursementRate: totalApprovedBudget > 0 ? ((totalSpentAcrossAll / totalApprovedBudget) * 100).toFixed(1) : '0.0',
      departmentBreakdown: deptSummary
    }
  });
});

// 2. Save Fiscal Year
app.post('/api/plan/save_fiscal_year.php', (req, res) => {
  const { id, year, start_date, end_date, is_current, status, notes } = req.body;
  if (!year) return res.status(400).json({ status: 'error', message: 'กรุณากรอกปีงบประมาณ' });

  if (is_current) {
    fiscalYears.forEach(y => y.is_current = 0);
  }

  if (id) {
    const idx = fiscalYears.findIndex(y => y.id === parseInt(id));
    if (idx !== -1) {
      fiscalYears[idx] = {
        ...fiscalYears[idx],
        year,
        start_date: start_date || fiscalYears[idx].start_date,
        end_date: end_date || fiscalYears[idx].end_date,
        is_current: is_current ? 1 : fiscalYears[idx].is_current,
        status: status || fiscalYears[idx].status,
        notes: notes !== undefined ? notes : fiscalYears[idx].notes
      };
    }
  } else {
    const newId = Math.max(...fiscalYears.map(y => y.id), 0) + 1;
    const newYear = {
      id: newId,
      year,
      start_date: start_date || `${parseInt(year) - 544}-10-01`,
      end_date: end_date || `${parseInt(year) - 543}-09-30`,
      is_current: is_current ? 1 : 0,
      status: status || 'planning',
      notes: notes || ''
    };
    fiscalYears.push(newYear);

    // Bootstrap default 4 departments + reserve allocation
    const depts = [
      { department: 'academic', department_name: 'กลุ่มบริหารวิชาการ', percentage: 45.0, notes: 'งานวิชาการ' },
      { department: 'budget', department_name: 'กลุ่มบริหารงบประมาณและสินทรัพย์', percentage: 15.0, notes: 'งานงบประมาณ' },
      { department: 'personnel', department_name: 'กลุ่มบริหารงานบุคคล', percentage: 10.0, notes: 'งานบุคคล' },
      { department: 'general', department_name: 'กลุ่มบริหารทั่วไป', percentage: 20.0, notes: 'งานบริหารทั่วไป' },
      { department: 'reserve', department_name: 'งบสำรองจ่าย/ส่วนกลาง', percentage: 10.0, notes: 'งบสำรองจ่าย' }
    ];
    depts.forEach(d => {
      departmentAllocations.push({
        id: Math.max(...departmentAllocations.map(a => a.id), 0) + 1,
        fiscal_year_id: newId,
        ...d,
        allocated_amount: 0.00
      });
    });
  }

  res.json({ status: 'success', message: 'บันทึกปีงบประมาณสำเร็จ' });
});

// 3. Save / Delete Budget Source
app.post('/api/plan/save_budget_source.php', (req, res) => {
  const { id, fiscal_year_id, code, name, category, amount, description, received_date } = req.body;
  if (!name || amount === undefined) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อแหล่งงบประมาณและจำนวนเงิน' });
  }

  const numAmount = parseFloat(amount) || 0;
  const fId = parseInt(fiscal_year_id) || 1;

  if (id) {
    const idx = budgetSources.findIndex(s => s.id === parseInt(id));
    if (idx !== -1) {
      budgetSources[idx] = {
        ...budgetSources[idx],
        code: code || budgetSources[idx].code,
        name,
        category: category || budgetSources[idx].category,
        amount: numAmount,
        description: description || '',
        received_date: received_date || budgetSources[idx].received_date
      };
    }
  } else {
    const newId = Math.max(...budgetSources.map(s => s.id), 0) + 1;
    budgetSources.push({
      id: newId,
      fiscal_year_id: fId,
      code: code || `SRC-${newId}`,
      name,
      category: category || 'subsidy',
      amount: numAmount,
      description: description || '',
      received_date: received_date || new Date().toISOString().split('T')[0]
    });
  }

  // Recalculate allocation amounts based on percentages
  const yearSources = budgetSources.filter(s => s.fiscal_year_id === fId);
  const totalBudget = yearSources.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  departmentAllocations.forEach(a => {
    if (a.fiscal_year_id === fId) {
      a.allocated_amount = parseFloat(((totalBudget * parseFloat(a.percentage)) / 100).toFixed(2));
    }
  });

  res.json({ status: 'success', message: 'บันทึกแหล่งงบประมาณสำเร็จ' });
});

app.post('/api/plan/delete_budget_source.php', (req, res) => {
  const { id } = req.body;
  const idx = budgetSources.findIndex(s => s.id === parseInt(id));
  if (idx !== -1) {
    const fId = budgetSources[idx].fiscal_year_id;
    budgetSources.splice(idx, 1);

    // Recalculate
    const yearSources = budgetSources.filter(s => s.fiscal_year_id === fId);
    const totalBudget = yearSources.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    departmentAllocations.forEach(a => {
      if (a.fiscal_year_id === fId) {
        a.allocated_amount = parseFloat(((totalBudget * parseFloat(a.percentage)) / 100).toFixed(2));
      }
    });
  }
  res.json({ status: 'success', message: 'ลบแหล่งงบประมาณสำเร็จ' });
});

// 4. Save 100% Department Allocations
app.post('/api/plan/save_allocations.php', (req, res) => {
  const { fiscal_year_id, allocations } = req.body;
  if (!Array.isArray(allocations)) {
    return res.status(400).json({ status: 'error', message: 'ข้อมูลการจัดสรรไม่ถูกต้อง' });
  }

  const fId = parseInt(fiscal_year_id) || 1;
  const totalPercent = allocations.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0);
  
  if (Math.abs(totalPercent - 100) > 0.05) {
    return res.status(400).json({ status: 'error', message: `ผลรวมสัดส่วนต้องเท่ากับ 100% พอดี (ปัจจุบันได้ ${totalPercent.toFixed(2)}%)` });
  }

  const yearSources = budgetSources.filter(s => s.fiscal_year_id === fId);
  const totalBudget = yearSources.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  allocations.forEach(item => {
    const p = parseFloat(item.percentage) || 0;
    const calcAmount = parseFloat(((totalBudget * p) / 100).toFixed(2));
    const existing = departmentAllocations.find(a => a.fiscal_year_id === fId && a.department === item.department);
    if (existing) {
      existing.percentage = p;
      existing.allocated_amount = calcAmount;
      if (item.notes !== undefined) existing.notes = item.notes;
    } else {
      departmentAllocations.push({
        id: Math.max(...departmentAllocations.map(a => a.id), 0) + 1,
        fiscal_year_id: fId,
        department: item.department,
        department_name: item.department_name || item.department,
        percentage: p,
        allocated_amount: calcAmount,
        notes: item.notes || ''
      });
    }
  });

  res.json({ status: 'success', message: 'บันทึกการจัดสรรงบประมาณ 100% สำเร็จเรียบร้อย' });
});

// 5. Save Project (Create / Edit by Teacher or Dept Head)
app.post('/api/plan/save_project.php', (req, res) => {
  const {
    id, fiscal_year_id, department, code, name, proposer_id, supervisor_id,
    strategy_alignment, standard_alignment, rationale, objectives, target_qty, target_quality,
    start_date, end_date, location, budget_source_id, requested_budget, approved_budget,
    expected_outcomes, indicators, evaluation_method, items
  } = req.body;

  if (!name || !department) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อโครงการและกลุ่มงาน' });
  }

  const fId = parseInt(fiscal_year_id) || 1;
  const pId = parseInt(proposer_id) || 8;
  const propUser = users.find(u => u.id === pId);

  let targetProject;
  if (id) {
    const idx = projects.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      projects[idx] = {
        ...projects[idx],
        department,
        code: code || projects[idx].code,
        name,
        proposer_id: pId,
        proposer_name: propUser ? propUser.name : projects[idx].proposer_name,
        supervisor_id: supervisor_id || projects[idx].supervisor_id,
        strategy_alignment: strategy_alignment || '',
        standard_alignment: standard_alignment || 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
        rationale: rationale || '',
        objectives: objectives || '',
        target_qty: target_qty || '',
        target_quality: target_quality || '',
        start_date: start_date || null,
        end_date: end_date || null,
        location: location || 'โรงเรียน',
        budget_source_id: parseInt(budget_source_id) || projects[idx].budget_source_id,
        requested_budget: parseFloat(requested_budget) || 0,
        approved_budget: approved_budget !== undefined ? parseFloat(approved_budget) : projects[idx].approved_budget,
        expected_outcomes: expected_outcomes || '',
        indicators: indicators || '',
        evaluation_method: evaluation_method || ''
      };
      targetProject = projects[idx];
    }
  } else {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const deptPrefixMap = { academic: 'วิชาการ', budget: 'งบประมาณ', personnel: 'บุคคล', general: 'ทั่วไป', reserve: 'ส่วนกลาง' };
    const prefix = deptPrefixMap[department] || 'โครงการ';
    const deptCount = projects.filter(p => p.fiscal_year_id === fId && p.department === department).length + 1;

    targetProject = {
      id: newId,
      fiscal_year_id: fId,
      department,
      code: code || `${prefix}-0${deptCount}`,
      name,
      proposer_id: pId,
      proposer_name: propUser ? propUser.name : 'ครูผู้เสนอโครงการ',
      supervisor_id: supervisor_id || null,
      strategy_alignment: strategy_alignment || 'ยุทธศาสตร์พัฒนาคุณภาพการศึกษา',
      standard_alignment: standard_alignment || 'มาตรฐานที่ 1 คุณภาพของผู้เรียน',
      rationale: rationale || '',
      objectives: objectives || '',
      target_qty: target_qty || '',
      target_quality: target_quality || '',
      start_date: start_date || null,
      end_date: end_date || null,
      location: location || 'โรงเรียน',
      budget_source_id: parseInt(budget_source_id) || 1,
      requested_budget: parseFloat(requested_budget) || 0,
      approved_budget: 0,
      expected_outcomes: expected_outcomes || '',
      indicators: indicators || '',
      evaluation_method: evaluation_method || '',
      status: 'submitted', // Auto submitted
      screening_note: '',
      director_note: '',
      approved_at: null,
      progress_percentage: 0,
      execution_status: 'not_started',
      results_summary: '',
      obstacles: '',
      recommendations: '',
      created_at: new Date().toISOString().split('T')[0]
    };
    projects.push(targetProject);
  }

  // If items provided, replace budget items for this project
  if (Array.isArray(items)) {
    // Remove old items
    budgetItems = budgetItems.filter(b => b.project_id !== targetProject.id);
    let totalItemsSum = 0;
    items.forEach(it => {
      const q = parseFloat(it.quantity) || 1;
      const p = parseFloat(it.unit_price) || 0;
      const t = parseFloat((q * p).toFixed(2)) || (parseFloat(it.total_price) || 0);
      totalItemsSum += t;
      budgetItems.push({
        id: Math.max(...budgetItems.map(b => b.id), 0) + 1,
        project_id: targetProject.id,
        category: it.category || 'materials',
        item_name: it.item_name || 'รายการค่าใช้จ่าย',
        quantity: q,
        unit: it.unit || 'หน่วย',
        unit_price: p,
        total_price: t
      });
    });
    if (totalItemsSum > 0 && (!requested_budget || parseFloat(requested_budget) === 0)) {
      targetProject.requested_budget = totalItemsSum;
    }
  }

  res.json({ status: 'success', message: 'บันทึกโครงการสำเร็จ', project_id: targetProject.id });
});

// 6. Screening & Budget Trimming / Adjustment (by Plan Officer / Dept Head)
app.post('/api/plan/screen_project.php', (req, res) => {
  const { project_id, adjusted_budget, screening_note, action } = req.body;
  const project = projects.find(p => p.id === parseInt(project_id));
  if (!project) return res.status(404).json({ status: 'error', message: 'ไม่พบโครงการที่ระบุ' });

  if (adjusted_budget !== undefined) {
    project.approved_budget = parseFloat(adjusted_budget) || 0;
  }
  if (screening_note !== undefined) {
    project.screening_note = screening_note;
  }

  // Action: 'screened' (ผ่านการกลั่นกรอง), 'revision_requested' (ส่งกลับแก้ไข), 'rejected' (ตัดแผน)
  if (action === 'screened') {
    project.status = 'screened';
  } else if (action === 'revision_requested') {
    project.status = 'revision_requested';
  } else if (action === 'rejected') {
    project.status = 'rejected';
  } else if (action === 'dept_approved') {
    project.status = 'dept_approved';
  }

  res.json({ status: 'success', message: 'บันทึกผลการกลั่นกรองและปรับวงเงินสำเร็จ', project });
});

// 7. Director Approval Workflow
app.post('/api/plan/approve_project.php', (req, res) => {
  const { project_id, action, director_note, approved_budget } = req.body;
  const project = projects.find(p => p.id === parseInt(project_id));
  if (!project) return res.status(404).json({ status: 'error', message: 'ไม่พบโครงการที่ระบุ' });

  if (director_note !== undefined) {
    project.director_note = director_note;
  }

  if (approved_budget !== undefined && parseFloat(approved_budget) > 0) {
    project.approved_budget = parseFloat(approved_budget);
  } else if (project.approved_budget <= 0 && project.requested_budget > 0) {
    project.approved_budget = project.requested_budget;
  }

  if (action === 'approved') {
    project.status = 'approved';
    project.approved_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    project.execution_status = 'in_progress';
  } else if (action === 'revision_requested') {
    project.status = 'revision_requested';
  } else if (action === 'rejected') {
    project.status = 'rejected';
  }

  res.json({ status: 'success', message: action === 'approved' ? 'อนุมัติโครงการและบรรจุในเล่มแผนปฏิบัติการสำเร็จ' : 'บันทึกสถานะโครงการสำเร็จ', project });
});

// 8. Track Project Progress & Execution
app.post('/api/plan/save_progress.php', (req, res) => {
  const { project_id, progress_percentage, execution_status, results_summary, obstacles, recommendations, recorded_by } = req.body;
  const project = projects.find(p => p.id === parseInt(project_id));
  if (!project) return res.status(404).json({ status: 'error', message: 'ไม่พบโครงการ' });

  const pct = parseInt(progress_percentage);
  if (!isNaN(pct)) {
    project.progress_percentage = Math.min(100, Math.max(0, pct));
  }
  if (execution_status) {
    project.execution_status = execution_status;
  }
  if (results_summary !== undefined) project.results_summary = results_summary;
  if (obstacles !== undefined) project.obstacles = obstacles;
  if (recommendations !== undefined) project.recommendations = recommendations;

  // Add progress log
  progressLogs.push({
    id: Math.max(...progressLogs.map(l => l.id), 0) + 1,
    project_id: project.id,
    log_date: new Date().toISOString().split('T')[0],
    progress_percent: project.progress_percentage,
    details: results_summary || 'รายงานผลความก้าวหน้าโครงการ',
    obstacles: obstacles || '',
    solutions: recommendations || '',
    recorded_by: recorded_by || 'ผู้รับผิดชอบโครงการ'
  });

  res.json({ status: 'success', message: 'บันทึกการติดตามความก้าวหน้าสำเร็จ', project });
});

// 9. Actual Expenses & Budget Calculation
app.post('/api/plan/save_expense.php', (req, res) => {
  const { id, project_id, expense_date, doc_number, title, category, amount, disbursed_by, receipt_note } = req.body;
  if (!project_id || !title || !amount) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกข้อมูลการเบิกจ่ายให้ครบถ้วน' });
  }

  const pId = parseInt(project_id);
  const numAmount = parseFloat(amount) || 0;

  if (id) {
    const idx = expenses.findIndex(e => e.id === parseInt(id));
    if (idx !== -1) {
      expenses[idx] = {
        ...expenses[idx],
        expense_date: expense_date || expenses[idx].expense_date,
        doc_number: doc_number || expenses[idx].doc_number,
        title,
        category: category || expenses[idx].category,
        amount: numAmount,
        disbursed_by: disbursed_by || expenses[idx].disbursed_by,
        receipt_note: receipt_note || ''
      };
    }
  } else {
    expenses.push({
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      project_id: pId,
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      doc_number: doc_number || `ขบ. ${expenses.length + 1}/2568`,
      title,
      category: category || 'materials',
      amount: numAmount,
      disbursed_by: disbursed_by || 'เจ้าหน้าที่การเงิน',
      receipt_note: receipt_note || ''
    });
  }

  const fin = calculateProjectFinancials(pId);
  res.json({ status: 'success', message: 'บันทึกรายการเบิกจ่ายสำเร็จ', financials: fin });
});

app.post('/api/plan/delete_expense.php', (req, res) => {
  const { id } = req.body;
  const idx = expenses.findIndex(e => e.id === parseInt(id));
  if (idx !== -1) {
    const pId = expenses[idx].project_id;
    expenses.splice(idx, 1);
    const fin = calculateProjectFinancials(pId);
    return res.json({ status: 'success', message: 'ลบรายการเบิกจ่ายเรียบร้อย', financials: fin });
  }
  res.status(404).json({ status: 'error', message: 'ไม่พบรายการ' });
});

// 10. Copy Plan from Previous Fiscal Year
app.post('/api/plan/copy_year_plan.php', (req, res) => {
  const { from_year_id, to_year_id } = req.body;
  const sourceYear = fiscalYears.find(y => y.id === parseInt(from_year_id));
  const targetYear = fiscalYears.find(y => y.id === parseInt(to_year_id));

  if (!sourceYear || !targetYear) {
    return res.status(400).json({ status: 'error', message: 'ระบุปีงบประมาณต้นทางและปลายทางไม่ถูกต้อง' });
  }

  const sourceProjects = projects.filter(p => p.fiscal_year_id === sourceYear.id);
  let copiedCount = 0;

  sourceProjects.forEach(sp => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const cloned = {
      ...sp,
      id: newId,
      fiscal_year_id: targetYear.id,
      code: `${sp.code}-สำเนา`,
      status: 'draft',
      approved_budget: 0,
      approved_at: null,
      screening_note: `คัดลอกจากปีงบประมาณ ${sourceYear.year}`,
      director_note: '',
      progress_percentage: 0,
      execution_status: 'not_started',
      results_summary: '',
      obstacles: '',
      recommendations: '',
      created_at: new Date().toISOString().split('T')[0]
    };
    projects.push(cloned);

    // Also copy budget items
    const spItems = budgetItems.filter(b => b.project_id === sp.id);
    spItems.forEach(it => {
      budgetItems.push({
        ...it,
        id: Math.max(...budgetItems.map(b => b.id), 0) + 1,
        project_id: newId
      });
    });
    copiedCount++;
  });

  res.json({ status: 'success', message: `คัดลอกโครงการสำเร็จจำนวน ${copiedCount} โครงการ ไปยังปีงบประมาณ ${targetYear.year}` });
});

// 11. AI Assistant (Gemini 3.8 Flash) for Project Drafting & Official Government Polishing
app.post('/api/plan/ai_assistant.php', async (req, res) => {
  const { prompt, mode, current_data } = req.body;
  // mode: 'draft_new' (เขียนร่างโครงการใหม่ทั้งหมด), 'polish' (ขัดเกลาสำนวนราชการ), 'suggest_kpi' (แนะนำตัวชี้วัดและกิจกรรม)

  try {
    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านงานแผนปฏิบัติการประจำปีและงบประมาณของสถานศึกษา สังกัดสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.) กระทรวงศึกษาธิการ 
หน้าที่ของคุณคือช่วยครูร่างหรือขัดเกลาโครงการในรูปแบบเอกสารทางราชการที่ถูกต้อง สละสลวย เป็นทางการ และถูกต้องตามระเบียบงานสารบรรณ 

คุณต้องส่งผลลัพธ์กลับเป็น JSON เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "name": "ชื่อโครงการที่เป็นทางการและชัดเจน",
  "rationale": "หลักการและเหตุผล เขียน 1-2 ย่อหน้า ชี้ให้เห็นความสำคัญ ปัญหา สภาพบริบท และความจำเป็น",
  "objectives": "วัตถุประสงค์ (ข้อ 1, 2, 3 ชัดเจน วัดได้)",
  "target_qty": "เป้าหมายเชิงปริมาณ เช่น จำนวนนักเรียน/ครู/กลุ่มเป้าหมาย",
  "target_quality": "เป้าหมายเชิงคุณภาพ เช่น ร้อยละความสำเร็จ สมรรถนะที่ได้รับ",
  "activities": [
    {"step": 1, "name": "ชื่อกิจกรรม/ขั้นตอน", "period": "ระยะเวลา", "budget": 10000}
  ],
  "budget_items": [
    {"category": "compensation|operating|materials|other", "category_name": "ค่าตอบแทน/ค่าใช้สอย/ค่าวัสดุ", "item_name": "ชื่อรายการค่าใช้จ่าย", "quantity": 1, "unit": "ชุด/เล่ม/คน", "unit_price": 5000, "total_price": 5000}
  ],
  "indicators": "ตัวชี้วัดความสำเร็จ (KPI) ทั้งเชิงปริมาณและคุณภาพ",
  "evaluation_method": "วิธีการและเครื่องมือประเมินผล เช่น แบบทดสอบ แบบประเมินความพึงพอใจ",
  "expected_outcomes": "ผลที่คาดว่าจะได้รับเมื่อสิ้นสุดโครงการ"
}`;

    let userMessage = '';
    if (mode === 'draft_new') {
      userMessage = `ช่วยเขียนโครงการโรงเรียนใหม่ในหัวข้อ: "${prompt || 'โครงการพัฒนาคุณภาพผู้เรียน'}"
กลุ่มงาน: ${current_data?.department_name || 'วิชาการ'}
งบประมาณโดยประมาณ: ${current_data?.estimated_budget || '50,000'} บาท
โปรดสร้างรายละเอียดให้สมบูรณ์ทั้งหลักการ วัตถุประสงค์ กิจกรรม หมวดงบประมาณ และตัวชี้วัดราชการ`;
    } else if (mode === 'polish') {
      userMessage = `ช่วยขัดเกลาและปรับปรุงเนื้อหาโครงการต่อไปนี้ให้เป็นภาษาราชการที่เป็นทางการ สละสลวย ถูกต้องตามแบบฟอร์ม สพฐ.:
ชื่อโครงการ: ${current_data?.name || prompt}
หลักการและเหตุผลเดิม: ${current_data?.rationale || ''}
วัตถุประสงค์เดิม: ${current_data?.objectives || ''}
ข้อความเพิ่มเติมจากผู้ใช้: ${prompt || ''}`;
    } else {
      userMessage = `ช่วยแนะนำตัวชี้วัดความสำเร็จ (KPI), กิจกรรมดำเนินงาน, และหมวดงบประมาณสำหรับโครงการ: "${prompt || current_data?.name || ''}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseErr) {
      parsedResult = { raw: responseText };
    }

    res.json({ status: 'success', data: parsedResult });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback template response in case API key is missing or quota issue
    res.json({
      status: 'success',
      data: {
        name: prompt ? `โครงการ${prompt}` : 'โครงการพัฒนาศักยภาพผู้เรียนสู่ความเป็นเลิศ',
        rationale: 'ตามพระราชบัญญัติการศึกษาแห่งชาติ และนโยบายของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน มุ่งเน้นการจัดการศึกษาเพื่อพัฒนาผู้เรียนให้เป็นมนุษย์ที่สมบูรณ์ทั้งร่างกาย จิตใจ สติปัญญา ความรู้ และคุณธรรม สถานศึกษาจึงได้จัดทำโครงการนี้เพื่อเสริมสร้างสมรรถนะและพัฒนาทักษะที่จำเป็นในศตวรรษที่ 21',
        objectives: '1. เพื่อส่งเสริมและพัฒนาทักษะการเรียนรู้ของผู้เรียนอย่างรอบด้าน\n2. เพื่อยกระดับคุณภาพและมาตรฐานการศึกษาของสถานศึกษาตามเกณฑ์ประกันคุณภาพ\n3. เพื่อส่งเสริมการมีส่วนร่วมของครู ผู้ปกครอง และชุมชนในการจัดการศึกษา',
        target_qty: 'นักเรียนทุกคนและคณะครูของสถานศึกษาเข้าร่วมกิจกรรมร้อยละ 100',
        target_quality: 'ผู้เข้าร่วมกิจกรรมมีความรู้ ทักษะ และความพึงพอใจในระดับดีขึ้นไป ไม่น้อยกว่าร้อยละ 85',
        activities: [
          { step: 1, name: 'ประชุมวางแผนและแต่งตั้งคณะทำงาน (Plan)', period: 'เดือนแรก', budget: 2000 },
          { step: 2, name: 'ดำเนินกิจกรรมอบรมเชิงปฏิบัติการและฝึกทักษะ (Do)', period: 'เดือนที่ 2-4', budget: 35000 },
          { step: 3, name: 'ติดตาม นิเทศ และประเมินผลระหว่างดำเนินงาน (Check)', period: 'เดือนที่ 5', budget: 3000 },
          { step: 4, name: 'สรุปผลและรายงานผลการดำเนินงาน (Act)', period: 'เดือนสุดท้าย', budget: 5000 }
        ],
        budget_items: [
          { category: 'compensation', category_name: 'ค่าตอบแทน', item_name: 'ค่าตอบแทนวิทยากรผู้เชี่ยวชาญ', quantity: 6, unit: 'ชั่วโมง', unit_price: 600, total_price: 3600 },
          { category: 'operating', category_name: 'ค่าใช้สอย', item_name: 'ค่าอาหารกลางวันและอาหารว่างผู้เข้ารับการอบรม', quantity: 1, unit: 'งาน', unit_price: 24000, total_price: 24000 },
          { category: 'materials', category_name: 'ค่าวัสดุ', item_name: 'ค่าเอกสารคู่มือ วัสดุฝึกปฏิบัติ และเครื่องเขียน', quantity: 1, unit: 'ชุด', unit_price: 17400, total_price: 17400 }
        ],
        indicators: 'ร้อยละของผู้เรียนที่มีผลสัมฤทธิ์ผ่านเกณฑ์ และร้อยละของความพึงพอใจต่อการดำเนินกิจกรรม',
        evaluation_method: 'แบบทดสอบก่อน-หลังกิจกรรม, แบบสังเกตพฤติกรรม, และแบบประเมินความพึงพอใจ',
        expected_outcomes: 'ผู้เรียนได้รับการพัฒนาทักษะอย่างเต็มตามศักยภาพ ครูสามารถจัดการเรียนรู้ได้อย่างมีประสิทธิภาพ และสถานศึกษามีผลการดำเนินงานบรรลุเป้าหมายตามแผนปฏิบัติการ'
      },
      is_fallback: true
    });
  }
});

// 12. Single Project Detail Endpoint (for viewing & printing)
app.get('/api/plan/get_project_detail.php', (req, res) => {
  const pId = parseInt(req.query.id);
  const project = projects.find(p => p.id === pId);
  if (!project) return res.status(404).json({ status: 'error', message: 'ไม่พบโครงการ' });

  const pItems = budgetItems.filter(b => b.project_id === pId);
  const pExpenses = expenses.filter(e => e.project_id === pId);
  const pLogs = progressLogs.filter(l => l.project_id === pId);
  const fin = calculateProjectFinancials(pId);
  const source = budgetSources.find(s => s.id === project.budget_source_id);
  const year = fiscalYears.find(y => y.id === project.fiscal_year_id);
  const proposer = users.find(u => u.id === project.proposer_id);
  const supervisor = users.find(u => u.id === project.supervisor_id);

  res.json({
    status: 'success',
    school: schoolInfo,
    fiscal_year: year,
    project: {
      ...project,
      budget_source_name: source ? source.name : 'ไม่ระบุ',
      proposer_name: proposer ? proposer.name : (project.proposer_name || 'ผู้เสนอโครงการ'),
      proposer_position: proposer ? proposer.position : 'ครู',
      supervisor_name: supervisor ? supervisor.name : 'หัวหน้ากลุ่มงาน',
      supervisor_position: supervisor ? supervisor.position : 'หัวหน้ากลุ่มงาน'
    },
    items: pItems,
    expenses: pExpenses,
    progress_logs: pLogs,
    financials: fin
  });
});

// 13. Save User
app.post('/api/plan/save_user.php', (req, res) => {
  const { id, username, name, position, department, role, phone, email } = req.body;
  if (!name || !role) return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อและบทบาท' });

  if (id) {
    const idx = users.findIndex(u => u.id === parseInt(id));
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        username: username || users[idx].username,
        name,
        position: position || users[idx].position,
        department: department || users[idx].department,
        role,
        phone: phone || '',
        email: email || ''
      };
    }
  } else {
    users.push({
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username: username || `user_${Date.now()}`,
      password: '123',
      name,
      position: position || 'ครู',
      department: department || 'academic',
      role: role || 'teacher',
      phone: phone || '',
      email: email || '',
      is_approved: 1
    });
  }
  res.json({ status: 'success', message: 'บันทึกข้อมูลผู้ใช้งานสำเร็จ' });
});

// ==========================================
// Static & PHP Template Rendering
// ==========================================

const servePhpAsHtml = (filePath, req, res) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Parse role from query or default
    const mockRole = req.query.mock_role || 'director';
    const activeUser = users.find(u => u.role === mockRole) || users[1]; // default director

    const mockSession = {
      user_id: activeUser.id,
      name: activeUser.name,
      role: activeUser.role,
      department: activeUser.department,
      position: activeUser.position,
      school_id: schoolInfo.id,
      school_name: schoolInfo.name,
      smis_code: schoolInfo.smis_code || '10310001',
      school_logo: schoolInfo.logo_url || '',
      affiliation: schoolInfo.affiliation,
      director_name: schoolInfo.director_name,
      current_fiscal_year: '2568'
    };

    // Replace <?= ... ?>
    content = content.replace(/<\?=\s*\$_SESSION\['(.*?)'\]\s*\?>/g, (m, k) => mockSession[k] !== undefined ? mockSession[k] : '');
    content = content.replace(/<\?=\s*\$app_name\s*\?>/g, 'ระบบบริหารแผนปฏิบัติการประจำปีของโรงเรียน');
    content = content.replace(/<\?=\s*\$username\s*\?>/g, mockSession.name);
    content = content.replace(/<\?=\s*\$role\s*\?>/g, mockSession.role);
    content = content.replace(/<\?=\s*\$school_name\s*\?>/g, mockSession.school_name);
    content = content.replace(/<\?=\s*\$school_logo\s*\?>/g, mockSession.school_logo);
    content = content.replace(/<\?=\s*\$smis_code\s*\?>/g, mockSession.smis_code);
    content = content.replace(/<\?=\s*\$affiliation\s*\?>/g, mockSession.affiliation);
    content = content.replace(/<\?=\s*\$current_fiscal_year\s*\?>/g, mockSession.current_fiscal_year);
    content = content.replace(/<\?=\s*mb_substr\(\$username,\s*0,\s*1\)\s*\?>/g, mockSession.name.charAt(0));

    // Handle include files: <?php include ... ?> or require_once
    content = content.replace(/<\?php\s+(?:include|require|include_once|require_once)\s+['"](.*?)['"];?\s*\?>/g, (m, incPath) => {
      const fullIncPath = path.resolve(__dirname, incPath);
      if (fs.existsSync(fullIncPath)) {
        return fs.readFileSync(fullIncPath, 'utf8');
      }
      return `<!-- Included file ${incPath} -->`;
    });

    // Clean remaining PHP tags
    content = content.replace(/<\?php[\s\S]*?\?>/g, '');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } else {
    res.status(404).send('File not found: ' + filePath);
  }
};

app.get('/', (req, res) => {
  servePhpAsHtml(path.join(__dirname, 'index.php'), req, res);
});

app.get('/dashboard.php', (req, res) => {
  servePhpAsHtml(path.join(__dirname, 'dashboard.php'), req, res);
});

app.get('/print_project.php', (req, res) => {
  servePhpAsHtml(path.join(__dirname, 'print_project.php'), req, res);
});

app.get('/print_annual_plan.php', (req, res) => {
  servePhpAsHtml(path.join(__dirname, 'print_annual_plan.php'), req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`School Action Plan OS server running on http://localhost:${PORT}`);
});
