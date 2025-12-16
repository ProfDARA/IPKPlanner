import React, { useMemo } from 'react';
import { Course, GradeDefinition } from '../types';
import { TrendingUp } from 'lucide-react';

interface GpaChartProps {
  courses: Course[];
  gradingScale: GradeDefinition[];
  targetGPA: number;
  projectedIPS: number | null;
}

export const GpaChart: React.FC<GpaChartProps> = ({ courses, gradingScale, targetGPA, projectedIPS }) => {
  
  const { historyData, maxSem } = useMemo(() => {
    const gradeMap = gradingScale.reduce((acc, curr) => {
      if (curr.enabled) acc[curr.label] = curr.value;
      return acc;
    }, {} as Record<string, number>);

    const semMap = new Map<number, { points: number, sks: number }>();
    let maxS = 0;

    // Group by semester
    courses.forEach(c => {
      if(c.semester > maxS) maxS = c.semester;
      if (!c.includedInGpa) return;
      
      const val = gradeMap[c.grade];
      if (val === undefined) return;

      const current = semMap.get(c.semester) || { points: 0, sks: 0 };
      semMap.set(c.semester, {
        points: current.points + (val * c.sks),
        sks: current.sks + c.sks
      });
    });

    const data: { sem: number; ips: number }[] = [];
    // Ensure we have data points for 1 to Max
    // If a semester is skipped (e.g. cuti), ips is 0
    for(let i=1; i<=Math.max(maxS, 1); i++) {
        const d = semMap.get(i);
        const ips = d && d.sks > 0 ? d.points / d.sks : 0;
        data.push({ sem: i, ips });
    }

    return { historyData: data, maxSem: Math.max(maxS, 1) };
  }, [courses, gradingScale]);

  // Dimensions
  const height = 180;
  const width = 300;
  const padding = 20;
  const chartH = height - padding * 2;
  const chartW = width - padding * 2;
  
  // Decide X Axis Range: At least 8, or maxSem + 2 (for projection), whichever is bigger
  const projectedCount = projectedIPS !== null ? 2 : 0; // Show 2 future semesters if projection valid
  const totalSemestersToShow = Math.max(8, maxSem + projectedCount);

  // Scaling
  const getX = (semIndex0: number) => padding + (semIndex0 / (totalSemestersToShow - 1)) * chartW;
  const getY = (val: number) => padding + chartH - (Math.min(val, 4.0) / 4.0) * chartH;

  // Paths
  // 1. Actual IPS Path
  const ipsActualPath = historyData.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.ips)}`
  ).join(' ');

  // 2. Projected Path
  // Start from the last actual point
  let projectedPath = '';
  if (projectedIPS !== null && historyData.length > 0) {
     const lastActual = historyData[historyData.length - 1];
     const startX = getX(historyData.length - 1);
     const startY = getY(lastActual.ips);
     
     // Visual connection from last actual to projection
     projectedPath = `M ${startX} ${startY} `;
     
     // Draw line to next few semesters
     for(let i=1; i<=3; i++) { // Project 3 semesters ahead visually
        if (historyData.length + i - 1 < totalSemestersToShow) {
           projectedPath += `L ${getX(historyData.length + i - 1)} ${getY(projectedIPS)} `;
        }
     }
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
       <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-slate-700">Grafik & Proyeksi</h4>
      </div>
      
      <div className="relative w-full aspect-video">
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(val => (
               <React.Fragment key={val}>
                 <line 
                   x1={padding} y1={getY(val)} 
                   x2={width - padding} y2={getY(val)} 
                   stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4"
                 />
                 <text x={padding - 5} y={getY(val) + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
                   {val}
                 </text>
               </React.Fragment>
            ))}

            {/* X Axis Labels */}
            {Array.from({ length: totalSemestersToShow }).map((_, i) => (
               <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" fontSize="8" fill="#94a3b8">
                 {i+1}
               </text>
            ))}

            {/* Target GPA Line (Green Dashed) */}
            <line 
               x1={padding} y1={getY(targetGPA)}
               x2={width - padding} y2={getY(targetGPA)}
               stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2"
            />
            <text x={width - padding} y={getY(targetGPA) - 4} textAnchor="end" fontSize="8" fill="#10b981" fontWeight="bold">Target</text>

            {/* Projected IPS Line (Orange Dashed) */}
            {projectedIPS !== null && (
               <path d={projectedPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
            )}

            {/* Actual IPS Line (Blue Solid) */}
            <path d={ipsActualPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
            
            {/* Dots Actual */}
            {historyData.map((d, i) => d.ips > 0 && (
               <circle key={i} cx={getX(i)} cy={getY(d.ips)} r="2.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
            ))}

            {/* Dot Projected (Just one to show level) */}
             {projectedIPS !== null && historyData.length < totalSemestersToShow && (
                <circle cx={getX(historyData.length)} cy={getY(projectedIPS)} r="2.5" fill="#f59e0b" stroke="white" strokeWidth="1" />
             )}

         </svg>
      </div>
      
      <div className="flex items-center justify-center gap-3 mt-2 text-[10px]">
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-slate-600">IPS Aktual</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full border border-dashed border-white"></div>
            <span className="text-slate-600">IPS Saran</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-500"></div>
            <span className="text-slate-600">Target IPK</span>
         </div>
      </div>
    </div>
  );
};