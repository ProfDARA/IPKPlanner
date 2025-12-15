export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  grade: string; // 'A', 'A-', 'B', etc., or '-'
  semester: number;
  includedInGpa: boolean;
}

export interface GradeDefinition {
  label: string;
  value: number;
  enabled: boolean;
}

export const DEFAULT_GRADING_SCALE: GradeDefinition[] = [
  { label: 'A', value: 4.0, enabled: true },
  { label: 'A-', value: 3.5, enabled: true },
  { label: 'B+', value: 3.3, enabled: true },
  { label: 'B', value: 3.0, enabled: true },
  { label: 'B-', value: 2.5, enabled: true },
  { label: 'C+', value: 2.3, enabled: true },
  { label: 'C', value: 2.0, enabled: true },
  { label: 'C-', value: 1.5, enabled: false }, // Default disabled based on common usage, but user can enable
  { label: 'D', value: 1.0, enabled: true },
  { label: 'E', value: 0.0, enabled: true },
];

export interface ExtractedData {
  courses: Omit<Course, 'id' | 'includedInGpa'>[];
}