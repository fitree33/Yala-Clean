/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building, Map, AlertCircle, Sparkles, Sprout, Info, ArrowUpRight, 
  Trash2, ShieldCheck, HeartPulse, Recycle, RefreshCcw, Landmark 
} from 'lucide-react';
import { Complaint, NewsArticle } from '../types';

interface HomeOverviewProps {
  complaints: Complaint[];
  news: NewsArticle[];
  fetchingNews: boolean;
  onNavigateToReport: () => void;
  onNavigateToTracker: () => void;
  onNavigateToMap: () => void;
}

export default function HomeOverview({
  complaints,
  news,
  fetchingNews,
  onNavigateToReport,
  onNavigateToTracker,
  onNavigateToMap
}: HomeOverviewProps) {
  
  // Calculate stats
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const processing = complaints.filter(c => c.status === 'processing').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const progressRatio = total > 0 ? Math.round(((resolved) / total) * 100) : 100;

  return (
    <div id="yala_home_overview_root" className="space-y-8 animate-fadeIn">
      
      {/* 1. Hero banner block with pristine typography and soft green-blue gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 p-6 md:p-10 text-white shadow-lg border border-emerald-700/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 rounded-full text-xs font-semibold text-emerald-300">
            <Sprout className="w-3.5 h-3.5" />
            ยะลาน่าอยู่ เมืองสะอาด สิ่งแวดล้อมยั่งยืน
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Yala Clean City <br />
            <span className="text-emerald-300 text-2xl md:text-3xl font-bold">ระบบแจ้งแก้ไขปัญหาสวนป่าและขยะสิ่งแวดล้อม</span>
          </h1>

          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-sans">
            ช่องทางสื่อสารโดยตรงสำหรับประชาชนในจังหวัดแยะ เพื่อส่งสัญญานเรื่องร้องเรียน ขยะตกค้าง ถังขยะล้นน้ำเสีย หรือสิ่งทิ้งขวาง และติดตามผลการปฏิบัติงานของศูนย์ อปท. ประจำอำเภอ เพื่อชีวิตชุมชนที่สะอาด น่าอยู่ และปลอดภัย
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="hero_report_now_btn"
              onClick={onNavigateToReport}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md shadow-emerald-900/10 hover:scale-[1.01]"
            >
              <Trash2 className="w-4 h-4" />
              แจ้งปัญหาขยะด่วน
            </button>

            <button
              id="hero_track_now_btn"
              onClick={onNavigateToTracker}
              className="bg-transparent hover:bg-white/10 text-white border border-white/20 font-semibold px-5  py-3 rounded-xl transition-all text-sm flex items-center gap-1.5"
            >
              <SearchIcon className="w-4 h-4" />
              ติดตามสถานะของฉัน
            </button>
          </div>
        </div>

        {/* Abstract organic decoration graphic for the right side */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center opacity-10 pointer-events-none select-none">
          <Recycle className="w-56 h-56 text-white animate-spin-slow" />
        </div>
      </div>

      {/* 2. Numerical Performance indicators dashboard row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Real-time environmental counter card on left */}
        <div className="md:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">สรุปการปฏิบัติงานกองสุขาภิบาลประชารัฐ</span>
            <h3 className="font-bold text-slate-800 text-lg mt-1">สถิติข้อมูลแจ้งตรงประเด็นและร่วมแก้ไขพัฒนา</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1 bg-slate-50 py-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500">เรื่องร้องเรียนทั้งหมด</span>
              <p className="text-xl md:text-3xl font-extrabold text-slate-800">{total} <span className="text-xs font-medium text-slate-450">คดี</span></p>
            </div>
            
            <div className="space-y-1 bg-amber-50/40 py-3 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-700 font-medium">รอดำเนินการบำบัด</span>
              <p className="text-xl md:text-3xl font-extrabold text-amber-800">{pending + processing}</p>
            </div>

            <div className="space-y-1 bg-emerald-50/40 py-3 rounded-xl border border-emerald-110">
              <span className="text-xs text-emerald-700 font-medium font-sans">แก้ไขสำเร็จเสร็จงาน</span>
              <p className="text-xl md:text-3xl font-extrabold text-emerald-800">{resolved}</p>
            </div>
          </div>

          {/* Quick interactive heatmap or gauge indicator */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-5.5 h-5.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] animate-pulse">
                {progressRatio}%
              </span>
              <span><b>สัดส่วนความสำเร็จ:</b> อปท. ทำการแก้ไขและกู้คืนพื้นที่สัญจรคืนแล้วกว่าร้อยละ {progressRatio}</span>
            </div>
            <button 
              onClick={onNavigateToMap}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 shrink-0"
            >
              ส่องจุดแผนที่สิ่งแวดล้อม
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Government and local authority statement on right */}
        <div className="md:col-span-4 bg-gradient-to-br from-teal-50 to-emerald-50 border border-emerald-100/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h4 className="font-bold text-teal-900 text-sm flex items-center gap-1.5 justify-start">
              <Landmark className="w-4 h-4 text-teal-700" />
              หน่วยงานร่วมบูรณาการ
            </h4>
            <p className="text-xs text-slate-650 leading-relaxed">
              โครงการพัฒนาสิ่งแวดล้อม Yala Clean City ควบคุมการทำงานร่วมระหว่าง สำนักงานโยธาธิการและผังเมืองจังหวัดยะลา กองงานสาธารณสุข และทหารอาสาสมัครประจำท้องถิ่นแปดอำเภอ
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-teal-100/70 pt-4.5">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-block h-6 w-6 rounded-full bg-teal-600 ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">เมือง</span>
              <span className="inline-block h-6 w-6 rounded-full bg-emerald-600 ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">เบตง</span>
              <span className="inline-block h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">ยะหา</span>
            </div>
            <span className="text-[10px] text-teal-850 font-semibold uppercase tracking-wider bg-white px-2.5 py-1 rounded border border-teal-200">
              ครอบคลุม 8 อำเภอ
            </span>
          </div>
        </div>

      </div>

      {/* 3. Sustainable 3R Educational Banner block (Reduce, Reuse, Recycle) */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
        <div className="text-center max-w-md mx-auto space-y-1.5">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center justify-center gap-2">
            <Recycle className="text-emerald-600 w-5.5 h-5.5 animate-spin-slow" />
            แนวคิด 3R ร่วมสร้างยะลาเมืองยั่งยืน
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            เริ่มต้นง่ายๆ จากครัวเรือนของเราทุกคนเพื่อลดความเสี่ยงขยะล้นถังและลดภาวะโลกร้อน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-[13px]">
              R1
            </div>
            <h4 className="font-bold text-slate-850 text-sm">REDUCE - ลดการใช้</h4>
            <p className="text-xs text-slate-510 leading-relaxed">
              หลีกเลี่ยงพลาสติกแบบใช้ครั้งเดียวทิ้ง ยืดเวลาถุงผ้ากระดาษ และบรรจุภัณฑ์ที่เป็นมิตรกับโลกเมื่อสัญจรตลาดนัด
            </p>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[13px]">
              R2
            </div>
            <h4 className="font-bold text-slate-850 text-sm font-sans">REUSE - ใช้ซ้ำให้คุ้ม</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              นำขวดน้ำเก่า เศษยาง ถุงกระดาษมาทำศิลปะปลูกต้นไม้หรือใช้ซ้ำให้เกิดอายุขัยยาวนาน แทนการโยนทิ้งทันที
            </p>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[13px]">
              R3
            </div>
            <h4 className="font-bold text-slate-850 text-sm">RECYCLE - คัดแยกแปรรูป</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              แยกเศษอาหารเปียก ขวดแก้ว กระดาษ ลังกระดาษ และขยะอิเล็กทรอนิกส์ส่งจำหน่ายต่อหรือแปรรูปเป็นปุ๋ยอินทรีย์ชีวภาพ
            </p>
          </div>
        </div>
      </div>

      {/* 4. Environmental News, Announcements, and Campaigns in Yala */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Sparkles className="text-yellow-500 w-5 h-5" />
            ข่าวสารและกิจกรรมพัฒนาสิ่งแวดล้อมยะลา
          </h3>
          <span className="text-xs text-slate-400">อัปเดตสม่ำเสมอสัปดาห์ละครั้ง</span>
        </div>

        {fetchingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(id => (
              <div key={id} className="bg-slate-100 rounded-2xl h-64 animate-pulse flex items-center justify-center border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">กำลังเตรียมพิมพ์ข่าวสาร...</span>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center text-slate-450 italic text-xs">
            ไม่มีข่าวสารและกิจกรรมประกาศในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map(article => (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Article main graphic SVG */}
                  {article.imageUrl && (
                    <div className="w-full h-40 overflow-hidden relative border-b border-slate-100">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs">
                        {article.category}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      เผยแพร่เมื่อ: {article.date} | {article.location}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-emerald-700 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {article.content}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      alert(`--- รายละเอียดข่าวยะลารักษ์โลก ---\n\nหัวข้อ: ${article.title}\n\nสถานที่: ${article.location}\n\nเนื้อหา: ${article.content}`);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
                  >
                    อ่านประกาศฉบับเต็ม
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Inline search SVG fallback
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
