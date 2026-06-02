/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sprout, FileText, Search, Map, Shield, Calendar, MapPin, Tag, 
  HelpCircle, Sparkles, HeartPulse, Recycle, RefreshCw, Smartphone
} from 'lucide-react';
import { Complaint, NewsArticle, DistrictName } from './types';
import HomeOverview from './components/HomeOverview';
import ReportForm from './components/ReportForm';
import StatusTracker from './components/StatusTracker';
import MapYalaInteractive from './components/MapYalaInteractive';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'report' | 'tracker' | 'map' | 'admin'>('home');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Map district selection state on widescreen map view
  const [mapDistrict, setMapDistrict] = useState<DistrictName | 'All'>('All');

  // Load complaints and news from backend on mount
  useEffect(() => {
    fetchComplaints();
    fetchNews();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const response = await fetch('/api/complaints');
      if (response.ok) {
        const body = await response.json();
        if (body.success) {
          setComplaints(body.data);
        }
      }
    } catch (err) {
      console.error('Failed to stream complaints database:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const response = await fetch('/api/news');
      if (response.ok) {
        const body = await response.json();
        if (body.success) {
          setNews(body.data);
        }
      }
    } catch (err) {
      console.error('Failed to stream news announcements:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  // Admin: Update status endpoint handler
  const handleUpdateComplaintStatus = async (
    id: string, 
    status: Complaint['status'], 
    adminComment: string,
    historyNote?: string
  ): Promise<boolean> => {
    try {
      setSyncStatus('กำลังส่งอัปเดตสลักหลัง...');
      const response = await fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminComment,
          note: historyNote
        })
      });

      if (response.ok) {
        const body = await response.json();
        if (body.success) {
          // Instantly patch state to ensure smooth UI animation
          setComplaints(prev => prev.map(c => c.id === id ? body.data : c));
          setSyncStatus('บันทึกเรียบร้อย!');
          setTimeout(() => setSyncStatus(null), 1000);
          return true;
        }
      }
      setSyncStatus('เกิดข้อผิดพลาดในการแก้');
      setTimeout(() => setSyncStatus(null), 2000);
      return false;
    } catch (error) {
      console.error('Error reporting status to api route:', error);
      setSyncStatus('ขาดการเชื่อมต่อเซิร์ฟเวอร์');
      setTimeout(() => setSyncStatus(null), 2000);
      return false;
    }
  };

  // Admin: Delete complaint handler
  const handleDeleteComplaint = async (id: string): Promise<boolean> => {
    try {
      setSyncStatus('กำลังลบข้อมูลปฏิกูล...');
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const body = await response.json();
        if (body.success) {
          setComplaints(prev => prev.filter(c => c.id !== id));
          setSyncStatus('ลบเรียบร้อย!');
          setTimeout(() => setSyncStatus(null), 1000);
          return true;
        }
      }
      setSyncStatus('ไม่สามารถเข้าลบได้');
      setTimeout(() => setSyncStatus(null), 2000);
      return false;
    } catch (error) {
      console.error('Failed to delete element:', error);
      setSyncStatus('ขาดการเชื่อมต่อเซิร์ฟเวอร์');
      setTimeout(() => setSyncStatus(null), 2000);
      return false;
    }
  };

  // Handle successful form submission
  const handleFormSubmissionCallback = () => {
    fetchComplaints(); // Reload live state
    setActiveTab('tracker'); // Jump directly to tracker tab to see history
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-emerald-200">
      
      {/* 1. Global Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/10 hover:scale-105 transition-transform">
              <Sprout className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent flex items-center gap-1.5 leading-none">
                Yala Clean City
              </span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-0.5 uppercase">
                ระบบจัดการขยะและสิ่งแวดล้อมยะลา
              </p>
            </div>
          </div>

          {/* Navigation links styled in balanced green-blue hues */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            <button
              id="nav_tab_home"
              onClick={() => setActiveTab('home')}
              className={`text-xs md:text-sm px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              หน้าแรก
            </button>

            <button
              id="nav_tab_report"
              onClick={() => setActiveTab('report')}
              className={`text-xs md:text-sm px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              แจ้งปัญหาขยะ
            </button>

            <button
              id="nav_tab_tracker"
              onClick={() => setActiveTab('tracker')}
              className={`text-xs md:text-sm px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'tracker'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              ติดตามสถานะ
            </button>

            <button
              id="nav_tab_map"
              onClick={() => setActiveTab('map')}
              className={`text-xs md:text-sm px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              แผนที่สิ่งแวดล้อม
            </button>

            <button
              id="nav_tab_admin"
              onClick={() => setActiveTab('admin')}
              className={`text-xs md:text-sm px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              เจ้าหน้าที่
            </button>
          </nav>
        </div>
      </header>

      {/* Synchronized status overlay toasts */}
      {syncStatus && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-slideUp">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span className="font-medium">{syncStatus}</span>
        </div>
      )}

      {/* 2. Primary Sub-View Controller Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* Tab 1: Home dashboard */}
        {activeTab === 'home' && (
          <HomeOverview
            complaints={complaints}
            news={news}
            fetchingNews={loadingNews}
            onNavigateToReport={() => setActiveTab('report')}
            onNavigateToTracker={() => setActiveTab('tracker')}
            onNavigateToMap={() => setActiveTab('map')}
          />
        )}

        {/* Tab 2: Report Registration Form */}
        {activeTab === 'report' && (
          <ReportForm onSuccess={handleFormSubmissionCallback} />
        )}

        {/* Tab 3: Status Tracking history logs */}
        {activeTab === 'tracker' && (
          <StatusTracker complaints={complaints} loading={loadingComplaints} />
        )}

        {/* Tab 4: Spatial Pinboard Map & Interactive Overlays */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Widescreen Interactive Map Column */}
            <div className="xl:col-span-6 space-y-4">
              <div className="bg-slate-100 rounded-3xl p-1.5">
                <MapYalaInteractive
                  complaints={complaints}
                  selectedDistrict={mapDistrict}
                  onSelectDistrict={(dist) => setMapDistrict(dist)}
                />
              </div>
            </div>

            {/* List and Details of issues inside selected district */}
            <div className="xl:col-span-6 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="font-bold text-slate-850 text-base flex items-center gap-2">
                    <MapPin className="text-emerald-600 w-5 h-5" />
                    รายการร้องเรียนในพื้นที่: {mapDistrict === 'All' ? 'ทุกอำเภอในจังหวัดยะลา' : mapDistrict}
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">
                    คลิกเลือกขอบเขตเชิงพื้นที่บนแผนที่ซ้ายมือ เพื่อคัดกรองพิกัดขยะตกค้างและจุดสางงานของ อปท. ประจำถิ่น
                  </p>
                </div>

                {/* Listing */}
                <div className="space-y-4.5 max-h-[450px] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = complaints.filter(c => mapDistrict === 'All' || c.district === mapDistrict);
                    if (filtered.length === 0) {
                      return (
                        <p className="text-xs text-slate-450 italic text-center py-10">
                          ไม่พบประวัติปัญหาขยะหรือมลภาวะในสาขาเขตพื้นที่อำเภอนี้
                        </p>
                      );
                    }

                    return filtered.map((c) => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setActiveTab('tracker');
                        }}
                        className="p-3.5 bg-slate-50 hover:bg-emerald-50/15 border border-slate-200 hover:border-emerald-250 rounded-xl transition-all cursor-pointer flex gap-3.5"
                      >
                        {c.imageUrl && (
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold text-slate-400">ID: {c.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              c.status === 'resolved' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : c.status === 'processing' 
                                  ? 'bg-sky-100 text-sky-800' 
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {c.status === 'resolved' ? 'แก้ไขแล้ว' : c.status === 'processing' ? 'กำลังทำ' : 'รอดำเนินงาน'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 truncate">{c.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-tight line-clamp-1">{c.description}</p>
                          <p className="text-[10px] text-slate-400 truncate">📍 {c.detailLocation}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Administrative management platform */}
        {activeTab === 'admin' && (
          <AdminPanel
            complaints={complaints}
            loading={loadingComplaints}
            onRefresh={fetchComplaints}
            onUpdateStatus={handleUpdateComplaintStatus}
            onDeleteComplaint={handleDeleteComplaint}
          />
        )}

      </main>

      {/* 3. Footer Area styling */}
      <footer className="bg-white border-t border-slate-150 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                Y
              </span>
              <div>
                <span className="text-sm font-bold text-slate-800 block">Yala Clean City บูรณาการภาพกว้าง</span>
                <span className="text-[10px] text-slate-450 block">องค์การบริหารส่วนจังหวัดยะลา และ ท้องถิ่นป้องภัยสิ่งแวดล้อม</span>
              </div>
            </div>

            <div className="flex gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                ส่งเสริมสุขภาพอนามัย
              </span>
              <span className="flex items-center gap-1">
                <Recycle className="w-4 h-4 text-emerald-500" />
                คัดแยกขัดขยะเป็นประโยชน์
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
            <p>© 2026 Yala Clean City. สงวนลิขสิทธิ์ความปลอดภัยข้อมูลสิทธิ์ของประชาชน ยะลาเมืองสะอาดน่าอยู่</p>
            <p>ระบบแจ้งแก้ไขเพื่อชุมชนเขียวสะอาดตา พลังสามัคคี อปท. จังหวัดยะลา</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
