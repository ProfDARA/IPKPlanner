import React, { useState } from 'react';
import { Upload, Loader2, FileText, ScanLine, AlertCircle } from 'lucide-react';
import { extractTranscriptData } from '../services/geminiService';
import { Course } from '../types';

interface FileUploadProps {
  onDataExtracted: (courses: Course[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError("Mohon upload file Gambar (JPG/PNG) atau PDF.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Get base64 content only (remove data:xx/xx;base64, prefix)
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const rawCourses = await extractTranscriptData(base64String, file.type);
          
          const courses: Course[] = rawCourses.map((c) => ({
            id: crypto.randomUUID(),
            code: c.code || 'UNK',
            name: c.name || 'Unknown Course',
            sks: c.sks || 0,
            grade: c.grade || '-',
            semester: c.semester || 1,
            includedInGpa: c.grade !== '-' && c.grade !== 'BL' && c.grade !== '',
          }));

          onDataExtracted(courses);
        } catch (err) {
          setError("Gagal mengenali dokumen. Pastikan tulisan jelas.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Gagal membaca file.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-blue-700" />
          OCR Scan Transkrip
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Powered by Gemini AI</span>
      </div>
      
      <div className="group flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md p-6 transition hover:bg-slate-50 hover:border-blue-400 relative">
        {isProcessing ? (
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-700 animate-spin mx-auto mb-3" />
            <p className="text-slate-700 font-semibold text-sm">Sedang Menganalisis...</p>
            <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 p-3 rounded-full mb-3 group-hover:bg-white border border-slate-100 group-hover:border-blue-100 transition">
               <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
            </div>
            <p className="text-slate-600 font-medium text-sm mb-1">Drag file transkrip atau klik area ini</p>
            <p className="text-xs text-slate-400 mb-4">Support PDF, JPG, PNG (Max 5MB)</p>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </>
        )}
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};