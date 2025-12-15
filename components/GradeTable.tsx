import React from 'react';
import { Course, GradeDefinition } from '../types';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

interface GradeTableProps {
  courses: Course[];
  gradingScale: GradeDefinition[];
  onUpdateCourse: (id: string, field: keyof Course, value: any) => void;
  onDeleteCourse: (id: string) => void;
  onAddCourse: () => void;
}

export const GradeTable: React.FC<GradeTableProps> = ({ 
  courses, 
  gradingScale,
  onUpdateCourse, 
  onDeleteCourse,
  onAddCourse
}) => {
  
  // Sort by semester then code
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.semester !== b.semester) return a.semester - b.semester;
    return a.code.localeCompare(b.code);
  });

  const gradeMap = React.useMemo(() => {
    return gradingScale.reduce((acc, curr) => {
      if (curr.enabled) acc[curr.label] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }, [gradingScale]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Riwayat Akademik</h3>
        <button 
          onClick={onAddCourse}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Matkul
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-12 text-center">Sem</th>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Mata Kuliah</th>
              <th className="px-4 py-3 w-16 text-center">SKS</th>
              <th className="px-4 py-3 w-20 text-center">Nilai</th>
              <th className="px-4 py-3 w-16 text-center">Bobot</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    Belum ada mata kuliah. Upload transkrip (LKAM) atau tambah manual.
                  </div>
                </td>
              </tr>
            ) : (
              sortedCourses.map((course) => {
                const gradeValue = gradeMap[course.grade];
                const point = gradeValue !== undefined && course.includedInGpa 
                    ? (gradeValue * course.sks).toFixed(1) 
                    : '-';

                return (
                  <tr key={course.id} className="hover:bg-slate-50 group">
                    <td className="px-2 py-2">
                      <input 
                        type="number" 
                        value={course.semester}
                        onChange={(e) => onUpdateCourse(course.id, 'semester', parseInt(e.target.value) || 1)}
                        className="w-full text-center bg-transparent focus:bg-white border-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={course.code}
                        onChange={(e) => onUpdateCourse(course.id, 'code', e.target.value)}
                        className="w-full bg-transparent focus:bg-white border-none focus:ring-1 focus:ring-indigo-500 rounded p-1 font-mono text-xs"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={course.name}
                        onChange={(e) => onUpdateCourse(course.id, 'name', e.target.value)}
                        className="w-full bg-transparent focus:bg-white border-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input 
                        type="number" 
                        value={course.sks}
                        onChange={(e) => onUpdateCourse(course.id, 'sks', parseInt(e.target.value) || 0)}
                        className="w-full text-center bg-transparent focus:bg-white border-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={course.grade}
                        onChange={(e) => onUpdateCourse(course.id, 'grade', e.target.value)}
                        className={`w-full text-center bg-transparent focus:bg-white border border-transparent focus:border-indigo-300 rounded p-1 ${
                          gradeValue === undefined && course.grade !== '-' && course.grade !== 'BL' ? 'text-red-500 font-bold' : ''
                        }`}
                      >
                        <option value="-">-</option>
                        {gradingScale.filter(g => g.enabled).map((g) => (
                          <option key={g.label} value={g.label}>{g.label}</option>
                        ))}
                        <option value="BL">BL</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600 font-medium">
                      {point}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button 
                        onClick={() => onDeleteCourse(course.id)}
                        className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};