import { Question } from "@/types/question";

export interface schoolExamData {
  id: number;
  school: string; // e.g., St. Mary's High School, Central Academy
  grade_level: string; // e.g., Grade 9, Senior High
  subject: string; // e.g., Mathematics, English Language
  date: string; // Format: YYYY-MM-DD
  exam_type: string; // e.g., midterm_exam, final_exam, mock_exam
  questions: Question[];
  questionCount: number;
  total_marks: number; // e.g., 100
  duration: string; // e.g., "2 hours"
  isPublic: boolean; // Schools may choose to make exams public or private
  examiner: string; // e.g., John Doe, Jane Smith
  created_at: string; // ISO timestamp, e.g., 2025-05-13T10:00:00Z
  updated_at: string; // ISO timestamp, e.g., 2025-05-13T10:00:00Z
  file_url?: string; // Optional: URL to uploaded PDF if applicable
  topics: string[]; // e.g., ["Algebra", "Geometry"]
  difficulty: "Easy" | "Medium" | "Hard"; // Difficulty level
  language: string; // e.g., English, Spanish
  status: "Draft" | "Published" | "Archived"; // Exam lifecycle status
  instructions?: string; // Optional: General instructions, e.g., "Answer all questions"
}