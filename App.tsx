import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { GradeTable } from './components/GradeTable';
import { TargetCalculator } from './components/TargetCalculator';
import { FileUpload } from './components/FileUpload';
import { GradingSettings } from './components/GradingSettings';
import { Course, GradeDefinition, DEFAULT_GRADING_SCALE } from './types';
import { LayoutDashboard, Github, Linkedin } from 'lucide-react';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [gradingScale, setGradingScale] = useState<GradeDefinition[]>(DEFAULT_GRADING_SCALE);

  // Add initial dummy row if empty
  useEffect(() => {
    if (courses.length === 0) {
      setCourses([{
        id: '1',
        code: '',
        name: '',
        sks: 3,
        grade: '-',
        semester: 1,
        includedInGpa: false
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        // Recalculate included status if grade changes
        if (field === 'grade') {
          updated.includedInGpa = value !== '-' && value !== 'BL' && value !== '';
        }
        return updated;
      }
      return c;
    }));
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCourse = () => {
    setCourses(prev => [
      ...prev, 
      {
        id: crypto.randomUUID(),
        code: '',
        name: '',
        sks: 3,
        grade: '-',
        semester: prev.length > 0 ? prev[prev.length - 1].semester : 1,
        includedInGpa: false
      }
    ]);
  };

  const handleDataExtracted = (extractedCourses: Course[]) => {
    setCourses(prev => {
      const cleanPrev = prev.filter(p => p.code !== '' || p.name !== '');
      return [...cleanPrev, ...extractedCourses];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Smart IPK</span>
          </div>

          {/* Right Side: About & Contacts */}
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2 text-right">
                <span className="text-xs font-bold text-slate-700">Planner & Hitung IPK dengan AI</span>
                <span className="text-[10px] text-slate-500">Kritik dan Saran: Danang Agung Restu Aji</span>
             </div>

             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

             <div className="flex items-center gap-1">
              <a 
                href="https://www.linkedin.com/in/profdara/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/profdara" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* Grading Settings - Placed at Top as requested */}
        <GradingSettings 
          scale={gradingScale} 
          onUpdate={setGradingScale}
          onReset={() => setGradingScale(DEFAULT_GRADING_SCALE)}
        />

        {/* Top Summary */}
        <Dashboard courses={courses} gradingScale={gradingScale} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Upload & Table */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onDataExtracted={handleDataExtracted} />
            <GradeTable 
              courses={courses}
              gradingScale={gradingScale}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddCourse={handleAddCourse}
            />
          </div>

          {/* Sidebar: Calculator */}
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-24">
                <TargetCalculator courses={courses} gradingScale={gradingScale} />
                
                {/* Grading Scale Legend - Replaced by dynamic list */}
                <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                   <h4 className="text-sm font-semibold text-slate-700 mb-3">Referensi Bobot Nilai Aktif</h4>
                   <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      {gradingScale.filter(g => g.enabled).map((g) => (
                        <div key={g.label} className="flex justify-between border-b border-slate-100 pb-1 last:border-0">
                          <span className="font-medium">{g.label}</span>
                          <span>{g.value.toFixed(1)}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;