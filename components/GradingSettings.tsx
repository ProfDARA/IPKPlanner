import React, { useState } from 'react';
import { GradeDefinition } from '../types';
import { Settings, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface GradingSettingsProps {
  scale: GradeDefinition[];
  onUpdate: (newScale: GradeDefinition[]) => void;
  onReset: () => void;
}

export const GradingSettings: React.FC<GradingSettingsProps> = ({ scale, onUpdate, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleValueChange = (index: number, newValue: string) => {
    const updated = [...scale];
    updated[index].value = parseFloat(newValue) || 0;
    onUpdate(updated);
  };

  const handleToggle = (index: number) => {
    const updated = [...scale];
    updated[index].enabled = !updated[index].enabled;
    onUpdate(updated);
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex items-center justify-between bg-white hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2 text-slate-800">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-sm uppercase tracking-wide text-slate-600">Konfigurasi Bobot Nilai</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 bg-slate-50/50">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
             {scale.map((grade, idx) => (
               <div key={grade.label} className={`flex items-center gap-2 p-2 rounded border text-sm ${grade.enabled ? 'border-blue-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-100 opacity-60'}`}>
                 <input 
                   type="checkbox"
                   checked={grade.enabled}
                   onChange={() => handleToggle(idx)}
                   className="w-3.5 h-3.5 text-blue-700 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                 />
                 <div className="flex-1 font-bold text-slate-700">
                   {grade.label}
                 </div>
                 <input 
                   type="number"
                   step="0.01"
                   value={grade.value}
                   onChange={(e) => handleValueChange(idx, e.target.value)}
                   disabled={!grade.enabled}
                   className="w-12 text-right bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none font-mono"
                 />
               </div>
             ))}
           </div>
           
           <div className="mt-4 flex justify-end border-t border-slate-200 pt-3">
             <button 
               onClick={onReset}
               className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded text-xs transition"
             >
               <RotateCcw className="w-3.5 h-3.5" /> Reset Default
             </button>
           </div>
        </div>
      )}
    </div>
  );
};