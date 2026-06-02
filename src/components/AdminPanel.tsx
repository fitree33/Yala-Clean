/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, Lock, Unlock, RefreshCw, BarChart2, Calendar, FileText, Check, Loader2, Clock, 
  Trash2, Mail, Download, Printer, Filter, MessageSquare, AlertTriangle, Users
} from 'lucide-react';
import { Complaint, DistrictName, ComplaintCategory } from '../types';

interface AdminPanelProps {
  complaints: Complaint[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: Complaint['status'], adminComment: string, historyNote?: string) => Promise<boolean>;
  onDeleteComplaint: (id: string) => Promise<boolean>;
}

export default function AdminPanel({
  complaints,
  loading,
  onRefresh,
  onUpdateStatus,
  onDeleteComplaint
}: AdminPanelProps) {
  // Authentication states
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard configuration states
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictName | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | Complaint['status']>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Complaint editing fields
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState<Complaint['status']>('pending');
  const [editComment, setEditComment] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Stats computed variables
  const totalReports = complaints.length;
  const pendingReports = complaints.filter(c => c.status === 'pending').length;
  const processingReports = complaints.filter(c => c.status === 'processing').length;
  const resolvedReports = complaints.filter(c => c.status === 'resolved').length;

  // 1. Calculate top problematic areas (Districts)
  const districtCounts = complaints.reduce((acc, current) => {
    acc[current.district] = (acc[current.district] || 0) + 1;
    return acc;
  }, {} as Record<DistrictName, number>);

  const sortedDistricts = Object.keys(districtCounts)
    .map(key => ({
      name: key as DistrictName,
      count: districtCounts[key as DistrictName] || 0
    }))
    .sort((a, b) => b.count - a.count);

  const highestArea = sortedDistricts[0]?.name || 'ไม่มีข้อมูล';

  // 2. Calculate category division percentage
  const categoryCounts = complaints.reduce((acc, current) => {
    acc[current.category] = (acc[current.category] || 0) + 1;
    return acc;
  }, {} as Record<ComplaintCategory, number>);

  const sortedCategories = Object.keys(categoryCounts)
    .map(key => ({
      name: key as ComplaintCategory,
      count: categoryCounts[key as ComplaintCategory] || 0
    }));

  // Handle staff Passcode bypass Verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาระบุรหัสผ่านเข้าเล่นคือ 1234');
    }
  };

  // Filter complaints matching criteria inside admin interface
  const filteredComplaints = complaints.filter(c => {
    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.reporterName.toLowerCase().includes(q) ||
        c.reporterPhone.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open complaint editor panel
  const handleSelectComplaint = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setEditStatus(comp.status);
    setEditComment(comp.adminComment || '');
    setEditNote('');
  };

  // Dispatch update request to parent
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    const success = await onUpdateStatus(
      selectedComplaint.id,
      editStatus,
      editComment,
      editNote || undefined
    );
    setIsUpdating(false);

    if (success) {
      // Re-trigger visual feedback
      const updated = complaints.find(c => c.id === selectedComplaint.id);
      if (updated) {
        setSelectedComplaint({ ...updated, status: editStatus, adminComment: editComment });
      } else {
        setSelectedComplaint(null);
      }
    }
  };

  // Dispatch delete request to parent
  const handleDelete = async (id: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเรื่องร้องเรียนรหัส ${id} ออกจากประวัติจังหวัดอย่างถาวร?`)) {
      const success = await onDeleteComplaint(id);
      if (success && selectedComplaint?.id === id) {
        setSelectedComplaint(null);
      }
    }
  };

  // EXPORT 1: Excel CSV Generation with Thai Encoding support (UTF-8 with BOM)
  const handleExportCSV = () => {
    if (complaints.length === 0) {
      alert('ไม่มีข้อมูลสิ่งแวดล้อมเพื่อส่งออกบันทึก');
      return;
    }

    const headers = ['รหัสร้องเรียน', 'หัวข้อปัญหา', 'หมวดหมู่', 'อำเภอ', 'สถานที่อย่างละเอียด', 'รายละเอียดปัญหารวม', 'ละติจูด', 'ลองจิจูด', 'ผู้ร้องเรียน', 'เบอร์ติดต่อ', 'สถานะการทำงาน', 'ความคิดเห็นสลักหลัง', 'วันที่รายงาน'];
    
    const rows = complaints.map(c => [
      c.id,
      c.title.replace(/"/g, '""'),
      c.category,
      c.district,
      c.detailLocation.replace(/"/g, '""'),
      c.description.replace(/"/g, '""'),
      c.lat,
      c.lng,
      c.reporterName,
      c.reporterPhone,
      c.status === 'pending' ? 'รอรับเรื่อง' : c.status === 'processing' ? 'กำลังดำเนินการ' : 'แก้ไขแล้ว',
      (c.adminComment || '').replace(/"/g, '""'),
      c.createdAt
    ]);

    const csvContent = 
      '\uFEFF' // UTF-8 BOM indicator for proper Thai viewing in Microsoft Excel
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'yala_clean_city_report_' + new Date().toISOString().slice(0,10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT 2: Formal Government Report Printer-friendly format
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build responsive styled HTML preview page
    const content = `
      <html>
        <head>
          <title>สัญลักษร์รายงานดัชนีสิ่งแวดล้อม Yala Clean City</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif, 'Leelawadee'; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px double #059669; padding-bottom: 12px; margin-bottom: 25px; text-align: center; }
            .header h1 { font-size: 26px; color: #065f46; margin: 0 0 5px 0; }
            .header p { font-size: 13px; color: #64748b; margin: 0; }
            .stats-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; background-color: #f8fafc; }
            .stat-box h3 { font-size: 11px; text-transform: uppercase; margin: 0 0 8px 0; color: #475569; }
            .stat-box p { font-size: 22px; font-weight: bold; margin: 0; color: #022c22; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background-color: #059669; color: white; text-align: left; padding: 10px; border: 1px solid #10b981; }
            td { padding: 9px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { border-top: 1px solid #cbd5e1; font-size: 10px; text-align: center; padding-top: 15px; margin-top: 40px; color: #64748b; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>รายงานการแจ้งแก้ไขปัญหาสิ่งแวดล้อมและขยะสะสม จังหวัดยะลา</h1>
            <p>ระบบตรวจสอบบูรณาการระดับภูมิภาค - Yala Clean City Dashboard</p>
            <p style="margin-top: 4px;">สรุปข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
          </div>

          <div class="stats-container">
            <div class="stat-box">
              <h3>เรื่องร้องเรียนทั้งหมด</h3>
              <p>${totalReports} เรื่อง</p>
            </div>
            <div class="stat-box" style="color: #b45309;">
              <h3>รอรับเรื่อง (Pending)</h3>
              <p>${pendingReports}</p>
            </div>
            <div class="stat-box" style="color: #0369a1;">
              <h3>กำลังแก้ไข (Processing)</h3>
              <p>${processingReports}</p>
            </div>
            <div class="stat-box" style="color: #047857;">
              <h3>เสร็จสิ้นแล้ว (Resolved)</h3>
              <p>${resolvedReports}</p>
            </div>
          </div>

          <h3 style="border-bottom: 1px solid #059669; padding-bottom: 5px; color: #065f46;">รายการความร่วมมือฟื้นฟูสภาพแวดล้อม</h3>
          <table>
            <thead>
              <tr>
                <th>ไอดี</th>
                <th>หัวข้อเรื่องร้องเรียน</th>
                <th>อำเภอ</th>
                <th>หมวดหมู่</th>
                <th>ที่ตั้งจุดเกิดเหตุอย่างละเอียด</th>
                <th>ผู้ยื่นเรื่อง</th>
                <th>เบอร์ติดต่อ</th>
                <th>สถานะการแก้ไข</th>
              </tr>
            </thead>
            <tbody>
              ${complaints.map(c => `
                <tr>
                  <td><b>${c.id}</b></td>
                  <td>${c.title}</td>
                  <td>${c.district}</td>
                  <td>${c.category}</td>
                  <td>${c.detailLocation}</td>
                  <td>${c.reporterName}</td>
                  <td>${c.reporterPhone}</td>
                  <td><b>${c.status === 'pending' ? 'รอดำเนินการ' : c.status === 'processing' ? 'กำลังสางงาน' : 'เสร็จสมบูรณ์'}</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>จัดพิมพ์โดยระบบ Yala Clean City ศูนย์ปัญญาประดิษฐ์และสิ่งแวดล้อมจังหวัดยะลา</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // If not logged in, prompt credentials checking
  if (!isAuthenticated) {
    return (
      <div id="admin_login_bypass_verification" className="max-w-md mx-auto bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm text-center space-y-6 my-8">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">ระบบคัดกรองข้าราชการและคณะทำงาน</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            พื้นที่ควบคุมความปลอดภัยสำหรับผู้รับผิดชอบงานฝ่ายสุขาภิบาลและสิ่งอาสาสมัครองค์กรเทศบาลยะลาเพื่อแก้ไขสถานการณ์น้ำและขยะเศษสิ่งปฏิกูล
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin_passcode_input" className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              ป้อนรหัสแอดมินยืนยันตน (รหัสผ่านสาธิตคือ: <b>1234</b>)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="admin_passcode_input"
                type="password"
                placeholder="ระบุรหัส 4 หลัก..."
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono tracking-widest font-bold"
              />
            </div>
          </div>

          <button
            id="admin_credentials_unlock_btn"
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/5 hover:scale-[1.01]"
          >
            <Unlock className="w-4 h-4" />
            ปลดล็อกระบบผู้ดูแลระบบ
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="verified_admin_dashboard_section" className="space-y-8">
      
      {/* Upper toolbar panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              แผงควบคุมสิทธิ์บริหารและอนุมัติรัฐบาลยะลา
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">MODE: ACTIVE ADMIN</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คุณสามารถอนุมัติ เปลี่ยนสถานะ สลักหลังพิกัด และดำเนินการส่งออกข้อมูลทั้งหมด
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick simulation refresh */}
          <button
            id="admin_refresh_db_btn"
            onClick={onRefresh}
            className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-semibold p-2 rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="รีเฟรชข้อมูลเบื้องต้น"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>

          {/* Export buttons */}
          <button
            id="admin_export_excel_btn"
            onClick={handleExportCSV}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-lg transition-colors text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            ส่งออก Excel (CSV)
          </button>

          <button
            id="admin_export_pdf_btn"
            onClick={handlePrintPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            พิมพ์ไฟล์ PDF
          </button>

          <button
            id="admin_secure_exit_btn"
            onClick={() => {
              setIsAuthenticated(false);
              setPasscode('');
            }}
            className="bg-rose-50 hover:bg-rose-100 text-rose-650 font-semibold px-2.5 py-2 rounded-lg transition-colors text-xs"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Grid of Key Numerical Indicators & Statistical Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 md:p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">เรื่องร้องเรียนสะสม</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{totalReports} <span className="text-xs font-medium text-slate-500">เรื่อง</span></p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 md:p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider text-amber-600">รอดำเนินการรับเรื่อง</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{pendingReports} <span className="text-xs font-medium text-slate-400">เรื่อง</span></p>
          <div className="w-full bg-slate-105 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${(pendingReports/Math.max(totalReports,1))*100}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 md:p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider text-indigo-600">กำลังทำงานแก้ไข</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{processingReports} <span className="text-xs font-medium text-slate-400">เรื่อง</span></p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${(processingReports/Math.max(totalReports,1))*100}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 md:p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider text-emerald-600">สางงานเสร็จสิ้น</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{resolvedReports} <span className="text-xs font-medium text-slate-400">เรื่อง</span></p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${(resolvedReports/Math.max(totalReports,1))*100}%` }} />
          </div>
        </div>
      </div>

      {/* Advanced Statistical Diagrams representation (พื้นที่ปัญหาสูงสุด & สัดส่วนประเภทขยะ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOP Problem Areas District representation */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              <BarChart2 className="text-emerald-600 w-5 h-5" />
              วิเคราะห์ปริมาณขยะหนาแน่นรายอำเภอ (สะสม)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              อำเภอที่มีความถี่ร้องเรียนสูงสุดขณะนี้คือ: <b className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{highestArea}</b>
            </p>
          </div>

          <div className="space-y-3.5">
            {sortedDistricts.length === 0 ? (
              <p className="text-xs text-slate-450 italic">ไม่มีข้อมูลสถิติ</p>
            ) : sortedDistricts.map((dist, idx) => {
              const maxCount = Math.max(...sortedDistricts.map(d => d.count), 1);
              const percentage = Math.round((dist.count / maxCount) * 100);
              
              return (
                <div key={dist.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 text-center font-mono font-bold text-slate-400">{idx+1}.</span>
                      {dist.name}
                    </span>
                    <span className="font-mono text-slate-600">
                      <b>{dist.count}</b> เรื่อง
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-emerald-600' : idx === 1 ? 'bg-emerald-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Division Diagram */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              <BarChart2 className="text-emerald-600 w-5 h-5 animate-pulse" />
              สัดส่วนประเภทข้อร้องเรียนสิ่งแวดล้อม
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              สถิติแยกตามหมวดหมู่ประเภทที่ระบบทำการแบ่งแยกกลุ่มอ้างอิงเชิงวิชาการ
            </p>
          </div>

          <div className="space-y-3.5">
            {sortedCategories.length === 0 ? (
              <p className="text-xs text-slate-400 italic">ไม่มีข้อมูลสิ่งแวดล้อม</p>
            ) : sortedCategories.map((cat, idx) => {
              const maxCount = Math.max(...sortedCategories.map(c => c.count), 1);
              const percentage = Math.round((cat.count / maxCount) * 100);

              const colors = ['bg-sky-550', 'bg-emerald-550', 'bg-indigo-550', 'bg-amber-550', 'bg-purple-550', 'bg-cyan-550'];
              const col = colors[idx % colors.length];

              return (
                <div key={cat.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span>{cat.name}</span>
                    <span className="font-mono text-slate-500"><b>{cat.count}</b> ครั้ง</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${col}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Interaction Panel: User complaints records grid & Update controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Table List of entries on Left */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
                <Users className="w-5 h-5 text-emerald-600" />
                รายการคลังคำร้องเรียนแจ้งเข้า ({filteredComplaints.length})
              </h4>
            </div>

            {/* Quick search & Filters */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <input
                id="admin_table_search_input"
                type="text"
                placeholder="ค้นหาด่วน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              
              <select
                id="admin_district_quick_select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px]"
              >
                <option value="All">ทุกอำเภอ</option>
                <option value="เมืองยะลา">เมืองยะลา</option>
                <option value="เบตง">เบตง</option>
                <option value="บันนังสตา">บันนังสตา</option>
                <option value="ธารโต">ธารโต</option>
                <option value="กาบัง">กาบัง</option>
                <option value="กรงปินัง">กรงปินัง</option>
                <option value="รามัน">รามัน</option>
                <option value="ยะหา">ยะหา</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                  <th className="p-3">รหัส / วันเสด็จ</th>
                  <th className="p-3">หัวเรื่องร้องแผ่น</th>
                  <th className="p-3">อำเภอ</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-right">ควบคุม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                      ไม่พบเรื่องร้องเรียนใดๆ ที่สอดคล้อง
                    </td>
                  </tr>
                ) : filteredComplaints.map(comp => {
                  const isPending = comp.status === 'pending';
                  const isProcessing = comp.status === 'processing';
                  const isResolved = comp.status === 'resolved';

                  return (
                    <tr 
                      key={comp.id}
                      onClick={() => handleSelectComplaint(comp)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedComplaint?.id === comp.id ? 'bg-emerald-50/20 font-medium' : ''
                      }`}
                    >
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-405 block">{comp.id}</span>
                        <span className="text-[10px] text-slate-450 block">
                          {new Date(comp.createdAt).toLocaleDateString('th-TH', { month: 'narrow', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="p-3 max-w-[150px] truncate">
                        <span className="font-semibold text-slate-800 block truncate">{comp.title}</span>
                        <span className="text-[10px] text-slate-450 block truncate">{comp.reporterName}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium block w-max">
                          {comp.district}
                        </span>
                      </td>
                      <td className="p-3">
                        {isPending && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono font-semibold">PENDING</span>}
                        {isProcessing && <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded font-mono font-semibold">PROCESSING</span>}
                        {isResolved && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">RESOLVED</span>}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`admin_delete_complaint_${comp.id}_btn`}
                          onClick={() => handleDelete(comp.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                          title="ลบคำร้อง"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Inspector & Status Editor Panel */}
        <div className="xl:col-span-5">
          {selectedComplaint ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-slate-400">แก้ไขข้อมูลคำร้อง ID: {selectedComplaint.id}</span>
                <h4 className="font-bold text-slate-800 text-base">{selectedComplaint.title}</h4>
                <div className="flex gap-2 mt-2">
                  <span className="bg-indigo-50 text-indigo-850 text-[10px] font-medium px-2 py-0.5 rounded font-sans">
                    {selectedComplaint.district}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded font-sans">
                    {selectedComplaint.category}
                  </span>
                </div>
              </div>

              {/* Submitting form inside inspector */}
              <form onSubmit={handleSaveStatus} className="space-y-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1.5 border-l-2 border-emerald-500">
                  ปรับสถานะขั้นตอนการทำงาน
                </h5>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('pending')}
                    className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center justify-center gap-1.5 ${
                      editStatus === 'pending'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-500'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    PENDING (รับแจ้ง)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('processing')}
                    className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center justify-center gap-1.5 ${
                      editStatus === 'processing'
                        ? 'border-sky-500 bg-sky-50/50 text-sky-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-500'
                    }`}
                  >
                    <Loader2 className="w-4 h-4" />
                    PROCESSING
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('resolved')}
                    className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center justify-center gap-1.5 ${
                      editStatus === 'resolved'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-500'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    RESOLVED (เสร็จ)
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor="admin_comment_textarea" className="block text-xs font-semibold text-slate-600">
                    ความคิดเห็นสลักหลังแอดมิน (แสดงผลถึงประชาชนทันที) *
                  </label>
                  <textarea
                    id="admin_comment_textarea"
                    rows={3}
                    placeholder="เช่น เจ้าหน้าที่สุขาภิบาล อบต. กำลังรุดนำเรือคัดแยกขวดพลาสติกกวาดสิ่งปฏิกูล..."
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="admin_history_note_input" className="block text-xs font-semibold text-slate-600">
                    บันทึกประวัติการขยับย้ายเพิ่มเติม (Optional) *
                  </label>
                  <input
                    id="admin_history_note_input"
                    type="text"
                    placeholder="ระบุข้อเท็จจริงสั้นๆ เช่น แจ้งเปลี่ยนจากศูนย์อำนวยการใหญ่..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  id="admin_save_complaint_status_btn"
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      กำลังเซฟอัปเดตลงบอร์ด...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      บันทึกสลักหลังและเปลี่ยนสถานะ
                    </>
                  )}
                </button>
              </form>

              {/* Informational specs card in inspector for full transparency */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ข้อมูลจำเพาะทางภูมิศาสตร์</h5>
                {selectedComplaint.imageUrl && (
                  <div className="w-full h-28 rounded overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={selectedComplaint.imageUrl} alt="Complaint Attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-100">
                  <p><b>ชื่อผู้แจ้ง:</b> {selectedComplaint.reporterName}</p>
                  <p><b>เบอร์ติดต่อ:</b> {selectedComplaint.reporterPhone}</p>
                  <p><b>พิกัดแผนที่:</b> {selectedComplaint.lat}, {selectedComplaint.lng}</p>
                  <p><b>จุดละเอียด:</b> {selectedComplaint.detailLocation}</p>
                  <p className="border-t border-slate-100 pt-1.5 leading-relaxed"><b>เนื้อความ:</b> {selectedComplaint.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-250 rounded-2xl p-8 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <Shield className="w-8 h-8 text-slate-403" />
              <p className="text-xs font-semibold">กรุณาคลิกเลือกเรื่องร้องเรียนในตาราง</p>
              <p className="text-[10px] text-slate-400 max-w-xs">
                สัมผัสหัวข้อเรื่องขยะในตารางเพื่อทำการอัปเดตสถานะ ประสานงานเจ้าหน้าที่ หรือพิมพ์ประวัติปฏิกูล
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
