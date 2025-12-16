import React from 'react';
import { Course, GradeDefinition } from '../types';
import { Trash2, Plus, AlertCircle, FileSpreadsheet, Download, Upload } from 'lucide-react';

interface GradeTableProps {
  courses: Course[];
  gradingScale: GradeDefinition[];
  onUpdateCourse: (id: string, field: keyof Course, value: any) => void;
  onDeleteCourse: (id: string) => void;
  onAddCourse: () => void;
  onExportCSV: () => void;
  onImportTrigger: () => void;
}

export const GradeTable: React.FC<GradeTableProps> = ({ 
  courses, 
  gradingScale,
  onUpdateCourse, 
  onDeleteCourse,
  onAddCourse,
  onExportCSV,
  onImportTrigger
}) => {
  
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
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div>
           <h3 className="font-bold text-slate-800">Daftar Mata Kuliah</h3>
           <p className="text-xs text-slate-500 mt-0.5">Kelola riwayat nilai akademik Anda</p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-md border border-slate-200 mr-2">
                 <button 
                  onClick={onImportTrigger}
                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded transition"
                  title="Import CSV"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button 
                  onClick={onExportCSV}
                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded transition"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
            </div>

            <button 
              onClick={onAddCourse}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-xs font-semibold rounded hover:bg-blue-800 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Baris
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs font-bold text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-16 text-center border-r border-slate-100">Sem</th>
              <th className="px-4 py-3 w-32 border-r border-slate-100">Kode</th>
              <th className="px-4 py-3 border-r border-slate-100">Mata Kuliah</th>
              <th className="px-4 py-3 w-20 text-center border-r border-slate-100">SKS</th>
              <th className="px-4 py-3 w-24 text-center border-r border-slate-100">Nilai</th>
              <th className="px-4 py-3 w-20 text-center border-r border-slate-100">Bobot</th>
              <th className="px-2 py-3 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                      <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600">Belum ada data mata kuliah</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Import Transkrip" atau Tambah Manual</p>
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
                  <tr key={course.id} className="hover:bg-blue-50/50 group transition-colors">
                    <td className="p-0 border-r border-slate-100">
                      <input 
                        type="number" 
                        value={course.semester}
                        onChange={(e) => onUpdateCourse(course.id, 'semester', parseInt(e.target.value) || 1)}
                        className="w-full h-full py-2.5 text-center bg-transparent focus:bg-white focus:ring-inset focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-0 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={course.code}
                        onChange={(e) => onUpdateCourse(course.id, 'code', e.target.value)}
                        className="w-full h-full px-3 py-2.5 bg-transparent focus:bg-white focus:ring-inset focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs text-slate-600"
                        placeholder="KODE"
                      />
                    </td>
                    <td className="p-0 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={course.name}
                        onChange={(e) => onUpdateCourse(course.id, 'name', e.target.value)}
                        className="w-full h-full px-3 py-2.5 bg-transparent focus:bg-white focus:ring-inset focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                        placeholder="Nama Mata Kuliah"
                      />
                    </td>
                    <td className="p-0 border-r border-slate-100">
                      <input 
                        type="number" 
                        value={course.sks}
                        onChange={(e) => onUpdateCourse(course.id, 'sks', parseInt(e.target.value) || 0)}
                        className="w-full h-full py-2.5 text-center bg-transparent focus:bg-white focus:ring-inset focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-0 border-r border-slate-100">
                      <select
                        value={course.grade}
                        onChange={(e) => onUpdateCourse(course.id, 'grade', e.target.value)}
                        className={`w-full h-full py-2.5 px-2 text-center bg-transparent focus:bg-white focus:ring-inset focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none font-semibold ${
                          gradeValue === undefined && course.grade !== '-' && course.grade !== 'BL' ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        <option value="-">-</option>
                        {gradingScale.filter(g => g.enabled).map((g) => (
                          <option key={g.label} value={g.label}>{g.label}</option>
                        ))}
                        <option value="BL">BL</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600 font-mono text-xs border-r border-slate-100 bg-slate-50/50">
                      {point}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button 
                        onClick={() => onDeleteCourse(course.id)}
                        className="text-slate-300 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition"
                        title="Hapus"
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