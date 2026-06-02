/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle, AlertCircle, FileText, User, Phone, Send, Eye, RefreshCw, Info } from 'lucide-react';
import { DistrictName, ComplaintCategory } from '../types';
import MapYalaInteractive from './MapYalaInteractive';

interface ReportFormProps {
  onSuccess: () => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'ขยะตกค้าง',
  'ขยะล้นถัง',
  'จุดทิ้งขยะผิดกฎหมาย',
  'ปัญหากลิ่นเหม็น',
  'ปัญหาน้ำเน่าเสีย',
  'อื่น ๆ'
];

const DISTRICTS: DistrictName[] = [
  'เมืองยะลา',
  'เบตง',
  'บันนังสตา',
  'ธารโต',
  'กาบัง',
  'กรงปินัง',
  'รามัน',
  'ยะหา'
];

// Stylized SVG pre-prepared illustrations for quicker reporting testing
const PRESET_IMAGES = [
  {
    name: 'กองขยะพลาสติกข้างทาง',
    color: '%23ef4444',
    url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23ef4444"/><circle cx="300" cy="180" r="70" fill="%23ffffff" opacity="0.2"/><path d="M150 320 Q 300 180 450 320 Z" fill="%23fca5a5" opacity="0.8"/><circle cx="210" cy="280" r="15" fill="%23b91c1c"/><circle cx="380" cy="290" r="18" fill="%23b91c1c"/><circle cx="300" cy="295" r="22" fill="%237f1d1d"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23ffffff">กองขยะหนาแน่นริมทางคัดแยก</text><text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ffffff">สะท้อนจุดทิ้งขยะขัดกฎหมาย</text></svg>'
  },
  {
    name: 'ถังขยะขยะล้นฝาปิด',
    color: '%23eab308',
    url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23eab308"/><rect x="250" y="160" width="100" height="150" rx="10" fill="%23854d0e"/><rect x="240" y="145" width="120" height="20" rx="5" fill="%23a16207"/><circle cx="300" cy="120" r="30" fill="%23ca8a04"/><path d="M 230 160 L 370 160 Q 300 240 230 160 Z" fill="%2378350f"/><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23ffffff">ถังขยะสุขอนามัยล้นระเบิด</text><text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ffffff">ขยะล้นถังรวบรวมตกค้าง</text></svg>'
  },
  {
    name: 'กลิ่นเหม็น / น้ำเน่าเสีย',
    color: '%2306b6d4',
    url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%2306b6d4"/><path d="M0 300 Q 150 200 300 300 T 600 300 L 600 400 L 0 400 Z" fill="%23164e63"/><path d="M0 330 Q 150 250 300 330 T 600 330 L 600 400 L 0 400 Z" fill="%23083344" opacity="0.6"/><circle cx="200" cy="150" r="40" fill="%23ffffff" opacity="0.1"/><text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23ffffff">ปัญหาน้ำเสียคราบน้ำมันสิ่งปฏิกูล</text><text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ffffff">กลิ่นรบกวนส่งผลกระทบต่อสิ่งมีชีวิต</text></svg>'
  }
];

export default function ReportForm({ onSuccess }: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'ขยะตกค้าง' as ComplaintCategory,
    description: '',
    district: 'เมืองยะลา' as DistrictName,
    detailLocation: '',
    reporterName: '',
    reporterPhone: ''
  });

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadOption, setUploadOption] = useState<'preset' | 'file'>('preset');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Sync image if preset is selected
  React.useEffect(() => {
    if (uploadOption === 'preset') {
      setImagePreview(PRESET_IMAGES[selectedPresetIndex].url);
    }
  }, [uploadOption, selectedPresetIndex]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle map selection
  const handleMapPinDropped = (lat: number, lng: number, district: DistrictName) => {
    setCoordinates({ lat, lng });
    setFormData(prev => ({
      ...prev,
      district: district
    }));
  };

  // Handle Photo upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ภาพมีขนาดใหญ่เกินกว่า 5MB กรุณาเลือกไฟล์รูปขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit report to server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.detailLocation.trim() || !formData.reporterName.trim() || !formData.reporterPhone.trim()) {
      setSubmissionStatus({
        success: false,
        message: 'กรุณากรอกข้อมูลจำเพาะและชื่อเบอร์ติดต่อกลับผู้ร้องเรียนให้ครบถ้วนถ้วน'
      });
      return;
    }

    if (!coordinates) {
      setSubmissionStatus({
        success: false,
        message: 'กรุณาระบุพิกัดพื้นที่เกิดเหตุบนแผนที่จังหวัดยะลาด้านบนก่อนส่งรายงาน'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          lat: coordinates.lat,
          lng: coordinates.lng,
          imageUrl: imagePreview
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSubmissionStatus({
          success: true,
          message: 'ส่งรายงานสำเร็จ! เรื่องร้องเรียนของคุณรหัส ' + resData.data.id + ' ได้ถูกบันทึกลงในฐานข้อมูลภาครัฐยะลาเรียบร้อยแล้ว'
        });
        
        // Reset inputs
        setFormData({
          title: '',
          category: 'ขยะตกค้าง',
          description: '',
          district: 'เมืองยะลา',
          detailLocation: '',
          reporterName: '',
          reporterPhone: ''
        });
        setCoordinates(null);
        setSelectedPresetIndex(0);
        setUploadOption('preset');
        setImagePreview(PRESET_IMAGES[0].url);

        // Notify parent to fetch new items
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setSubmissionStatus({
          success: false,
          message: resData.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ พยายามใหม่อีกครั่ง'
        });
      }
    } catch (error: any) {
      setSubmissionStatus({
        success: false,
        message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้: ' + error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="citizen_report_form_section" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Map selection column */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2">
          <MapYalaInteractive
            complaints={[]}
            selectedDistrict={formData.district}
            onSelectDistrict={() => {}}
            interactiveMode={true}
            onPinDropped={handleMapPinDropped}
            tempPickedPin={coordinates ? { ...coordinates, district: formData.district } : null}
          />
        </div>

        {/* Informative advice */}
        <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl p-5 text-emerald-800 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            คำแนะนำสำหรับแผนที่และการแจ้งพิกัด
          </h4>
          <ul className="text-xs space-y-2 list-disc pl-4 text-slate-600">
            <li>แตะอำเภอเป้าหมายบนแผนที่เพื่อปักหมุด โดยพิกัดจะถูกป้อนเข้า สว.เขต ทันที</li>
            <li>การแจ้งพิกัดที่ถูกต้อง ช่วยให้รถจัดเก็บขยะ อปท. เข้าถึงจุดหมายรวดเร็วขึ้น</li>
            <li>พื้นที่รับผิดชอบจะอ้างอิงตามเทศบาลตำบลและ อบต. ในจังหวัดยะลา</li>
          </ul>
        </div>
      </div>

      {/* Main submission form card */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <FileText className="text-emerald-600 w-6 h-6" />
            ฟอร์มแจ้งปัญหาขยะและสิ่งแวดล้อม
          </h2>
          <p className="text-xs text-slate-500 mt-1.5">
            กรุณากรอกข้อมูลตามรายละเอียดที่เกิดขึ้นจริง พลเมืองสามัคคีร่วมกันพัฒนาทำความสอาดจังหวัดยะลา
          </p>
        </div>

        {submissionStatus && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${
            submissionStatus.success 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-850' 
              : 'bg-rose-50 border border-rose-250 text-rose-850'
          }`}>
            {submissionStatus.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{submissionStatus.success ? 'ทำรายการเสร็จสิ้น' : 'ตรวจสอบข้อมูลอีกครั้ง'}</p>
              <p className="text-xs mt-1 leading-relaxed">{submissionStatus.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Issue General Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">
              องค์ประกอบของปัญหา
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-slate-600 mb-1.5 font-sans" htmlFor="title_input">
                  หัวข้อแจ้งปัญหา *
                </label>
                <input
                  id="title_input"
                  name="title"
                  type="text"
                  required
                  placeholder="เช่น ขยะถุงดำล้นโคนต้นโพธิ์ข้างมัสยิด, มีสัตว์เน่าเปื่อย"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="category_input">
                  หมวดหมู่ปัญหา *
                </label>
                <select
                  id="category_input"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="description_input">
                อธิบายข้อเท็จจริงและลักษณะปัญหา *
              </label>
              <textarea
                id="description_input"
                name="description"
                rows={4}
                required
                placeholder="กรุณาระบุรายละเอียดเพิ่มเติม เช่น ส่งผลกระทบต่อนักเรียนโรงเรียนข้างๆ, มีหมาคุ้ยเขี่ยขยะเหม็นเปรี้ยวมาแล้วกี่วัน หรือแอบกองปูนทับลานจราจร..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Spot and Area localization */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">
              ข้อมูลพิกัดและสถานที่
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="district_input">
                  อำเภอในจ.ยะลา *
                </label>
                <select
                  id="district_input"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="detail_location_input">
                  ที่ตั้งจุดพิกัดอย่างละเอียด (ระบุชื่อซอย ชุมชน หรือสถานที่เด่นใกล้เคียง) *
                </label>
                <input
                  id="detail_location_input"
                  name="detailLocation"
                  type="text"
                  required
                  placeholder="เช่น ข้างร้านสะดวกซื้อสาขายะหา ซอย 3 ตรงข้ามเสาไฟฟ้าแรงสูง"
                  value={formData.detailLocation}
                  onChange={handleInputChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-250 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="text-rose-500 w-4 h-4" />
                <span>พิกัด GPS:</span>
                {coordinates ? (
                  <span className="font-mono font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Lat {coordinates.lat}, Lng {coordinates.lng}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium italic">ยังไม่ปักหมุด (โปรดเลือกพิกัดบนแผนที่ยะลาซ้ายมือ)</span>
                )}
              </div>
              {coordinates && (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  ล็อกพิกัดแล้ว
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Attachment Photo selection */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">
              ภาพถ่ายสภาพปัญหาขยะสอดคล้อง
            </h3>

            {/* Toggle mock versus raw fileupload to ensure 100% test proofing in sandboxes */}
            <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1.5 max-w-sm">
              <button
                type="button"
                onClick={() => setUploadOption('preset')}
                className={`flex-1 text-[11px] font-medium py-1.5 px-3 rounded-md transition-colors ${
                  uploadOption === 'preset' 
                    ? 'bg-white shadow-sm text-emerald-800 font-semibold' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                เลือกภาพปัญหาประกอบ (รวดเร็ว)
              </button>
              <button
                type="button"
                onClick={() => setUploadOption('file')}
                className={`flex-1 text-[11px] font-medium py-1.5 px-3 rounded-md transition-colors ${
                  uploadOption === 'file' 
                    ? 'bg-white shadow-sm text-emerald-800 font-semibold' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                อัปโหลดรูปภาพใบจริง
              </button>
            </div>

            {uploadOption === 'preset' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setSelectedPresetIndex(idx)}
                      className={`text-[10px] text-left p-2.5 rounded-xl border transition-all ${
                        selectedPresetIndex === idx
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/10'
                          : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="w-full h-8 rounded-lg mb-1.5 overflow-hidden filter grayscale-[40%]">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="font-semibold block truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 hover:border-slate-350 rounded-xl p-5 bg-slate-50/50 flex flex-col items-center justify-center text-center transition-all">
                <input
                  id="image_attachment_uploader"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label 
                  htmlFor="image_attachment_uploader" 
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2 group w-full"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm text-slate-500 group-hover:text-emerald-600 group-hover:scale-105 transition-all">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">
                    คลิกเพื่อเปิดกล้องมือถือ หรือเลือกไฟล์รูปภาพปัญหาขยะประกอบ
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (นามสกุลไฟล์ JPG, PNG รองรับขนาดไม่เกิน 5MB)
                  </span>
                </label>
              </div>
            )}

            {imagePreview && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-12 rounded overflow-hidden border border-slate-250 flex-shrink-0 bg-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">รูปภาพปัญหาที่เตรียมส่ง</p>
                    <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 mt-0.5">
                      <Eye className="w-3 h-3" />
                      มีภาพประกอบเพื่อเข้าตรวจเรียบร้อย
                    </p>
                  </div>
                </div>
                {uploadOption === 'file' && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      const uploader = document.getElementById('image_attachment_uploader') as HTMLInputElement;
                      if (uploader) uploader.value = '';
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 hover:underline px-2"
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Reporter contact information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">
              ประวัติยืนยันตัวตนผู้ส่งคำร้อง
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="reporter_name_input">
                  ชื่อ-สกุล จริงผู้ร้องเรียน *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="reporter_name_input"
                    name="reporterName"
                    type="text"
                    required
                    placeholder="เช่น สมเกียรติ ยะลารุ่งเรือง"
                    value={formData.reporterName}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="reporter_phone_input">
                  หมายเลขโทรศัพท์ติดต่อกลับ (ใช้สำหรับตรวจดูประวัติและติดต่อ) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="reporter_phone_input"
                    name="reporterPhone"
                    type="tel"
                    required
                    placeholder="เช่น 0812345678"
                    value={formData.reporterPhone}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-450 italic mt-1 leading-relaxed">
              *ข้อมูลส่วนบุคคลของท่านจะถูกเก็บไว้เป็นความลับตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ใช้เฉพาะสำหรับการติดตามและรายงานผลการแก้ไขปัญหาสิ่งแวดล้อมโดยอปท. เท่านั้น
            </p>
          </div>

          {/* Form Action Submit Button */}
          <div className="pt-2">
            <button
              id="citizen_submit_complaint_btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/10 hover:shadow-emerald-600/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  กำลังลงทะเบียนรายงานเข้าระบบส่วนกลาง...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ส่งเรื่องรายงาน ปัญหาขยะและสิ่งแวดล้อมยะลา
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
