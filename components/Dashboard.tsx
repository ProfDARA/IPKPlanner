import React from 'react';
import { Course, GradeDefinition } from '../types';
import { GraduationCap, BookOpen, Calculator } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  gradingScale: GradeDefinition[];
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, gradingScale }) => {
  // Create a quick lookup map for values
  const gradeMap = React.useMemo(() => {
    return gradingScale.reduce((acc, curr) => {
      if (curr.enabled) acc[curr.label] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }, [gradingScale]);

  const calculateStats = () => {
    let totalSks = 0;
    let totalPoints = 0;
    let completedSks = 0;

    courses.forEach(c => {
      // Logic: Only count courses that have a valid grade (not '-' or 'BL')
      if (c.includedInGpa) {
        // If the grade is in our map (enabled), use it. otherwise ignore (or treat as 0? usually ignore if disabled)
        const val = gradeMap[c.grade];
        if (val !== undefined) {
            totalPoints += val * c.sks;
            completedSks += c.sks;
        }
      }
      totalSks += c.sks; // Total SKS planned/taken
    });

    const ipk = completedSks > 0 ? (totalPoints / completedSks).toFixed(2) : '0.00';

    return { ipk, completedSks, totalSks };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-3 mb-2 opacity-90">
          <GraduationCap className="w-5 h-5" />
          <span className="font-medium text-sm uppercase tracking-wider">IPK Saat Ini</span>
        </div>
        <div className="text-4xl font-bold tracking-tight">{stats.ipk}</div>
        <div className="mt-2 text-indigo-100 text-sm">Indeks Prestasi Kumulatif</div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-slate-500">
          <BookOpen className="w-5 h-5" />
          <span className="font-medium text-sm uppercase tracking-wider">SKS Lulus</span>
        </div>
        <div className="text-3xl font-bold text-slate-800">{stats.completedSks}</div>
        <div className="mt-2 text-slate-400 text-sm">SKS yang sudah dinilai</div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-slate-500">
          <Calculator className="w-5 h-5" />
          <span className="font-medium text-sm uppercase tracking-wider">Total SKS Terambil</span>
        </div>
        <div className="text-3xl font-bold text-slate-800">{stats.totalSks}</div>
        <div className="mt-2 text-slate-400 text-sm">Termasuk mata kuliah rencana</div>
      </div>
    </div>
  );
};