// app/admin/upload-school-exam/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      role?: string | null
      image?: string | null
    }
  }
}



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

interface SchoolExamData {
  school: string
  grade_level: string
  subject: string
  date: string // YYYY-MM-DD
  exam_type: string
  questions: Question[]
  questionCount: number
  total_marks: number
  duration: string
  isPublic: boolean
  examiner: string
  school_location?: {
    region: string
    city?: string
    country?: string
  }
  tags: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  language: string
  status: "Draft" | "Published" | "Archived"
  file_url?: string
  instructions?: string
}

export default function UploadSchoolExamPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || session?.user?.role !== "teacher") {
      toast({
        title: "Access Denied",
        description: "Only teachers can access this page.",
        variant: "destructive"
      })
      router.push("/")
    }
  }, [status, session, router])

  const validateExamData = (data: any): data is SchoolExamData => {
    if (!data || typeof data !== "object") {
      throw new Error("Input must be a valid JSON object")
    }

    const requiredFields = [
      "school", "grade_level", "subject", "date", "exam_type", "questions",
      "questionCount", "total_marks", "duration", "isPublic", "examiner",
      "tags", "difficulty", "language", "status"
    ]
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    if (typeof data.school !== "string" || data.school.trim() === "") {
      throw new Error("school must be a non-empty string")
    }
    if (typeof data.grade_level !== "string" || data.grade_level.trim() === "") {
      throw new Error("grade_level must be a non-empty string")
    }
    if (typeof data.subject !== "string" || data.subject.trim() === "") {
      throw new Error("subject must be a non-empty string")
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error("date must be in YYYY-MM-DD format")
    }
    if (typeof data.exam_type !== "string" || data.exam_type.trim() === "") {
      throw new Error("exam_type must be a non-empty string")
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
    if (typeof data.examiner !== "string" || data.examiner.trim() === "") {
      throw new Error("examiner must be a non-empty string")
    }
    if (!Array.isArray(data.tags)) {
      throw new Error("tags must be an array of strings")
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
    if (data.school_location) {
      if (typeof data.school_location !== "object" || !data.school_location.region) {
        throw new Error("school_location must be an object with a region field")
      }
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

  const handleUpload = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const parsedData = JSON.parse(jsonInput)

      if (!validateExamData(parsedData)) {
        throw new Error("Invalid school exam data format")
      }

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", parsedData.subject)
        .single()

      if (subjectError || !subjectData) {
        throw new Error(`Subject '${parsedData.subject}' not found in database`)
      }

      const questionInserts = parsedData.questions.map((q: Question) => ({
        question_type: q.question_type,
        topic: q.topic,
        subtopic: q.subtopic,
        question: q.question,
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
        source: "school",
        created_by: session?.user?.id ?? null
      }))

      const { data: questionData, error: questionError } = await supabase
        .from("question_pool")
        .insert(questionInserts)
        .select()

      if (questionError || !questionData) {
        throw new Error(`Failed to save questions: ${questionError?.message || "Unknown error"}`)
      }

      // Prepare school_metadata
      const schoolMetadata = {
        school: parsedData.school,
        grade_level: parsedData.grade_level,
        date: parsedData.date,
        exam_type: parsedData.exam_type,
        examiner: parsedData.examiner,
        school_location: parsedData.school_location
      }

      // Insert exam data
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .insert({
          exam_source: "school",
          subject_id: subjectData.id,
          question_count: parsedData.questionCount,
          total_marks: parsedData.total_marks,
          duration: parsedData.duration,
          is_public: parsedData.isPublic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sort_date: `${parsedData.date}T00:00:00Z`,
          file_url: parsedData.file_url,
          instructions: parsedData.instructions,
          tags: parsedData.tags,
          difficulty: parsedData.difficulty,
          language: parsedData.language,
          status: parsedData.status,
          school_exam_metadata: schoolMetadata
        })
        .select()
        .single()

      if (examError || !examData) {
        throw new Error(`Failed to create exam: ${examError?.message || "Unknown error"}`)
      }

      const examQuestions = questionData.map((q: any, index: number) => ({
        exam_id: examData.id,
        question_id: q.id,
        marks: parsedData.questions[index].marks,
        order: index + 1
      }))

      const { error: linkError } = await supabase
        .from("exam_questions")
        .insert(examQuestions)

      if (linkError) {
        throw new Error(`Failed to link questions to exam: ${linkError.message}`)
      }

      setSuccess(true)
      toast({
        title: "Success",
        description: "School exam uploaded successfully!"
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          Upload School Exam
        </h1>
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-100">
              Import School Exam as JSON
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paste your exam data in JSON format. The format should match the example below.
            </p>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{
                "school": "Achimota Senior High School",
                "grade_level": "JHS",
                "subject": "Science",
                "date": "2025-06-15",
                "exam_type": "end_of_term",
                "examiner": "Mr. Kwame Asante",
                "school_location": {
                  "region": "Greater Accra",
                  "country": "Ghana"
                },
                "questions": [
                  {
                    "question": "What is the primary source of energy for Earth's climate system?",
                    "question_type": "objective",
                    "topic": "Earth Science",
                    "options": ["The Moon", "The Sun", "Volcanoes", "Ocean Currents"],
                    "correct_answers": ["The Sun"],
                    "explanation": "The Sun provides the primary energy that drives Earth's climate system.",
                    "difficulty": "Easy",
                    "marks": 5
                  }
                ],
                "questionCount": 1,
                "total_marks": 5,
                "duration": "45 minutes",
                "isPublic": false,
                "tags": ["Earth Science"],
                "difficulty": "Easy",
                "language": "English",
                "status": "Published",
                "file_url": "https://example.com/exam.pdf",
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
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <div>Exam uploaded successfully! Redirecting...</div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/exams")}
            className="border-gray-300 dark:border-gray-600 dark:text-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Upload Exam"}
          </Button>
        </div>
      </div>
    </div>
  )
}