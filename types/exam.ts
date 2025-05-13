// exam: school, subject, date, exam_type (midterm_exam, final_exam, mock, bece, wassce)

import { Question } from "./question"

export interface Exam {
    id: number
    school: string
    subject: string
    date: string // Format: YYYY-MM-DD
    exam_type: string // e.g., midterm_exam, final_exam, mock, bece, wassce
    paper_questions: Question[]
    completed: boolean
    category: string
    questionCount: number
    isPublic: boolean
    creator: string
    institution: string
    }
