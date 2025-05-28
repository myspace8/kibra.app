// app/admin/upload-waec-exam/page.tsx
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"

// Define interfaces
interface Question {
  question: string
  question_type: "objective" | "essay" | "comprehension_and_summary" | "guided_essay" | "theory" | "practical"
  topic: string
  subtopic?: string
  options?: string[]
  correct_answers?: string[]
  model_answer?: string
  explanation: string
  hint?: string
  difficulty: "Easy" | "Medium" | "Hard"
  marks: number
  media_url?: string
  media_type?: "image" | "audio" | "video"
  keywords?: string[]
  learning_objectives?: string[]
  estimated_time?: string
  source_reference?: string
  ai_feedback?: string
}

interface WAECExamData {
  exam_type: "BECE" | "WASSCE"
  exam_year: number
  exam_session: "May/June" | "November/December"
  region: string
  subject: string
  syllabus_version: string
  questions: Question[]
  questionCount: number
  total_marks: number
  duration: string
  file_url?: string
  isPublic: boolean
  topics: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  language: string
  status: "Draft" | "Published" | "Archived"
  instructions?: string
}

export default function UploadWAECExam() {
  const { data: session, status } = useSession()
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validateWAECExamData = (data: any): data is WAECExamData => {
    if (!data || typeof data !== "object") {
      throw new Error("Input must be a valid JSON object")
    }

    const requiredFields = [
      "exam_type", "exam_year", "exam_session", "region", "subject",
      "syllabus_version", "questions", "questionCount", "total_marks", "duration",
      "isPublic", "topics", "difficulty", "language", "status"
    ]
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    if (!["BECE", "WASSCE"].includes(data.exam_type)) {
      throw new Error("exam_type must be 'BECE' or 'WASSCE'")
    }
    if (typeof data.exam_year !== "number" || data.exam_year < 2000 || data.exam_year > new Date().getFullYear() + 1) {
      throw new Error("exam_year must be a valid year")
    }
    if (!["May/June", "November/December"].includes(data.exam_session)) {
      throw new Error("exam_session must be 'May/June' or 'November/December'")
    }
    if (typeof data.region !== "string" || data.region.trim() === "") {
      throw new Error("region must be a non-empty string")
    }
    if (typeof data.subject !== "string" || data.subject.trim() === "") {
      throw new Error("subject must be a non-empty string")
    }
    if (typeof data.syllabus_version !== "string" || data.syllabus_version.trim() === "") {
      throw new Error("syllabus_version must be a non-empty string")
    }
    if (!Array.isArray(data.questions)) {
      throw new Error("questions must be an array")
    }
    if (typeof data.questionCount !== "number" || data.questionCount < 1) {
      throw new Error("questionCount must be a positive number")
    }
    if (typeof data.total_marks !== "number" || data.total_marks < 0) {
      throw new Error("total_marks must be a non-negative number")
    }
    if (typeof data.duration !== "string" || data.duration.trim() === "") {
      throw new Error("duration must be a non-empty string")
    }
    if (typeof data.isPublic !== "boolean") {
      throw new Error("isPublic must be a boolean")
    }
    if (!Array.isArray(data.topics)) {
      throw new Error("topics must be an array of strings")
    }
    if (!["Easy", "Medium", "Hard"].includes(data.difficulty)) {
      throw new Error("difficulty must be 'Easy', 'Medium', or 'Hard'")
    }
    if (typeof data.language !== "string" || data.language.trim() === "") {
      throw new Error("language must be a non-empty string")
    }
    if (!["Draft", "Published", "Archived"].includes(data.status)) {
      throw new Error("status must be 'Draft', 'Published', or 'Archived'")
    }

    if (data.questions.length !== data.questionCount) {
      throw new Error("questionCount must match the number of questions provided")
    }

    const totalMarks = data.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)
    if (totalMarks !== data.total_marks) {
      throw new Error("Total marks of questions must match the exam's total_marks")
    }

    data.questions.forEach((q: any, index: number) => {
      const requiredQuestionFields = ["question", "question_type", "topic", "explanation", "difficulty", "marks"]
      for (const field of requiredQuestionFields) {
        if (!(field in q)) {
          throw new Error(`Question at index ${index} is missing required field: ${field}`)
        }
      }
      if (typeof q.question !== "string" || q.question.trim() === "") {
        throw new Error(`Question at index ${index}: question must be a non-empty string`)
      }
      if (!["objective", "essay", "comprehension_and_summary", "guided_essay", "theory", "practical"].includes(q.question_type)) {
        throw new Error(`Question at index ${index}: question_type must be valid`)
      }
      if (typeof q.topic !== "string" || q.topic.trim() === "") {
        throw new Error(`Question at index ${index}: topic must be a non-empty string`)
      }
      if (typeof q.explanation !== "string" || q.explanation.trim() === "") {
        throw new Error(`Question at index ${index}: explanation must be a non-empty string`)
      }
      if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) {
        throw new Error(`Question at index ${index}: difficulty must be 'Easy', 'Medium', or 'Hard'`)
      }
      if (typeof q.marks !== "number" || q.marks <= 0) {
        throw new Error(`Question at index ${index}: marks must be a positive number`)
      }

      if (q.question_type === "objective") {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Question at index ${index}: objective questions must have at least 2 options`)
        }
        if (!Array.isArray(q.correct_answers) || q.correct_answers.length === 0) {
          throw new Error(`Question at index ${index}: objective questions must have at least 1 correct answer`)
        }
        q.correct_answers.forEach((ans: string) => {
          if (!q.options.includes(ans)) {
            throw new Error(`Question at index ${index}: correct_answer '${ans}' must be one of the provided options`)
          }
        })
      }

      if ((q.question_type === "essay" || q.question_type === "practical") && q.model_answer && typeof q.model_answer !== "string") {
        throw new Error(`Question at index ${index}: model_answer must be a string`)
      }
    })

    return true
  }

  const calculateSortDate = (examYear: number, examSession: string): string => {
    const month = examSession === "May/June" ? "06-01" : "11-01";
    return `${examYear}-${month}T00:00:00Z`;
  }

  const handleUpload = async () => {
    setLoading(true)
    setError(null)

    try {
      const parsedData = JSON.parse(jsonInput)

      if (!validateWAECExamData(parsedData)) {
        throw new Error("Invalid WAEC exam data format")
      }

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", parsedData.subject)
        .single()

      if (subjectError || !subjectData) {
        throw new Error(`Subject '${parsedData.subject}' not found in database`)
      }

      // Prepare waec_metadata
      const waecMetadata = {
        // exam_type: parsedData.exam_type,
        exam_year: parsedData.exam_year,
        exam_session: parsedData.exam_session,
        region: parsedData.region,
        syllabus_version: parsedData.syllabus_version
      }

      // Insert into exams table
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .insert({
          exam_source: "waec",
          subject_id: subjectData.id,
          exam_type: parsedData.exam_type,
          subject: parsedData.subject,
          question_count: parsedData.questionCount,
          total_marks: parsedData.total_marks,
          duration: parsedData.duration,
          is_public: parsedData.isPublic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sort_date: calculateSortDate(parsedData.exam_year, parsedData.exam_session), // Purpose: for sorting exams by date. This is used in the frontent to display the exams in a more user-friendly way. For example, if the exam is in May/June 2025, the sort_date will be "2025-06-01T00:00:00Z". This allows us to sort exams by their exam year and session.
          file_url: parsedData.file_url,
          instructions: parsedData.instructions,
          topics: parsedData.topics,
          difficulty: parsedData.difficulty,
          language: parsedData.language,
          status: parsedData.status,
          waec_exam_metadata: waecMetadata
        })
        .select("id")
        .single()

      if (examError || !examData) {
        throw new Error(`Failed to create exam: ${examError?.message || "Unknown error"}`)
      }

      const examId = examData.id
      

      // Insert questions into question_pool
      const questionInserts = parsedData.questions.map((q: Question) => ({
        question: q.question,
        question_type: q.question_type,
        topic: q.topic,
        subtopic: q.subtopic,
        options: q.options,
        correct_answers: q.correct_answers,
        model_answer: q.model_answer,
        explanation: q.explanation,
        hint: q.hint,
        difficulty: q.difficulty,
        marks: q.marks,
        media_url: q.media_url,
        media_type: q.media_type,
        keywords: q.keywords,
        learning_objectives: q.learning_objectives,
        estimated_time: q.estimated_time,
        source_reference: q.source_reference,
        ai_feedback: q.ai_feedback,
        created_by: session?.user?.id ?? null,
        source: "waec"
      }))

      const { data: questionData, error: questionError } = await supabase
        .from("question_pool")
        .insert(questionInserts)
        .select("id")

      if (questionError || !questionData) {
        throw new Error(`Failed to insert questions: ${questionError?.message || "Unknown error"}`)
      }

      // Link questions to exam via exam_questions
      const examQuestionInserts = questionData.map((q: any, index: number) => ({
        exam_id: examId,
        question_id: q.id,
        order: index + 1,
        marks: parsedData.questions[index].marks
      }))

      const { error: linkError } = await supabase
        .from("exam_questions")
        .insert(examQuestionInserts)

      if (linkError) {
        throw new Error(`Failed to link questions to exam: ${linkError.message}`)
      }

      toast({
        title: "Success",
        description: "WAEC exam uploaded successfully!"
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          Upload WAEC Exam
        </h1>
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-100">
              Import WAEC Exam as JSON
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paste your WAEC exam data in JSON format. The format should match the example below.
            </p>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{
                "exam_type": "WASSCE",
                "exam_year": 2025,
                "exam_session": "May/June",
                "region": "Ghana",
                "subject": "Mathematics",
                "syllabus_version": "2023 Syllabus",
                "questions": [
                  {
                    "question": "Solve for x: 2x + 3 = 7",
                    "question_type": "objective",
                    "topic": "Algebra",
                    "options": ["2", "3", "4", "5"],
                    "correct_answers": ["2"],
                    "explanation": "Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2.",
                    "difficulty": "Easy",
                    "marks": 5
                  }
                ],
                "questionCount": 1,
                "total_marks": 5,
                "duration": "2 hours",
                "isPublic": true,
                "topics": ["Algebra", "Equations"],
                "difficulty": "Medium",
                "language": "English",
                "status": "Published",
                "instructions": "Answer all questions."
              }`}
              className="min-h-[300px] font-mono text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-gray-300 dark:border-gray-600 dark:text-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            {loading ? "Uploading..." : "Upload Exam"}
          </Button>
        </div>
      </div>
    </div>
  )
}