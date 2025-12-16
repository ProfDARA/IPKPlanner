import React from 'react';
import { Course, GradeDefinition } from '../types';
import { GraduationCap, BookOpen, Calculator, BarChart3 } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  gradingScale: GradeDefinition[];
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, gradingScale }) => {
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
      if (c.includedInGpa) {
        const val = gradeMap[c.grade];
        if (val !== undefined) {
            totalPoints += val * c.sks;
            completedSks += c.sks;
        }
      }
      totalSks += c.sks; 
    });

    const ipk = completedSks > 0 ? (totalPoints / completedSks).toFixed(2) : '0.00';
    return { ipk, completedSks, totalSks };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Primary Card - IPK */}
      <div className="bg-white rounded-md p-5 border-l-4 border-l-blue-700 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">IPK Saat Ini</p>
           <p className="text-4xl font-bold text-slate-800 tracking-tight">{stats.ipk}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-md">
           <GraduationCap className="w-8 h-8 text-blue-700" />
        </div>
      </div>

      {/* Secondary Card - SKS Lulus */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex items-center justify-between">
         <div>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SKS Lulus</p>
           <p className="text-3xl font-bold text-slate-700">{stats.completedSks}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-md">
           <BookOpen className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* Tertiary Card - Total SKS */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex items-center justify-between">
         <div>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Rencana SKS</p>
           <p className="text-3xl font-bold text-slate-700">{stats.totalSks}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-md">
           <Calculator className="w-6 h-6 text-slate-600" />
        </div>
      </div>
    </div>
  );
};