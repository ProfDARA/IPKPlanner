import React, { useState, useEffect } from 'react';
import { Course, GradeDefinition } from '../types';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface TargetCalculatorProps {
  courses: Course[];
  gradingScale: GradeDefinition[];
}

export const TargetCalculator: React.FC<TargetCalculatorProps> = ({ courses, gradingScale }) => {
  const [targetGPA, setTargetGPA] = useState<number>(3.50);
  const [totalRequiredSKS, setTotalRequiredSKS] = useState<number>(144); // Standard S1
  const [extendedSemesters, setExtendedSemesters] = useState<number>(0);
  const [result, setResult] = useState<{ requiredIPS: number; feasible: boolean; message: string; remainingSKS: number } | null>(null);

  const gradeMap = React.useMemo(() => {
      return gradingScale.reduce((acc, curr) => {
        if (curr.enabled) acc[curr.label] = curr.value;
        return acc;
      }, {} as Record<string, number>);
    }, [gradingScale]);

  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetGPA, totalRequiredSKS, extendedSemesters, courses, gradeMap]);

  const calculateScenario = () => {
    let currentPoints = 0;
    let currentCompletedSKS = 0;

    // 1. Calculate current standing
    courses.forEach(c => {
      if (c.includedInGpa) {
        const val = gradeMap[c.grade];
        if (val !== undefined) {
           currentPoints += val * c.sks;
           currentCompletedSKS += c.sks;
        }
      }
    });

    // 2. Determine Remaining SKS to meet graduation requirement
    const remainingToGraduate = Math.max(0, totalRequiredSKS - currentCompletedSKS);
    
    // 3. Add Extension SKS
    const extraExtensionSKS = extendedSemesters * 24;
    const totalFutureSKS = remainingToGraduate + extraExtensionSKS;

    // The total SKS at the end of this scenario
    const finalTotalSKS = currentCompletedSKS + totalFutureSKS;

    if (totalFutureSKS === 0) {
       // Nothing left to take
       const currentIPK = currentCompletedSKS > 0 ? currentPoints / currentCompletedSKS : 0;
       if (currentIPK >= targetGPA) {
         setResult({ 
           requiredIPS: 0, 
           feasible: true, 
           message: "Anda sudah mencapai target IPK!",
           remainingSKS: 0
          });
       } else {
         setResult({ 
           requiredIPS: 999, 
           feasible: false, 
           message: "Tidak ada SKS tersisa untuk memperbaiki IPK.",
           remainingSKS: 0
          });
       }
       return;
    }

    // 4. Math
    // Target IPK = (CurrentPoints + FuturePoints) / FinalTotalSKS
    // FuturePoints = (Target IPK * FinalTotalSKS) - CurrentPoints
    // Required IPS = FuturePoints / totalFutureSKS
    
    const requiredTotalPoints = targetGPA * finalTotalSKS;
    const pointsNeeded = requiredTotalPoints - currentPoints;
    const requiredIPS = pointsNeeded / totalFutureSKS;

    const feasible = requiredIPS <= 4.0;
    let message = "";

    if (requiredIPS > 4.0) {
      message = "Secara matematis mustahil dicapai dengan beban SKS saat ini.";
    } else if (requiredIPS < 0) {
      message = "Anda sudah melampaui target ini!";
    } else {
      message = `Butuh IPS rata-rata ${requiredIPS.toFixed(2)} untuk ${totalFutureSKS} SKS berikutnya.`;
    }

    setResult({ requiredIPS, feasible, message, remainingSKS: totalFutureSKS });
  };

  return (
    <div className="bg-slate-800 text-white rounded-xl shadow-lg p-6 mt-6 md:mt-0 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
        <Target className="w-6 h-6 text-teal-400" />
        <h3 className="text-xl font-semibold">Simulasi Kelulusan</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Target IPK Lulus</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="2.0" 
              max="4.0" 
              step="0.01" 
              value={targetGPA}
              onChange={(e) => setTargetGPA(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <span className="text-2xl font-bold font-mono min-w-[3ch]">{targetGPA.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Total SKS Syarat Lulus</label>
            <input 
              type="number" 
              value={totalRequiredSKS}
              onChange={(e) => setTotalRequiredSKS(Math.max(0, parseInt(e.target.value)))}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Tambah Semester (Extend)</label>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setExtendedSemesters(Math.max(0, extendedSemesters - 1))}
                  className="bg-slate-600 hover:bg-slate-500 w-8 h-8 rounded flex items-center justify-center transition"
                >-</button>
                <span className="flex-1 text-center font-mono">{extendedSemesters}</span>
                <button 
                  onClick={() => setExtendedSemesters(extendedSemesters + 1)}
                  className="bg-slate-600 hover:bg-slate-500 w-8 h-8 rounded flex items-center justify-center transition"
                >+</button>
             </div>
          </div>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${result.feasible && result.requiredIPS >= 0 ? 'bg-teal-900/30 border-teal-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
            <div className="flex items-start gap-3">
               {result.feasible && result.requiredIPS >= 0 ? <TrendingUp className="w-6 h-6 text-teal-400 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />}
               <div>
                 <h4 className="text-lg font-bold mb-1">
                   {result.requiredIPS < 0 ? 'Target Tercapai' : (result.requiredIPS > 4.0 ? 'Tidak Terjangkau' : `Butuh IPS: ${result.requiredIPS.toFixed(2)}`)}
                 </h4>
                 <p className="text-sm text-slate-300 leading-relaxed">
                   {result.message}
                 </p>
                 <div className="mt-3 text-xs text-slate-400 space-y-1">
                   <p>Sisa SKS menuju syarat: {Math.max(0, totalRequiredSKS - (result.remainingSKS - (extendedSemesters * 24)))}</p>
                   {extendedSemesters > 0 && (
                     <p className="italic">
                       + {extendedSemesters} semester tambahan ({extendedSemesters * 24} SKS)
                     </p>
                   )}
                   <p className="font-semibold text-slate-500 pt-1">Total SKS simulasi ini: {result.remainingSKS}</p>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};