/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Complaint, NewsArticle, DistrictName, ComplaintCategory } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ensure we have a data directory for the JSON database
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'complaints.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate stylized SVG placeholders for default seed complaints
function makeSvgPlaceholder(title: string, color: string): string {
  const encTitle = encodeURIComponent(title);
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="${color}"/><circle cx="300" cy="180" r="60" fill="%23ffffff" opacity="0.15"/><path d="M280 200 L300 160 L320 200 Z" stroke="%23ffffff" stroke-width="4" fill="none"/><rect x="296" y="210" width="8" height="20" fill="%23ffffff"/><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="%23ffffff">${encTitle}</text><text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ffffff" opacity="0.8">Yala Clean City - Citizen Report</text></svg>`;
}

// Seeding initial realistic Yala environment complaints if DB doesn't exist
const initialComplaints: Complaint[] = [
  {
    id: 'comp-101',
    title: 'ขยะส่งกลิ่นเหม็นที่ตลาดนัดสวนขวัญ',
    category: 'ขยะล้นถัง',
    description: 'มีขยะเปียกและขยะเศษอาหารเหลือทิ้งจากการค้าขายล้นออกจากถัง ขยะเน่าเสียส่งกลิ่นอบอวลทั่วพื้นที่บริเวณรอบตลาดนัดเทศบาลนครยะลา (สวนขวัญ) ทำให้ประชาชนและนักเรียนเดินผ่านไปมาเดือดร้อนมาก',
    district: 'เมืองยะลา',
    detailLocation: 'บริเวณริมรั้วลานจอดรถ ตลาดนัดสวนขวัญ ต.สะเตง อ.เมืองยะลา',
    reporterName: 'อามินะห์ ดาโอะ',
    reporterPhone: '081-234-5678',
    lat: 6.5412,
    lng: 101.2805,
    status: 'resolved',
    imageUrl: makeSvgPlaceholder('เฝ้าระวัง: ตลาดนัดสวนขวัญ', '%23059669'), // Emerald Green
    adminComment: 'เจ้าหน้าที่สำนักสุขาภิบาลเทศบาลนครยะลา ดำเนินการเก็บกวาดขยะ ล้างทำความสะอาดพื้นผิวถนน และเพิ่มถังขยะเปียกแยกประเภทเรียบร้อยแล้วเมื่อวันที่ 30 พฤษภาคม 2569',
    createdAt: '2026-05-28T08:30:00Z',
    updatedAt: '2026-05-30T14:15:00Z',
    history: [
      { status: 'pending', timestamp: '2026-05-28T08:30:00Z', note: 'รับแจ้งเรื่องจากประชาชนผ่านระบบออนไลน์ ' },
      { status: 'processing', timestamp: '2026-05-29T10:00:00Z', note: 'ประสานงานกองสาธารณสุขและสิ่งแวดล้อม เทศบาลนครยะลา ส่งรถขยะและทีมฉีดล้างลานจอดรถ' },
      { status: 'resolved', timestamp: '2026-05-30T14:15:00Z', note: 'เก็บขยะและปรับปรุงจุดทิ้งถังขยะเรียบร้อย' }
    ]
  },
  {
    id: 'comp-102',
    title: 'ลักลอบทิ้งเศษวัสดุก่อสร้างทางขึ้นเขาเบตง',
    category: 'จุดทิ้งขยะผิดกฎหมาย',
    description: 'พบเศษอิฐ ปูน ยางรถยนต์เก่า และโซฟาชำรุด ถูกนำมาลักลอบกองทิ้งไว้ในเขตป่าริมทางขึ้นจุดชมวิวอุโมงค์เบตงมงคลฤทธิ์ เป็นจุดอับสายตา บดบังทัศนียภาพอันสวยงามของเมืองท่องเที่ยวเบตง',
    district: 'เบตง',
    detailLocation: 'ริมถนนสุขยางค์ ห่างจากปากอุโมงค์เบตงมงคลฤทธิ์ประมาณ 500 เมตร ต.เบตง อ.เบตง',
    reporterName: 'นายศักดิ์ดา รัตนวิจิตร',
    reporterPhone: '089-765-4321',
    lat: 5.7725,
    lng: 101.0253,
    status: 'processing',
    imageUrl: makeSvgPlaceholder('ลักลอบทิ้งขยะ: ทางขึ้นเขาเบตง', '%230284c7'), // Sky Blue
    adminComment: 'เจ้าหน้าที่เทศบาลเมืองเบตง เข้าตรวจสอบพื้นที่แล้ว พบตัวแทนผู้รับเหมาลักลอบทิ้ง ขณะนี้กำลังดำเนินการปรับตามกฎหมายเทศบัญญัติ และอยู่ในขั้นตอนขนย้ายเศษวัสดุกลับออกไป',
    createdAt: '2026-05-31T10:15:00Z',
    updatedAt: '2026-06-01T09:30:00Z',
    history: [
      { status: 'pending', timestamp: '2026-05-31T10:15:00Z', note: 'รับแจ้งเบาะแสพร้อมภาพถ่ายเลขทะเบียนรถกระบะขนขยะก่อสร้าง' },
      { status: 'processing', timestamp: '2026-06-01T09:30:00Z', note: 'เจ้าหน้าที่เทศกิจตรวจสอบและเข้าตักเตือนผู้เกี่ยวข้อง ออกหนังสือพ้นพิกัดปรับปรุงภูมิทัศน์' }
    ]
  },
  {
    id: 'comp-103',
    title: 'ขยะตกค้างในชุมชนบ้านบันนังสตา ค้างนานกว่าหนึ่งสัปดาห์',
    category: 'ขยะตกค้าง',
    description: 'ถังขยะในซอยหลังโรงเรียนบันนังสตาไม่มีรถขยะเข้ามาจัดเก็บเลยเป็นเวลากว่าหนึ่งอาทิตย์ มีฝูงสุนัขมาคุ้ยเขี่ยจนถุงขยะฉีกขาดและกระจายทั่วซอย ขอความกรุณาส่งรถเข้าจัดเก็บด่วน',
    district: 'บันนังสตา',
    detailLocation: 'ซอยร่วมใจอุทิศ 2 ข้างมัสยิดบ้านบันนังสตา อ.บันนังสตา',
    reporterName: 'อับดุลเลาะห์ มะยูโซ๊ะ',
    reporterPhone: '085-555-4499',
    lat: 6.2654,
    lng: 101.2641,
    status: 'pending',
    imageUrl: makeSvgPlaceholder('ขยะหมักหมม: ชุมชนบันนังสตา', '%23e11d48'), // Rose Red
    createdAt: '2026-06-02T12:00:00Z',
    updatedAt: '2026-06-02T12:00:00Z',
    history: [
      { status: 'pending', timestamp: '2026-06-02T12:00:00Z', note: 'ลงทะเบียนคำร้องเรียนระบุประเภทขยะตกค้างสะสม รอจัดรอบรถขยะเก็บตกเพิ่มเติม' }
    ]
  },
  {
    id: 'comp-104',
    title: 'ขยะพลาสติกกีดขวางทางน้ำในลำธารท่องเที่ยวบ้านธารโต',
    category: 'ปัญหาน้ำเน่าเสีย',
    description: 'ใกล้น้ำตกเฉลิมพระเกียรติ ร.9 มีกองโฟม กล่องพาสติก และขวดเครื่องดื่มจากนักท่องเที่ยวถูกโยนทิ้งสะสมในวังน้ำตก กีดขวางทางระบายน้ำตามธรรมชาติและเริ่มส่งผลกระทบต่อสิ่งมีชีวิตในน้ำ',
    district: 'ธารโต',
    detailLocation: 'วังน้ำไหลธรรมชาติ ห่างจากจุดประชาสัมพันธ์น้ำตกเฉลิมพระเกียรติ ร.9 ราว 200 เมตร อ.ธารโต',
    reporterName: 'ฟาติมา ซาเร๊ะ',
    reporterPhone: '093-111-2233',
    lat: 6.0125,
    lng: 101.1921,
    status: 'pending',
    imageUrl: makeSvgPlaceholder('ทางน้ำอุดตัน: ลำธารธารโต', '%23d97706'), // Amber / Orange
    createdAt: '2026-06-02T15:30:00Z',
    updatedAt: '2026-06-02T15:30:00Z',
    history: [
      { status: 'pending', timestamp: '2026-06-02T15:30:00Z', note: 'รับเรื่องเพื่อเตรียมจัดประสานกำนันผู้ใหญ่บ้านและกลุ่มอนุรักษ์ลุ่มน้ำธารโตจัดรอบอาสาเก็บกวาดขยะทางน้ำ' }
    ]
  },
  {
    id: 'comp-105',
    title: 'จุดทิ้งขยะชุมชนตาเนาะปูเต๊ะ ซอย 4 ล้นเป็นกองโต',
    category: 'ขยะล้นถัง',
    description: 'ถังขยะพลาสติกขนาด 250 ลิตร ถูกนำมาตั้งไว้ 2 ใบแต่ตอนนี้น้ำหนักขยะกดทับและปริมาณขยะทะลักออกมาทับถมด้านนอกจนกลายเป็นกองใหญ่มากบดบังทางจราจรในซอยแคบๆ',
    district: 'บันนังสตา',
    detailLocation: 'ซอยข้างอนามัยตาเนาะปูเต๊ะ ตำบลตาเนาะปูเต๊ะ อ.บันนังสตา',
    reporterName: 'สุกรี ยะโกะ',
    reporterPhone: '082-990-8811',
    lat: 6.3214,
    lng: 101.2987,
    status: 'resolved',
    imageUrl: makeSvgPlaceholder('ขยะท่วมถัง: ตาเนาะปูเต๊ะ', '%23059669'),
    adminComment: 'กองสาธารณสุข อบต.ตาเนาะปูเต๊ะ จัดส่งทีมจัดเก็บขยะสำรองพิเศษเข้าดำเนินการขนถ่ายขยะออกทั้งหมดเรียบร้อยแล้ว พร้อมแนะแนวชาวบ้านในซอยไม่ให้โยนขยะนอกจากตัวถัง',
    createdAt: '2026-05-25T09:00:00Z',
    updatedAt: '2026-05-26T16:00:00Z',
    history: [
      { status: 'pending', timestamp: '2026-05-25T09:00:00Z', note: 'รับเรื่องแจ้งกองบรรเทาสาธารณภัย อบต.ตาเนาะปูเต๊ะ' },
      { status: 'processing', timestamp: '2026-05-26T10:00:00Z', note: 'ทีมรถอัดขยะเข้าปฏิบัติการหน้างาน เคลื่อนย้ายขยะมูลฝอยสะสม' },
      { status: 'resolved', timestamp: '2026-05-26T16:00:00Z', note: 'จัดเก็บเรียบร้อยพร้อมทำความสะอาดกวาดฝุ่นละออง' }
    ]
  },
  {
    id: 'comp-106',
    title: 'กลิ่นเหม็นจากฟาร์มสัตว์หรือขยะอินทรีย์ลักลอบเทท้ายซอย',
    category: 'ปัญหากลิ่นเหม็น',
    description: 'มีกลิ่นเหม็นอับคล้ายมูลสัตว์หรือเศษอวัยวะภายในสัตว์จากถังขยะส่วนบุคคลที่นำมาทิ้งไว้ที่ว่างเปล่าท้ายซอย ส่งกลิ่นรุนแรงคลื่นไส้ตลอดวัน สูดดมแล้วส่งผลต่อระบบทางเดินหายใจของเด็กเล็ก',
    district: 'ยะหา',
    detailLocation: 'สุดซอยร่วมจิต ตำบลยะหา อ.ยะหา',
    reporterName: 'นายมูฮัมหมัด ซอและ',
    reporterPhone: '087-654-9988',
    lat: 6.4552,
    lng: 101.1298,
    status: 'processing',
    imageUrl: makeSvgPlaceholder('กลิ่นรบกวน: ชุมชนยะหา',  '%230284c7'),
    createdAt: '2026-06-01T11:45:00Z',
    updatedAt: '2026-06-01T14:30:00Z',
    history: [
      { status: 'pending', timestamp: '2026-06-01T11:45:00Z', note: 'รับคำร้องเรียนกลิ่นเหม็นจากสารอินทรีย์เน่าเสีย' },
      { status: 'processing', timestamp: '2026-06-01T14:30:00Z', note: 'ประสานงานหมวดอนามัยสิ่งแวดล้อมอำเภอยะหาลงพื้นที่ค้นหาต้นตอแหล่งกำเนิดกลิ่นเหม็นรบกวน' }
    ]
  },
  {
    id: 'comp-107',
    title: 'ป้ายเตือนห้ามทิ้งขยะโดนกิ่งไม้บังและมีขยะกองอยู่ข้างล่างป้าย',
    category: 'จุดทิ้งขยะผิดกฎหมาย',
    description: 'บริเวณไหล่ทางป้ายเขตห้ามทิ้งขยะ อบต.สะเตงนอก กลับมีถุงขยะสีดำและเครื่องเรือนเก่ามากองทับถมจนสูงท่วมหัว แถมกิ่งไม้ยังขึ้นคลุมทับจนป้ายมองไม่เห็น รบกวนตัดแต่งกิ่งไม้และขนย้ายขยะออกไปด้วยครับ',
    district: 'เมืองยะลา',
    detailLocation: 'โค้งถนนเลี่ยงเมือง ใกล้สามแยกโกตาบารู ต.สะเตงนอก อ.เมืองยะลา',
    reporterName: 'ปรีชา วงศ์สุวรรณ',
    reporterPhone: '084-332-1100',
    lat: 6.5323,
    lng: 101.3112,
    status: 'processing',
    imageUrl: makeSvgPlaceholder('ลักลอบทิ้ง: ขวาป้ายสะเตงนอก', '%230284c7'),
    createdAt: '2026-06-02T08:15:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
    history: [
      { status: 'pending', timestamp: '2026-06-02T08:15:00Z', note: 'รับแจ้งสิ่งปฏิกูลทิ้งสะสมจุดห้ามทิ้ง' },
      { status: 'processing', timestamp: '2026-06-02T10:00:00Z', note: 'ส่งทีมทำความสะอาดตัดแต่งพืชพันธุ์และแผ้วถางหน้าดินเพื่อขยายการมองเห็นป้ายห้ามทิ้ง' }
    ]
  }
];

// Seed Environmental News in Yala
const initialNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'ยะลานำร่องโครงการ "หมู่อาร์มโปร่งใส ไร้กลิ่นขยะ" เทศบาลนครยะลา',
    content: 'เทศบาลนครยะลาจับมือเยาวชนและชุมชนเขตเมือง ร่วมกันติดตั้งระบบคัดแยกเศษอาหารอินทรีย์เพื่อแปรรูปเป็นปุ๋ยชีวภาพ โดยได้รับความร่วมมือร่วมใจอย่างดีเยี่ยมจากประชาชน ช่วยลดภาระขยะเปียกหน้าดินขึ้นถึงร้อยละ 40 พร้อมกระจายถังขยะแยกประเภทเพื่อปูพรมระบบหมุนเวียนเศรษฐกิจ BCG',
    date: '2026-05-25',
    location: 'สวนสาธารณะสนามโรงพิธีช้างเผือก อ.เมืองยะลา',
    imageUrl: makeSvgPlaceholder('โครงการ ยะลา ยลยะลา เมืองสะอาด', '%230d9488'),
    category: 'กิจกรรม'
  },
  {
    id: 'news-2',
    title: 'กลุ่มอาสาสมัครเบตงทำความสะอาด Big Cleaning Day แหล่งท่องเที่ยวตู้ไปรษณีย์ยักษ์',
    content: 'เพื่อต้อนรับฤดูกาลท่องเที่ยวของปี 2026 กลุ่มผู้ประกอบการเบตงและชาวเบตงจิตอาสาจัดกิจกรรมกระตุ้นการมีส่วนร่วม เก็บกวาดถังขยะคัดแยก และรณรงค์ห้ามนักท่องเที่ยวทิ้งขยะนอกพื้นที่บริเวณจุดชมวิวใจกลางเมือง ตู้ไปรษณีย์จำลองใหญ่ที่สุดในโลก และหอนาฬิกาเมืองหมอกเบตง',
    date: '2026-05-28',
    location: 'หอนาฬิกาเมืองเบตง และ ตู้ไปรษณีย์ใหญ่ อ.เบตง',
    imageUrl: makeSvgPlaceholder('สะอาดเบตง อุ่นใจคนมาเยือน', '%230284c7'),
    category: 'ประชาสัมพันธ์'
  },
  {
    id: 'news-3',
    title: 'คู่มือ 3R ประชารัฐสู้ขยะล้นถัง สำหรับครอบครัวชาวยะลา',
    content: 'สำนักงานสิ่งแวดล้อมและควบคุมมลพิษจังหวัดยะลา จัดทำและแจกจ่ายแผ่นพับส่งเสริมการคัดแยกขยะในครัวเรือนตามหลัก 3R (Reduce, Reuse, Recycle) เพื่อส่งเสริมการบีบอัดขยะขวดพลาสติก การลดใช้ถุงพลาสติกครั้งเดียวทิ้ง และแนวทางจัดแยกเซลล์แห้ง/ขยะอันตรายเพื่อความปลอดภัยของพนักงานเก็บขยะ',
    date: '2026-06-01',
    location: 'กระทรวงสาธารณสุขและสิ่งแวดล้อมยะลา อ.เมืองยะลา',
    imageUrl: makeSvgPlaceholder('สิงแวดล้อมยอดเยี่ยม คู่มือ 3R', '%23059669'),
    category: 'ความรู้'
  }
];

// Initialize database file if requested
function readComplaints(): Complaint[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data) as Complaint[];
    }
  } catch (err) {
    console.error('Error reading complaints db:', err);
  }
  // Write default seed complaints if no file or parsing errors
  writeComplaints(initialComplaints);
  return initialComplaints;
}

function writeComplaints(data: Complaint[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing complaints db:', err);
  }
}

// Global server middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API ROUTES
// 1. Get all complaints
app.get('/api/complaints', (req, res) => {
  const complaints = readComplaints();
  res.json({ success: true, count: complaints.length, data: complaints });
});

// 2. Submit a new complaint
app.post('/api/complaints', (req, res) => {
  try {
    const {
      title,
      category,
      description,
      district,
      detailLocation,
      reporterName,
      reporterPhone,
      lat,
      lng,
      imageUrl
    } = req.body;

    if (!title || !category || !description || !district || !detailLocation || !reporterName || !reporterPhone) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่สำคัญให้ครบถ้วน' });
    }

    const complaints = readComplaints();
    const newId = `comp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const finalizedImg = imageUrl || makeSvgPlaceholder(title, '%23059669');

    const newComplaint: Complaint = {
      id: newId,
      title,
      category,
      description,
      district,
      detailLocation,
      reporterName,
      reporterPhone,
      lat: Number(lat) || 6.5412,
      lng: Number(lng) || 101.2805,
      status: 'pending',
      imageUrl: finalizedImg,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [
        {
          status: 'pending',
          timestamp,
          note: 'เริ่มรับแจ้งเข้าระบบบอร์ด Yala Clean City รอดำเนินการคัดแยกโดยฝ่ายงานสุขาภิบาลประจำอำเภอ'
        }
      ]
    };

    complaints.unshift(newComplaint); // Add at primary spot
    writeComplaints(complaints);

    res.status(201).json({ success: true, data: newComplaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Update status of a complaint
app.put('/api/complaints/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment, note } = req.body;

    if (!status || !['pending', 'processing', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    const complaints = readComplaints();
    const index = complaints.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'ไม่พบรหัสการแจ้งเรื่องนี้' });
    }

    const complaint = complaints[index];
    const timestamp = new Date().toISOString();

    complaint.status = status;
    complaint.updatedAt = timestamp;
    if (adminComment !== undefined) {
      complaint.adminComment = adminComment;
    }

    const historyNote = note || (
      status === 'processing' 
        ? 'เจ้าหน้าที่ฝ่ายจัดเก็บได้รับเรื่องประสานกำลังและเข้าแทรกแซงหน้างานแล้ว' 
        : status === 'resolved' 
          ? 'เสร็จเรียบร้อย! คณะกรรมการตรวจสอบแล้วพบว่าขยะหรือสิ่งแวดล้อมได้รับการปรับปรุงเสร็จสิ้น' 
          : 'ปรับปรุงสถานะเป็นรอดำเนินการ'
    );

    complaint.history.push({
      status,
      timestamp,
      note: historyNote
    });

    complaints[index] = complaint;
    writeComplaints(complaints);

    res.json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Delete a complaint
app.delete('/api/complaints/:id', (req, res) => {
  try {
    const { id } = req.params;
    let complaints = readComplaints();
    const initialLen = complaints.length;

    complaints = complaints.filter(c => c.id !== id);

    if (complaints.length === initialLen) {
      return res.status(404).json({ success: false, message: 'ไม่พบเรื่องร้องเรียนที่ต้องการลบ' });
    }

    writeComplaints(complaints);
    res.json({ success: true, message: 'ลบเรื่องร้องเรียนเรียบร้อยแล้ว' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get news
app.get('/api/news', (req, res) => {
  res.json({ success: true, count: initialNews.length, data: initialNews });
});

// 6. Get stats
app.get('/api/stats', (req, res) => {
  const complaints = readComplaints();
  
  const totalCount = complaints.length;
  let pendingCount = 0;
  let processingCount = 0;
  let resolvedCount = 0;

  const districtCounts: Record<DistrictName, number> = {
    'เมืองยะลา': 0,
    'เบตง': 0,
    'บันนังสตา': 0,
    'ธารโต': 0,
    'กาบัง': 0,
    'กรงปินัง': 0,
    'รามัน': 0,
    'ยะหา': 0
  };

  const categoryCounts: Record<ComplaintCategory, number> = {
    'ขยะตกค้าง': 0,
    'ขยะล้นถัง': 0,
    'จุดทิ้งขยะผิดกฎหมาย': 0,
    'ปัญหากลิ่นเหม็น': 0,
    'ปัญหาน้ำเน่าเสีย': 0,
    'อื่น ๆ': 0
  };

  complaints.forEach((c) => {
    // Stats count
    if (c.status === 'pending') pendingCount++;
    else if (c.status === 'processing') processingCount++;
    else if (c.status === 'resolved') resolvedCount++;

    // District count
    if (c.district in districtCounts) {
      districtCounts[c.district]++;
    } else {
      // guard safety
      districtCounts[c.district] = 1;
    }

    // Category count
    if (c.category in categoryCounts) {
      categoryCounts[c.category]++;
    } else {
      categoryCounts[c.category] = 1;
    }
  });

  res.json({
    success: true,
    data: {
      totalCount,
      pendingCount,
      processingCount,
      resolvedCount,
      districtCounts,
      categoryCounts
    }
  });
});

// VITE SERVER OR STATIC ASSETS ROUTING CONFIGURATION
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Yala Clean City Server] listening on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
