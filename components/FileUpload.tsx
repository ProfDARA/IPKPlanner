import React, { useState } from 'react';
import { Upload, Loader2, FileImage } from 'lucide-react';
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
    if (!file.type.startsWith('image/')) {
      setError("Mohon upload file gambar (JPG, PNG).");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
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
          setError("Gagal mengenali teks. Pastikan gambar jelas.");
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <FileImage className="w-5 h-5 text-indigo-600" />
        Import Transkrip (LKAM)
      </h3>
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 transition hover:bg-slate-50 relative">
        {isProcessing ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Menganalisis dengan Gemini AI...</p>
            <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium mb-1">Klik untuk upload gambar transkrip</p>
            <p className="text-xs text-slate-400 mb-4">Mendukung JPG, PNG (Screenshot PDF)</p>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md pointer-events-none">
              Pilih Gambar
            </button>
          </>
        )}
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};