import { Question } from "@/types/question";

export interface waecExamData {
  id: number;
  exam_type: "BECE" | "WASSCE"; // Specific to WAEC exams
  exam_year: number; // e.g., 2025
  exam_session: "May/June" | "Nov/Dec"; // WAEC exam sessions
  region: "Ghana" | "Nigeria" | "Sierra Leone" | "Liberia" | "Gambia"; // WAEC regions
  subject: string; // e.g., Mathematics, English Language
  syllabus_version: string; // e.g., "2023 Syllabus v1.2"
  questions: Question[];
  questionCount: number;
  total_marks: number; // e.g., 150 for WASSCE
  duration: string; // e.g., "2 hours 30 minutes"
  is_verified: boolean; // Indicates if Kibra team has verified the upload
  uploaded_by: string; // Kibra team member ID or name
  created_at: string; // ISO timestamp, e.g., 2025-05-13T07:41:00Z
  updated_at: string; // ISO timestamp, e.g., 2025-05-13T07:41:00Z
  file_url?: string; // Optional: URL to uploaded PDF or document
  instructions?: string; // Optional: Exam instructions, e.g., "Use a calculator where permitted"
}