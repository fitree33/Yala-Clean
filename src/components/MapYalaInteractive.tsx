/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Info, ArrowUpRight, Filter } from 'lucide-react';
import { Complaint, DistrictName } from '../types';

interface MapYalaInteractiveProps {
  complaints: Complaint[];
  selectedDistrict: DistrictName | 'All';
  onSelectDistrict: (district: DistrictName | 'All') => void;
  interactiveMode?: boolean; // If true, allows clicking to drop a pin on coordinates
  onPinDropped?: (lat: number, lng: number, calculatedDistrict: DistrictName) => void;
  tempPickedPin?: { lat: number; lng: number; district: DistrictName } | null;
}

// Simple coordinates mapping based on Yala districts for SVG mapping
// Yala coordinates range roughly around: Lat 5.5 to 6.7, Lng 100.9 to 101.5
interface DistrictPolygon {
  name: DistrictName;
  path: string; // SVG path
  centerText: { x: number; y: number };
  baseLat: number;
  baseLng: number;
  color: string;
}

const DISTRICTS_GEOM: DistrictPolygon[] = [
  {
    name: 'เมืองยะลา',
    path: 'M 130 30 L 190 20 L 210 60 L 180 100 L 125 90 L 115 55 Z',
    centerText: { x: 160, y: 55 },
    baseLat: 6.5412,
    baseLng: 101.2805,
    color: 'fill-emerald-100 hover:fill-emerald-200 stroke-emerald-600'
  },
  {
    name: 'รามัน',
    path: 'M 190 20 L 250 40 L 260 90 L 215 130 L 180 100 L 210 60 Z',
    centerText: { x: 220, y: 75 },
    baseLat: 6.4802,
    baseLng: 101.3912,
    color: 'fill-cyan-100 hover:fill-cyan-200 stroke-cyan-600'
  },
  {
    name: 'ยะหา',
    path: 'M 80 70 L 125 90 L 140 145 L 85 160 L 70 120 Z',
    centerText: { x: 105, y: 120 },
    baseLat: 6.4552,
    baseLng: 101.1298,
    color: 'fill-teal-100 hover:fill-teal-200 stroke-teal-600'
  },
  {
    name: 'กรงปินัง',
    path: 'M 140 100 L 180 100 L 195 145 L 145 155 Z',
    centerText: { x: 165, y: 125 },
    baseLat: 6.3812,
    baseLng: 101.2721,
    color: 'fill-sky-100 hover:fill-sky-200 stroke-sky-600'
  },
  {
    name: 'กาบัง',
    path: 'M 30 90 L 80 70 L 70 120 L 85 160 L 40 170 Z',
    centerText: { x: 60, y: 130 },
    baseLat: 6.4215,
    baseLng: 101.0112,
    color: 'fill-indigo-100 hover:fill-indigo-200 stroke-indigo-600'
  },
  {
    name: 'บันนังสตา',
    path: 'M 85 160 L 145 155 L 195 145 L 215 130 L 230 180 L 180 250 L 120 230 L 95 190 Z',
    centerText: { x: 155, y: 195 },
    baseLat: 6.2654,
    baseLng: 101.2641,
    color: 'fill-green-100 hover:fill-green-200 stroke-green-600'
  },
  {
    name: 'ธารโต',
    path: 'M 120 230 L 180 250 L 210 240 L 200 320 L 130 330 L 110 280 Z',
    centerText: { x: 155, y: 285 },
    baseLat: 6.0125,
    baseLng: 101.1921,
    color: 'fill-lime-100 hover:fill-lime-200 stroke-lime-600'
  },
  {
    name: 'เบตง',
    path: 'M 130 330 L 200 320 L 240 375 L 210 440 L 135 450 L 100 400 L 105 350 Z',
    centerText: { x: 165, y: 390 },
    baseLat: 5.7725,
    baseLng: 101.0253,
    color: 'fill-sky-100 hover:fill-sky-200 stroke-blue-600'
  }
];

export default function MapYalaInteractive({
  complaints,
  selectedDistrict,
  onSelectDistrict,
  interactiveMode = false,
  onPinDropped,
  tempPickedPin
}: MapYalaInteractiveProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictName | null>(null);

  // Calculate complaint counts per district
  const getDistrictCount = (name: DistrictName) => {
    return complaints.filter(c => c.district === name).length;
  };

  const getDistrictDensityColor = (name: DistrictName, isSelected: boolean) => {
    const count = getDistrictCount(name);
    if (isSelected) return 'fill-emerald-500 text-white';
    if (count === 0) return 'fill-gray-50 stroke-gray-300';
    if (count <= 1) return 'fill-emerald-100 stroke-emerald-500';
    if (count <= 3) return 'fill-emerald-200 stroke-emerald-600';
    return 'fill-emerald-300 stroke-emerald-700 font-bold';
  };

  // Turn relative SVG click coordinates into a simulated latitude and longitude within the clicked district
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactiveMode || !onPinDropped) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert DOM pixels to SVG coordinates (viewBox 0 0 280 470)
    const svgX = (x / rect.width) * 280;
    const svgY = (y / rect.height) * 470;

    // Find if the click lies inside/near any district
    // We'll estimate based on closest center for simplification
    let closestDist = DISTRICTS_GEOM[0];
    let minDist = Infinity;

    DISTRICTS_GEOM.forEach(dist => {
      const dx = svgX - dist.centerText.x;
      const dy = svgY - dist.centerText.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) {
        minDist = d;
        closestDist = dist;
      }
    });

    // Simulate realistic latitude & longitude based on offset from district base center
    const percentOffsetX = (svgX - closestDist.centerText.x) / 100;
    const percentOffsetY = (closestDist.centerText.y - svgY) / 100; // Invert latitude axis

    const finalLat = parseFloat((closestDist.baseLat + percentOffsetY * 0.1).toFixed(4));
    const finalLng = parseFloat((closestDist.baseLng + percentOffsetX * 0.1).toFixed(4));

    onPinDropped(finalLat, finalLng, closestDist.name);
  };

  return (
    <div id="yala_interactive_map_root" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <MapPin className="text-emerald-600 w-5 h-5 animate-pulse" />
            {interactiveMode ? 'แผนที่ยะลา: คลิกเลือกพิกัดแจ้งปัญหา' : 'แผนที่สถิติปัญหาสิ่งแวดล้อม'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {interactiveMode 
              ? 'แตะบริเวณใดก็ได้บนแผนที่อำเภอเพื่อระบุจุดพิกัดที่จะส่งเจ้าหน้าที่สิ่งแวดล้อม' 
              : 'แสดงความหนาแน่นเชิงพื้นที่ คลิกเลือกอำเภอเพื่อกรองดูประวัติ'}
          </p>
        </div>

        {/* Clear filter */}
        {!interactiveMode && selectedDistrict !== 'All' && (
          <button
            id="clear_map_district_filter_btn"
            onClick={() => onSelectDistrict('All')}
            className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            ล้างตัวกรอง ({selectedDistrict})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Map of Yala */}
        <div className="lg:col-span-7 flex justify-center relative bg-slate-50 rounded-xl p-4 overflow-hidden border border-slate-100">
          <svg
            id="yala_interactive_svg_map"
            viewBox="0 0 280 470"
            className="w-full max-w-[285px] h-auto cursor-pointer drop-shadow-md select-none transition-all duration-300"
            onClick={handleMapClick}
          >
            {/* Districts Path */}
            {DISTRICTS_GEOM.map((dist) => {
              const count = getDistrictCount(dist.name);
              const isSelected = selectedDistrict === dist.name;
              const isHovered = hoveredDistrict === dist.name;
              
              let pathColorClass = getDistrictDensityColor(dist.name, isSelected);
              if (isHovered && !isSelected) {
                pathColorClass = 'fill-emerald-200 stroke-emerald-600';
              }

              return (
                <g 
                  key={dist.name}
                  onMouseEnter={() => setHoveredDistrict(dist.name)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  onClick={() => {
                    if (!interactiveMode) {
                      onSelectDistrict(isSelected ? 'All' : dist.name);
                    }
                  }}
                >
                  <path
                    d={dist.path}
                    className={`${pathColorClass} stroke-[2.5] transition-all duration-200 ease-in-out`}
                  />
                  {/* District Text Name */}
                  <text
                    x={dist.centerText.x}
                    y={dist.centerText.y}
                    className={`font-semibold pointer-events-none text-[10px] text-center select-none ${
                      isSelected ? 'fill-emerald-950 font-bold text-[11px]' : 'fill-slate-800'
                    }`}
                    textAnchor="middle"
                  >
                    {dist.name}
                  </text>
                  <text
                    x={dist.centerText.x}
                    y={dist.centerText.y + 11}
                    className="font-mono text-[9px] pointer-events-none opacity-80 fill-slate-600 select-none"
                    textAnchor="middle"
                  >
                    ({count} เรื่อง)
                  </text>
                </g>
              );
            })}

            {/* Static pins layer for complaints on map (if not interactive mode) */}
            {!interactiveMode && complaints.map((comp) => {
              // Map realistic latitude & longitude boundaries back onto SVG pixels (0 0 280 470)
              // Lat range: 5.7 to 6.6
              // Lng range: 100.9 to 101.5
              const mapWidth = 280;
              const mapHeight = 470;
              
              const minLat = 5.6;
              const maxLat = 6.7;
              const minLng = 100.85;
              const maxLng = 101.55;

              const x = ((comp.lng - minLng) / (maxLng - minLng)) * mapWidth;
              const y = mapHeight - ((comp.lat - minLat) / (maxLat - minLat)) * mapHeight;

              // Check if district is filtered
              const isFiltered = selectedDistrict === 'All' || selectedDistrict === comp.district;
              if (!isFiltered) return null;

              // Color coordinate status
              let pinBg = 'fill-rose-500';
              if (comp.status === 'processing') pinBg = 'fill-sky-500';
              if (comp.status === 'resolved') pinBg = 'fill-emerald-500';

              return (
                <g key={comp.id} className="transition-all duration-300">
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    className={`${pinBg} opacity-30 animate-ping`}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className={`${pinBg} stroke-white stroke-1`}
                  />
                </g>
              );
            })}

            {/* Simulated Pin drop for interactive mode */}
            {interactiveMode && tempPickedPin && (
              <g className="transition-all duration-250">
                {/* SVG estimates from Coordinates */}
                {(() => {
                  const minLat = 5.6;
                  const maxLat = 6.7;
                  const minLng = 100.85;
                  const maxLng = 101.55;

                  const x = ((tempPickedPin.lng - minLng) / (maxLng - minLng)) * 280;
                  const y = 470 - ((tempPickedPin.lat - minLat) / (maxLat - minLat)) * 470;

                  return (
                    <>
                      <circle cx={x} cy={y} r="14" className="fill-rose-600 opacity-25 animate-ping" />
                      <path 
                        d={`M ${x} ${y} m 0 -13 c -4.5 0 -8 3.5 -8 8 c 0 5 8 13 8 13 s 8 -8 8 -13 c 0 -4.5 -3.5 -8 -8 -8 z`} 
                        className="fill-rose-600 stroke-white stroke-1"
                      />
                      <circle cx={x} cy={y - 8} r="3" className="fill-white" />
                    </>
                  );
                })()}
              </g>
            )}
          </svg>

          {/* District Name Floating tooltip */}
          {hoveredDistrict && (
            <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 pointer-events-none border border-slate-800">
              <span className="font-semibold">{hoveredDistrict}</span>
              <span className="text-emerald-400">({getDistrictCount(hoveredDistrict)} เรื่องร้องเรียน)</span>
            </div>
          )}
        </div>

        {/* Legend / Statistics sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">คำอธิบายความหนาแน่น</h4>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-emerald-300 border border-emerald-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 font-medium">หนาแน่นสูง (&gt; 3 เรื่อง)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400 flex-shrink-0" />
                <span className="text-xs text-slate-700 font-medium">หนาแน่นปานกลาง (1-3 เรื่อง)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-gray-50 border border-slate-300 flex-shrink-0" />
                <span className="text-xs text-slate-600 font-medium">ไม่มีการแจ้งปัญหา (0 เรื่อง)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">อำเภอยะลา ทั้งหมด</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {DISTRICTS_GEOM.map(d => {
                const count = getDistrictCount(d.name);
                const isSelected = selectedDistrict === d.name;
                return (
                  <button
                    key={d.name}
                    onClick={() => {
                      if (!interactiveMode) {
                        onSelectDistrict(isSelected ? 'All' : d.name);
                      }
                    }}
                    className={`p-2 rounded-lg text-left transition-colors flex justify-between items-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isSelected ? 'bg-emerald-750 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {interactiveMode && tempPickedPin && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-semibold text-rose-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                พิกัดที่ระบุสำเร็จ
              </span>
              <p className="text-slate-700">
                <b className="text-rose-900">อำเภอ:</b> {tempPickedPin.district} <br />
                <b className="text-rose-900">ละติจูด (Lat):</b> {tempPickedPin.lat} <br />
                <b className="text-rose-900">ลองจิจูด (Lng):</b> {tempPickedPin.lng}
              </p>
              <p className="text-[10px] text-slate-500 italic mt-1">
                *ระบบล็อกพิกัดอัตโนมัติบนแบบฟอร์มแล้ว คุณสามารถกรอกรายละเอียดต่อด้านล่างได้ทันที
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
