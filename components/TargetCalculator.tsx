import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, HelpCircle, X, CheckCircle2 } from 'lucide-react';

interface TargetCalculatorProps {
  targetGPA: number;
  setTargetGPA: (val: number) => void;
  totalRequiredSKS: number;
  setTotalRequiredSKS: (val: number) => void;
  extendedSemesters: number;
  setExtendedSemesters: (val: number) => void;
  result: { requiredIPS: number; feasible: boolean; message: string; remainingSKS: number } | null;
}

export const TargetCalculator: React.FC<TargetCalculatorProps> = ({ 
  targetGPA, setTargetGPA, 
  totalRequiredSKS, setTotalRequiredSKS, 
  extendedSemesters, setExtendedSemesters,
  result 
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Target className="w-4 h-4 text-blue-700" />
             <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Simulasi Kelulusan</h3>
           </div>
           <button 
            onClick={() => setShowInfo(true)}
            className="text-slate-400 hover:text-blue-600 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Target Input */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Target IPK</label>
              <div className="text-2xl font-bold text-blue-700 font-mono">
                {targetGPA.toFixed(2)}
              </div>
            </div>
            <input 
              type="range" 
              min="2.0" 
              max="4.0" 
              step="0.01" 
              value={targetGPA}
              onChange={(e) => setTargetGPA(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>2.00</span>
              <span>3.00</span>
              <span>4.00</span>
            </div>
          </div>

          {/* Config Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SKS Wajib</label>
               <input 
                 type="number" 
                 value={totalRequiredSKS}
                 onChange={(e) => setTotalRequiredSKS(Math.max(0, parseInt(e.target.value)))}
                 className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-center"
               />
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Extend Sem.</label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-md px-1 py-1">
                   <button 
                     onClick={() => setExtendedSemesters(Math.max(0, extendedSemesters - 1))}
                     className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded transition"
                   >-</button>
                   <span className="font-mono text-sm font-semibold text-slate-700">{extendedSemesters}</span>
                   <button 
                     onClick={() => setExtendedSemesters(extendedSemesters + 1)}
                     className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded transition"
                   >+</button>
                </div>
            </div>
          </div>

          {/* Result Box */}
          <div className={`p-4 rounded-md border-l-4 ${
            result?.feasible && result?.requiredIPS >= 0 
              ? 'bg-emerald-50 border-l-emerald-600 border border-emerald-100' 
              : 'bg-amber-50 border-l-amber-600 border border-amber-100'
          }`}>
             <div className="flex items-start gap-3">
                <div className="mt-1">
                   {result?.feasible && result?.requiredIPS >= 0 
                     ? <TrendingUp className="w-5 h-5 text-emerald-600" /> 
                     : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xs font-bold uppercase mb-1 ${
                     result?.feasible ? 'text-emerald-800' : 'text-amber-800'
                  }`}>
                    Analisis Proyeksi
                  </h4>
                  
                  <div className="text-xl font-bold text-slate-800 mb-1">
                    {result?.requiredIPS !== undefined && result.requiredIPS <= 4 && result.requiredIPS >= 0 
                      ? <span>IPS Target: {result.requiredIPS.toFixed(2)}</span> 
                      : (result?.requiredIPS === 0 ? "Tercapai" : "Mustahil")}
                  </div>
                  
                  <p className="text-xs text-slate-600">
                    {result?.message}
                  </p>
                  
                  {result && result.remainingSKS > 0 && (
                     <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-between text-[10px] font-medium text-slate-500">
                        <span>Sisa: {Math.max(0, totalRequiredSKS - (result.remainingSKS - (extendedSemesters * 24)))} SKS Wajib</span>
                     </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Info Dialog Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-lg shadow-2xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-blue-700">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Panduan Simulasi</h3>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Target IPK</h4>
                <p>Nilai kumulatif akhir yang dituju.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">SKS Wajib</h4>
                <p>Total SKS minimal untuk lulus (biasanya 144 SKS).</p>
              </div>
              <div className="bg-blue-50 p-3 rounded text-xs border-l-2 border-blue-600">
                 Kalkulator ini menghitung rata-rata nilai (IPS) yang harus didapatkan di setiap semester sisa agar target tercapai.
              </div>
            </div>

            <button 
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 bg-slate-800 text-white font-medium py-2 rounded hover:bg-slate-900 transition text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};