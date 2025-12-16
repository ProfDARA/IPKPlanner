import { GoogleGenAI, Type } from "@google/genai";
import { Course } from "../types";

// Initialize Gemini Client
// NOTE: Ideally this comes from process.env.API_KEY, but for this demo context ensure your environment is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTranscriptData = async (base64Data: string, mimeType: string): Promise<Partial<Course>[]> => {
  try {
    const prompt = `
      Analyze this document (Image or PDF of an academic transcript/LKAM). 
      Extract the course data into a JSON structure.
      
      Rules:
      1. Ignore header information (Name, NIM, Address).
      2. For each row in the table, extract:
         - 'code': The course code (Kode Mata Kuliah).
         - 'name': The course name (Nama Mata Kuliah).
         - 'sks': The credit usage (SKS) as a number.
         - 'grade': The grade (Nilai). If it is '-', empty, or 'BL', store it as '-'. 
         - 'semester': The semester number (if grouped by semester headers like "SEMESTER 1", infer it).
      3. If a grade is numeric (like 80), convert to Letter grade (A, B, C) based on standard Indonesian university scale, but usually LKAM has letter grades.
      4. Return ONLY the JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              name: { type: Type.STRING },
              sks: { type: Type.NUMBER },
              grade: { type: Type.STRING },
              semester: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract data. Please try again or ensure the file is clear.");
  }
};