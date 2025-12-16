import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { GradeTable } from './components/GradeTable';
import { TargetCalculator } from './components/TargetCalculator';
import { FileUpload } from './components/FileUpload';
import { GradingSettings } from './components/GradingSettings';
import { GpaChart } from './components/GpaChart';
import { Course, GradeDefinition, DEFAULT_GRADING_SCALE } from './types';
import { LayoutDashboard, Github, Linkedin, Coffee, Heart, Database, HelpCircle, X, FileText, Sliders, TrendingUp } from 'lucide-react';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [gradingScale, setGradingScale] = useState<GradeDefinition[]>(DEFAULT_GRADING_SCALE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Simulation State
  const [targetGPA, setTargetGPA] = useState<number>(3.50);
  const [totalRequiredSKS, setTotalRequiredSKS] = useState<number>(144);
  const [extendedSemesters, setExtendedSemesters] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<{ requiredIPS: number; feasible: boolean; message: string; remainingSKS: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load from LocalStorage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('smartIpk_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.gradingScale) setGradingScale(parsed.gradingScale);
        if (parsed.targetGPA) setTargetGPA(parsed.targetGPA);
        if (parsed.totalRequiredSKS) setTotalRequiredSKS(parsed.totalRequiredSKS);
        if (parsed.extendedSemesters) setExtendedSemesters(parsed.extendedSemesters);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    } else {
       // Init dummy if fresh load
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
    setIsLoaded(true);
  }, []);

  // 2. Save to LocalStorage on Change
  useEffect(() => {
    if (!isLoaded) return;
    const dataToSave = {
      courses,
      gradingScale,
      targetGPA,
      totalRequiredSKS,
      extendedSemesters
    };
    localStorage.setItem('smartIpk_data', JSON.stringify(dataToSave));
  }, [courses, gradingScale, targetGPA, totalRequiredSKS, extendedSemesters, isLoaded]);


  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Semester", "Kode", "Mata Kuliah", "SKS", "Nilai"];
    const rows = courses.map(c => [
      c.semester,
      `"${c.code.replace(/"/g, '""')}"`, // Escape quotes
      `"${c.name.replace(/"/g, '""')}"`,
      c.sks,
      c.grade
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transkrip_ipk_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const newCourses: Course[] = [];
      
      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parse handling quotes
        const parts: string[] = [];
        let inQuotes = false;
        let current = '';
        for (let char of line) {
            if (char === '"') { inQuotes = !inQuotes; continue; }
            if (char === ',' && !inQuotes) { parts.push(current); current = ''; continue; }
            current += char;
        }
        parts.push(current);

        if (parts.length >= 5) {
           const sem = parseInt(parts[0]) || 1;
           const code = parts[1] || '';
           const name = parts[2] || '';
           const sks = parseInt(parts[3]) || 0;
           const grade = parts[4] || '-';
           
           newCourses.push({
             id: crypto.randomUUID(),
             semester: sem,
             code: code,
             name: name,
             sks: sks,
             grade: grade,
             includedInGpa: grade !== '-' && grade !== 'BL' && grade !== ''
           });
        }
      }

      if (newCourses.length > 0) {
        if (window.confirm(`Ditemukan ${newCourses.length} data mata kuliah. Timpa data saat ini?`)) {
           setCourses(newCourses);
        }
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Calculate Simulation Logic
  const gradeMap = useMemo(() => {
    return gradingScale.reduce((acc, curr) => {
      if (curr.enabled) acc[curr.label] = curr.value;
      return acc;
    }, {} as Record<string, number>);
  }, [gradingScale]);

  useEffect(() => {
    let currentPoints = 0;
    let currentCompletedSKS = 0;

    courses.forEach(c => {
      if (c.includedInGpa) {
        const val = gradeMap[c.grade];
        if (val !== undefined) {
           currentPoints += val * c.sks;
           currentCompletedSKS += c.sks;
        }
      }
    });

    const remainingToGraduate = Math.max(0, totalRequiredSKS - currentCompletedSKS);
    const extraExtensionSKS = extendedSemesters * 24;
    const totalFutureSKS = remainingToGraduate + extraExtensionSKS;
    const finalTotalSKS = currentCompletedSKS + totalFutureSKS;

    if (totalFutureSKS === 0) {
       const currentIPK = currentCompletedSKS > 0 ? currentPoints / currentCompletedSKS : 0;
       if (currentIPK >= targetGPA) {
         setSimulationResult({ requiredIPS: 0, feasible: true, message: "Target tercapai!", remainingSKS: 0 });
       } else {
         setSimulationResult({ requiredIPS: 999, feasible: false, message: "Tidak ada SKS sisa.", remainingSKS: 0 });
       }
       return;
    }

    const requiredTotalPoints = targetGPA * finalTotalSKS;
    const pointsNeeded = requiredTotalPoints - currentPoints;
    const requiredIPS = pointsNeeded / totalFutureSKS;

    const feasible = requiredIPS <= 4.0;
    let message = "";

    if (requiredIPS > 4.0) {
      message = "Mustahil (IPS > 4.00)";
    } else if (requiredIPS < 0) {
      message = "Aman (Target sudah terlampaui)";
    } else {
      message = `Perlu rata-rata ${requiredIPS.toFixed(2)}`;
    }

    setSimulationResult({ requiredIPS, feasible, message, remainingSKS: totalFutureSKS });
  }, [targetGPA, totalRequiredSKS, extendedSemesters, courses, gradeMap]);


  const handleUpdateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
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
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-slate-800">
      
      {/* Corporate Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-1.5 rounded shadow-sm">
               <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white leading-tight tracking-tight">Smart IPK Tracker</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Aplikasi pintar untuk tracking dan analisa IPK Anda</span>
            </div>
          </div>

          {/* Toolbar Actions */}
          <div className="flex items-center gap-3">
             <button
               onClick={() => setShowHelp(true)}
               className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition text-xs font-medium border border-transparent hover:border-slate-700"
               title="Panduan Aplikasi"
             >
                <HelpCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Panduan</span>
             </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* Hidden Input for Import (Triggered from GradeTable) */}
        <input 
            type="file" 
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden"
        />

        {/* Status Bar for LocalStorage */}
        <div className="mb-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-save aktif: Data tersimpan di browser lokal.</span>
           </div>
        </div>

        {/* Grading Settings */}
        <GradingSettings 
          scale={gradingScale} 
          onUpdate={setGradingScale}
          onReset={() => setGradingScale(DEFAULT_GRADING_SCALE)}
        />

        {/* Top Summary */}
        <Dashboard courses={courses} gradingScale={gradingScale} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content: Upload & Table */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onDataExtracted={handleDataExtracted} />
            <GradeTable 
              courses={courses}
              gradingScale={gradingScale}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddCourse={handleAddCourse}
              onExportCSV={handleExportCSV}
              onImportTrigger={() => fileInputRef.current?.click()}
            />
          </div>

          {/* Sidebar: Calculator & Chart */}
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-24 space-y-6">
                <TargetCalculator 
                  targetGPA={targetGPA}
                  setTargetGPA={setTargetGPA}
                  totalRequiredSKS={totalRequiredSKS}
                  setTotalRequiredSKS={setTotalRequiredSKS}
                  extendedSemesters={extendedSemesters}
                  setExtendedSemesters={setExtendedSemesters}
                  result={simulationResult}
                />
                
                {/* GPA Trend Chart */}
                <GpaChart 
                  courses={courses} 
                  gradingScale={gradingScale} 
                  targetGPA={targetGPA}
                  projectedIPS={simulationResult?.feasible && simulationResult?.requiredIPS >= 0 && simulationResult?.requiredIPS <= 4.0 ? simulationResult.requiredIPS : null}
                />

                 {/* Legend */}
                 <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-2">Bobot Nilai</h4>
                   <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-700">
                      {gradingScale.filter(g => g.enabled).map((g) => (
                        <div key={g.label} className="flex justify-between items-center">
                          <span className="font-semibold">{g.label}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{g.value.toFixed(1)}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* "Original Vibe" Support/Donation Section */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-pink-500/30 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Heart className="w-5 h-5 text-pink-300 animate-pulse" />
                            <h3 className="font-bold text-lg tracking-tight">Dukung Developer</h3>
                        </div>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                            Aplikasi ini gratis dan open source. Jika terbantu, traktir kopi biar makin semangat coding! ☕
                        </p>
                        
                        <div className="flex gap-2">
                             <a href="https://github.com/profdara" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg flex items-center justify-center gap-2 transition backdrop-blur-sm">
                                <Github className="w-4 h-4" />
                                <span className="text-xs font-semibold">GitHub</span>
                             </a>
                             <a href="https://www.linkedin.com/in/profdara/" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg flex items-center justify-center gap-2 transition backdrop-blur-sm">
                                <Linkedin className="w-4 h-4" />
                                <span className="text-xs font-semibold">LinkedIn</span>
                             </a>
                        </div>
                        
                        <a href="https://saweria.co/develperdanang" target="_blank" rel="noopener noreferrer" className="w-full mt-2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md font-semibold text-xs">
                           <Coffee className="w-3.5 h-3.5" /> Traktir Kopi
                        </a>
                    </div>
                </div>

             </div>
          </div>

        </div>
      </main>

      {/* Main Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between sticky top-0">
               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <HelpCircle className="w-5 h-5 text-blue-700" /> Panduan Aplikasi
               </h3>
               <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 transition">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
               
               <div className="flex gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-lg h-fit">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">1. Masukkan Data Nilai</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Anda bisa memasukkan nilai secara <strong>Manual</strong> dengan tombol "Tambah Baris", 
                      menggunakan <strong>OCR</strong> (Upload Foto/PDF Transkrip), atau <strong>Import CSV</strong> jika pernah menyimpan data sebelumnya.
                    </p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="bg-emerald-50 p-2.5 rounded-lg h-fit">
                    <Sliders className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">2. Atur Target & SKS</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Gunakan slider di panel kanan untuk menentukan <strong>Target IPK</strong> kelulusan Anda dan masukkan total <strong>SKS Wajib</strong> (umumnya 144 SKS).
                    </p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="bg-amber-50 p-2.5 rounded-lg h-fit">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">3. Analisis Kelulusan</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Aplikasi akan otomatis menghitung <strong>IPS (Indeks Prestasi Semester)</strong> rata-rata yang harus Anda capai di sisa semester agar target IPK tercapai.
                    </p>
                  </div>
               </div>

               <div className="bg-slate-100 p-4 rounded-md border border-slate-200 text-xs text-slate-600">
                  <strong>Catatan:</strong> Data Anda tersimpan otomatis di browser ini (Local Storage). Gunakan fitur "Export CSV" untuk membackup data Anda ke perangkat lain.
               </div>

            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
               <button 
                 onClick={() => setShowHelp(false)}
                 className="w-full bg-slate-800 text-white font-medium py-2 rounded hover:bg-slate-900 transition"
               >
                 Saya Mengerti
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;