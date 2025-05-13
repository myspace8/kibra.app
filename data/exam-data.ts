import { Question } from "@/types/question"

export interface examData {
  id: number
    school: string
    subject: string // e.g., Mathematics, English Language
    date: string // Format: YYYY-MM-DD
    exam_type: string // e.g., midterm_exam, final_exam, mock, bece, wassce
    paper_questions: Question[]
    questionCount: number
    // isPublic: boolean Every exam is public
    creator: string    
}