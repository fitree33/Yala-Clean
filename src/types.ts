/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComplaintHistoryItem {
  status: 'pending' | 'processing' | 'resolved';
  timestamp: string;
  note: string;
}

export type DistrictName = 
  | 'เมืองยะลา'
  | 'เบตง'
  | 'บันนังสตา'
  | 'ธารโต'
  | 'กาบัง'
  | 'กรงปินัง'
  | 'รามัน'
  | 'ยะหา';

export type ComplaintCategory =
  | 'ขยะตกค้าง'
  | 'ขยะล้นถัง'
  | 'จุดทิ้งขยะผิดกฎหมาย'
  | 'ปัญหากลิ่นเหม็น'
  | 'ปัญหาน้ำเน่าเสีย'
  | 'อื่น ๆ';

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  district: DistrictName;
  detailLocation: string;
  reporterName: string;
  reporterPhone: string;
  lat: number;
  lng: number;
  status: 'pending' | 'processing' | 'resolved';
  imageUrl: string; // Base64 data or pre-seeded images
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  history: ComplaintHistoryItem[];
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string;
  imageUrl: string;
  category: 'กิจกรรม' | 'ประชาสัมพันธ์' | 'ความรู้';
}

export interface EnvironmentalStats {
  totalCount: number;
  pendingCount: number;
  processingCount: number;
  resolvedCount: number;
  districtCounts: Record<DistrictName, number>;
  categoryCounts: Record<ComplaintCategory, number>;
}
