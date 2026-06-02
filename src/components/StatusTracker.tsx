/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Loader2, Calendar, Phone, MapPin, Tag, ChevronDown, ChevronUp, Check, Clock, Eye, AlertTriangle } from 'lucide-react';
import { Complaint, DistrictName } from '../types';

interface StatusTrackerProps {
  complaints: Complaint[];
  loading: boolean;
}

export default function StatusTracker({ complaints, loading }: StatusTrackerProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictName | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'pending' | 'processing' | 'resolved'>('All');
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Filter complaints based on search query, phone number search, district, or status
  const filteredComplaints = complaints.filter(comp => {
    // 1. Phone number filter if searched
    if (searchPerformed && phoneNumber.trim() !== '') {
      const formattedInput = phoneNumber.trim().replace(/[-\s]/g, '');
      const formattedDb = comp.reporterPhone.replace(/[-\s]/g, '');
      if (!formattedDb.includes(formattedInput)) {
        return false;
      }
    }

    // 2. Text Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = 
        comp.title.toLowerCase().includes(q) || 
        comp.description.toLowerCase().includes(q) || 
        comp.detailLocation.toLowerCase().includes(q) || 
        comp.id.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    // 3. District
    if (selectedDistrict !== 'All' && comp.district !== selectedDistrict) {
      return false;
    }

    // 4. Status
    if (selectedStatus !== 'All' && comp.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedComplaintId(prevId => (prevId === id ? null : id));
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Helper styles for statuses
  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-55 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            รอรับเรื่อง
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-200">
            <Loader2 className="w-3.5 h-3.5 text-sky-700 animate-spin" />
            กำลังดำเนินการ
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-250">
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            แก้ไขแล้ว
          </span>
        );
    }
  };

  return (
    <div id="status_tracker_overall_section" className="space-y-6">
      {/* Upper Control bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <Phone className="text-emerald-600 w-5 h-5" />
          ติดตามสถานะและตรวจสอบประวัติ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Phone Number tracking */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <label htmlFor="search_phone_input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ระบุหมายเลขโทรศัพท์ (ประวัติของฉัน)
              </label>
              <p className="text-[10px] text-slate-400 mb-2.5">
                กรอกเบอร์โทรที่คุณใช้ป้อนในฟอร์มเพื่อเรียกดูทุกเรื่องที่คุณรายงาน
              </p>
            </div>
            <div className="flex gap-2">
              <input
                id="search_phone_input"
                type="tel"
                placeholder="เช่น 0812345678"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (e.target.value === '') {
                    setSearchPerformed(false);
                  }
                }}
                className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                id="search_phone_submit_btn"
                onClick={() => setSearchPerformed(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                ค้นหา
              </button>
            </div>
            {searchPerformed && (
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                  กำลังกรองข้อมูลด้วยเบอร์โทร
                </span>
                <button
                  id="reset_phone_filter_btn"
                  onClick={() => {
                    setPhoneNumber('');
                    setSearchPerformed(false);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>

          {/* Broad general filtering */}
          <div className="md:col-span-7 bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                คลังเรื่องราวร้องเรียนและตัวกรองทั่วไป
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Search String */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  id="general_search_query_input"
                  type="text"
                  placeholder="ค้นหาตามข้อความ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Dist filter */}
              <select
                id="district_filter_select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value as DistrictName | 'All')}
                className="w-full text-xs px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="All">ทุกอำเภอในยะลา</option>
                <option value="เมืองยะลา">เมืองยะลา</option>
                <option value="เบตง">เบตง</option>
                <option value="บันนังสตา">บันนังสตา</option>
                <option value="ธารโต">ธารโต</option>
                <option value="กาบัง">กาบัง</option>
                <option value="กรงปินัง">กรงปินัง</option>
                <option value="รามัน">รามัน</option>
                <option value="ยะหา">ยะหา</option>
              </select>

              {/* Status filter */}
              <select
                id="status_filter_select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="All">ทุกสถานะการแก้ไข</option>
                <option value="pending">รอรับเรื่อง</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="resolved">แก้ไขแล้ว</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main complaint grid/list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-650 font-medium">กำลังสตรีมประวัติข้อมูลจากฐานข้อมูล Yala Clean City...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm space-y-2">
          <AlertTriangle className="w-12 h-12 text-slate-350 mx-auto" />
          <h4 className="font-bold text-slate-700 text-base">ไม่พบข้อมูลการแจ้งเรื่องร้องเรียน</h4>
          <p className="text-xs text-slate-450 max-w-md mx-auto">
            ไม่พบประวัติการแจ้งปัญหาขยะที่ตรงตามพารามิเตอร์การค้นหาหรือหมายเลขโทรศัพท์ {phoneNumber ? phoneNumber : ''} ลองตรวจสอบเลขหมายหรือเปลี่ยนอำเภอคัดแยก
          </p>
        </div>
      ) : (
        <div id="citizen_tracker_grid" className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>พบทั้งหมด <b>{filteredComplaints.length}</b> เรื่องร้องเรียน</span>
            <span>คลิกเรื่องที่ต้องการติดตามเพื่อดูไทม์ไลน์และผู้สลักหลัง</span>
          </div>

          {filteredComplaints.map((comp) => {
            const isExpanded = expandedComplaintId === comp.id;
            return (
              <div
                key={comp.id}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleExpand(comp.id)}
              >
                {/* Header Summary line */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 md:space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">ID: {comp.id}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {comp.district}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {comp.category}
                      </span>
                      {getStatusBadge(comp.status)}
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm md:text-base truncate">{comp.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 md:line-clamp-1">{comp.description}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(comp.createdAt)}
                      </span>
                      <span className="truncate"><b>จุดเกิดเหตุ:</b> {comp.detailLocation}</span>
                    </div>
                  </div>

                  {/* Thumbnail and Expand Indicator */}
                  <div className="flex items-center gap-4 self-end md:self-auto flex-shrink-0">
                    {comp.imageUrl && (
                      <div className="w-14 h-10 md:w-20 md:h-14 rounded-lg overflow-hidden border border-slate-200">
                        <img src={comp.imageUrl} alt="Complaint" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Toggle Details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Pane containing the official timeline and comments */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 md:p-6 space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Detailed narrative & image card */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-xl border border-slate-150 p-4 space-y-3">
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ภาพสถานการณ์ปัญหาจริง</h5>
                          {comp.imageUrl && (
                            <div className="w-full max-h-72 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                              <img src={comp.imageUrl} alt={comp.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">รายละเอียดอย่างครบถ้วน:</span>
                            <p className="text-xs text-slate-650 leading-relaxed mt-1 whitespace-pre-line">{comp.description}</p>
                          </div>
                          <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 grid grid-cols-2 gap-2">
                            <span><b>ผู้แจ้งเรื่อง:</b> {comp.reporterName}</span>
                            <span><b>เบอร์ติดต่อ:</b> {comp.reporterPhone.slice(0,-4)}XXXX (เพื่อความปลอดภัย)</span>
                            <span><b>ละติจูด (Lat):</b> {comp.lat}</span>
                            <span><b>ลองจิจูด (Lng):</b> {comp.lng}</span>
                          </div>
                        </div>

                        {/* Admin comment box */}
                        {comp.adminComment && (
                          <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-xs space-y-2 text-emerald-950">
                            <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                              <Check className="w-4 h-4 bg-emerald-600 text-white rounded-full p-0.5" />
                              หมายเหตุอัปเดตและสลักหลังผู้ดูแล (อปท.)
                            </span>
                            <p className="leading-relaxed bg-white/60 p-2.5 rounded-lg border border-emerald-100">{comp.adminComment}</p>
                          </div>
                        )}
                      </div>

                      {/* Multi-step progress timeline */}
                      <div className="lg:col-span-5 space-y-3">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 border-l-2 border-indigo-500">
                          สารไทม์ไลน์การดำเนินงาน (ขั้นตอนภาครัฐ)
                        </h5>

                        <div className="space-y-4 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                          {/* Step 1: Request Registration */}
                          <div className="flex gap-4 relative">
                            <div className="w-6 h-6 rounded-full bg-emerald-55 flex items-center justify-center border border-emerald-250 z-10 flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                            </div>
                            <div className="text-xs space-y-0.5">
                              <span className="text-slate-400 text-[10px] block">{formatDate(comp.createdAt)}</span>
                              <p className="font-bold text-slate-800">ส่งเรื่องรับแจ้ง (ลงทะเบียนคลัง)</p>
                              <p className="text-slate-500 text-[11px] leading-relaxed">ประชาชนยื่นลงพิกัดปัญหาขยะเข้าสู่เซิร์ฟเวอร์เรียบร้อย</p>
                            </div>
                          </div>

                          {/* Step 2: Processing (Active) */}
                          <div className="flex gap-4 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 border ${
                              comp.status === 'processing' || comp.status === 'resolved'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-250'
                                : 'bg-slate-100 text-slate-400 border-slate-350'
                            }`}>
                              {comp.status === 'processing' || comp.status === 'resolved' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="text-[10px]">2</span>
                              )}
                            </div>
                            <div className="text-xs space-y-0.5">
                              <span className="text-slate-400 text-[10px] block">
                                {comp.history.find(h => h.status === 'processing')?.timestamp 
                                  ? formatDate(comp.history.find(h => h.status === 'processing')!.timestamp)
                                  : 'รอดำเนินการ'}
                              </span>
                              <p className={`font-bold ${
                                comp.status === 'processing' || comp.status === 'resolved' ? 'text-indigo-900' : 'text-slate-400'
                              }`}>
                                กำลังดำเนินการ (อยู่ระหว่างทีมกองงานสาธารณสุขลงพื้นที่)
                              </p>
                              <p className="text-slate-500 text-[11px] leading-relaxed">
                                {comp.history.find(h => h.status === 'processing')?.note || 'เรื่องเตรียมจัดจ้างรถขยะหรือช่างสุขภิบาลเขตอำเภอลงพื้นที่เพื่อประเมิน'}
                              </p>
                            </div>
                          </div>

                          {/* Step 3: Resolved (End) */}
                          <div className="flex gap-4 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 border ${
                              comp.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                : 'bg-slate-100 text-slate-400 border-slate-300'
                            }`}>
                              {comp.status === 'resolved' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="text-[10px]">3</span>
                              )}
                            </div>
                            <div className="text-xs space-y-0.5">
                              <span className="text-slate-400 text-[10px] block">
                                {comp.history.find(h => h.status === 'resolved')?.timestamp 
                                  ? formatDate(comp.history.find(h => h.status === 'resolved')!.timestamp)
                                  : 'รอดำเนินการ'}
                              </span>
                              <p className={`font-bold ${comp.status === 'resolved' ? 'text-emerald-900' : 'text-slate-400'}`}>
                                แก้ไขปัญหาเสร็จสิ้นเรียบร้อย
                              </p>
                              <p className="text-slate-500 text-[11px] leading-relaxed">
                                {comp.history.find(h => h.status === 'resolved')?.note || 'กระบวนการเก็บกวาด ฟื้นฟูสภาพแวดล้อม และสลักหลังปิดงาน'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
