import React, { useState } from 'react';
import { GradeDefinition } from '../types';
import { Settings, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-2 text-slate-800">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold">Konfigurasi Bobot Nilai</span>
          <span className="text-xs font-normal text-slate-500 ml-2 hidden sm:inline-block">
            (Sesuaikan dengan standar universitas Anda)
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {scale.map((grade, idx) => (
               <div key={grade.label} className={`flex items-center gap-2 p-2 rounded border ${grade.enabled ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                 <input 
                   type="checkbox"
                   checked={grade.enabled}
                   onChange={() => handleToggle(idx)}
                   className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                 />
                 <div className="flex-1">
                   <span className="font-bold text-slate-700 block text-sm">{grade.label}</span>
                 </div>
                 <input 
                   type="number"
                   step="0.01"
                   value={grade.value}
                   onChange={(e) => handleValueChange(idx, e.target.value)}
                   disabled={!grade.enabled}
                   className="w-16 text-right text-sm border-b border-slate-300 bg-transparent focus:border-indigo-500 outline-none"
                 />
               </div>
             ))}
           </div>
           
           <div className="mt-6 flex justify-end">
             <button 
               onClick={onReset}
               className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm transition"
             >
               <RotateCcw className="w-4 h-4" /> Reset ke Default
             </button>
           </div>
        </div>
      )}
    </div>
  );
};