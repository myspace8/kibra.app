import { Question } from "@/types/question";

export interface userUploadedExamData {
  id: number;
  title: string; // e.g., "Grade 10 Math Practice Test"
  uploader_id: string; // User ID or email of the uploader
  uploader_name: string; // Optional display name
  subject: string; // e.g., Mathematics, Biology
  grade_level: string; // e.g., Grade 10, Senior High
  questions: Question[];
  questionCount: number;
  total_marks: number; // e.g., 50
  duration: string; // e.g., "1 hour"
  uploaded_at: string; // ISO timestamp, e.g., 2025-05-13T08:09:00Z
  updated_at: string; // ISO timestamp, e.g., 2025-05-13T08:09:00Z
  file_url?: string; // Optional: URL to uploaded PDF or file
  description: string; // Brief description, e.g., "A challenging math test with algebra focus"
  topics: string[]; // e.g., ["Algebra", "Practice", "Grade 10"]
  difficulty: "Easy" | "Medium" | "Hard"; // Self-assessed difficulty
  language: string; // e.g., English
  is_verified: boolean; // AI or admin-verified quality
  rating: number; // Average rating (0-5), updated dynamically
  download_count: number; // Tracks popularity as a commodity metric
  credits_cost: number; // Cost in credits to access (0 for free)
  instructions?: string; // Optional: Exam instructions
}