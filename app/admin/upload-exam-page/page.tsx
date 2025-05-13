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

// Define interfaces for validation
interface Question {
  id: number
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
  id: number
  school: string
  grade_level: string
  subject: string
  date: string
  exam_type: string
  questions: Question[]
  questionCount: number
  total_marks: number
  duration: string
  isPublic: boolean
  examiner: string
  created_at: string
  updated_at: string
  file_url?: string
  tags: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  language: string
  status: "Draft" | "Published" | "Archived"
  instructions?: string
}

export default function UploadExamPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if not a teacher
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || session?.user?.role !== "teacher") {
      toast({
        title: "Access Denied",
        description: "Only teachers can access this page.",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [status, session, router])

  const validateExamData = (data: any): data is SchoolExamData => {
    // Basic structure validation
    if (!data || typeof data !== "object") {
      throw new Error("Input must be a valid JSON object")
    }

    // Required fields
    const requiredFields = [
      "school",
      "grade_level",
      "subject",
      "date",
      "exam_type",
      "questions",
      "questionCount",
      "total_marks",
      "duration",
      "examiner",
      "tags",
      "difficulty",
      "language",
      "status",
    ]
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Type validations
    if (typeof data.school !== "string") throw new Error("school must be a string")
    if (typeof data.grade_level !== "string") throw new Error("grade_level must be a string")
    if (typeof data.subject !== "string") throw new Error("subject must be a string")
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("date must be in YYYY-MM-DD format")
    if (typeof data.exam_type !== "string") throw new Error("exam_type must be a string")
    if (!Array.isArray(data.questions)) throw new Error("questions must be an array")
    if (typeof data.questionCount !== "number") throw new Error("questionCount must be a number")
    if (typeof data.total_marks !== "number") throw new Error("total_marks must be a number")
    if (typeof data.duration !== "string") throw new Error("duration must be a string")
    if (typeof data.isPublic !== "boolean") throw new Error("isPublic must be a boolean")
    if (typeof data.examiner !== "string") throw new Error("examiner must be a string")
    if (!Array.isArray(data.tags)) throw new Error("tags must be an array of strings")
    if (!["Easy", "Medium", "Hard"].includes(data.difficulty)) {
      throw new Error("difficulty must be 'Easy', 'Medium', or 'Hard'")
    }
    if (typeof data.language !== "string") throw new Error("language must be a string")
    if (!["Draft", "Published", "Archived"].includes(data.status)) {
      throw new Error("status must be 'Draft', 'Published', or 'Archived'")
    }

    // Validate questions array
    if (data.questions.length !== data.questionCount) {
      throw new Error("questionCount must match the number of questions provided")
    }

    const totalMarks = data.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)
    if (totalMarks !== data.total_marks) {
      throw new Error("Total marks of questions must match the exam's total_marks")
    }

    // Validate each question
    data.questions.forEach((q: any, index: number) => {
      const requiredQuestionFields = ["question", "question_type", "topic", "explanation", "difficulty", "marks"]
      for (const field of requiredQuestionFields) {
        if (!(field in q)) {
          throw new Error(`Question at index ${index} is missing required field: ${field}`)
        }
      }

      if (typeof q.question !== "string") throw new Error(`Question at index ${index}: question must be a string`)
      if (
        !["objective", "essay", "comprehension_and_summary", "guided_essay", "theory", "practical"].includes(
          q.question_type
        )
      ) {
        throw new Error(
          `Question at index ${index}: question_type must be one of 'objective', 'essay', 'comprehension_and_summary', 'guided_essay', 'theory', 'practical'`
        )
      }
      if (typeof q.topic !== "string") throw new Error(`Question at index ${index}: topic must be a string`)
      if (typeof q.explanation !== "string") {
        throw new Error(`Question at index ${index}: explanation must be a string`)
      }
      if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) {
        throw new Error(`Question at index ${index}: difficulty must be 'Easy', 'Medium', or 'Hard'`)
      }
      if (typeof q.marks !== "number") throw new Error(`Question at index ${index}: marks must be a number`)

      if (q.question_type === "objective") {
        if (!Array.isArray(q.options)) {
          throw new Error(`Question at index ${index}: options must be an array`)
        }
        if (!Array.isArray(q.correct_answers)) {
          throw new Error(`Question at index ${index}: correct_answers must be an array`)
        }
        if (q.options.length < 2) {
          throw new Error(`Question at index ${index}: objective questions must have at least 2 options`)
        }
        if (q.correct_answers.length === 0) {
          throw new Error(`Question at index ${index}: objective questions must have at least 1 correct answer`)
        }
        q.correct_answers.forEach((ans: string) => {
          if (!q.options.includes(ans)) {
            throw new Error(
              `Question at index ${index}: correct_answer '${ans}' must be one of the provided options`
            )
          }
        })
      }

      if (q.question_type === "essay" || q.question_type === "practical") {
        if (q.model_answer && typeof q.model_answer !== "string") {
          throw new Error(`Question at index ${index}: model_answer must be a string`)
        }
      }
    })

    return true
  }

  const handleUpload = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Parse JSON
      const parsedData = JSON.parse(jsonInput)

      // Validate JSON
      validateExamData(parsedData)

      // Fetch subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", parsedData.subject)
        .single()

      if (subjectError || !subjectData) {
        throw new Error(`Subject '${parsedData.subject}' not found in database.`)
      }

      // Insert questions into question_pool
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
        created_by: session?.user.id,
      }))

      const { data: questionData, error: questionError } = await supabase
        .from("question_pool")
        .insert(questionInserts)
        .select()

      if (questionError || !questionData) {
        throw new Error("Failed to save questions.")
      }

      // Insert exam into exams table
      const schoolMetadata = {
        school: parsedData.school,
        grade_level: parsedData.grade_level,
        date: parsedData.date,
        exam_type: parsedData.exam_type,
        status: parsedData.status,
        examiner: parsedData.examiner,
      }

      const { data: examData, error: examError } = await supabase
        .from("exams")
        .insert({
          exam_source: "school",
          subject_id: subjectData.id,
          total_marks: parsedData.total_marks,
          duration: parsedData.duration,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_url: parsedData.file_url,
          instructions: parsedData.instructions,
          is_public: parsedData.isPublic,
          uploaded_at: parsedData.isPublic ? new Date().toISOString() : null,
          school_metadata: schoolMetadata,
        })
        .select()
        .single()

      if (examError || !examData) {
        throw new Error("Failed to create exam.")
      }

      // Link questions to exam via exam_questions
      const examQuestions = questionData.map((q: any, index: number) => ({
        exam_id: examData.id,
        question_id: q.id,
        marks: parsedData.questions[index].marks,
        order: index + 1,
      }))

      const { error: linkError } = await supabase
        .from("exam_questions")
        .insert(examQuestions)

      if (linkError) {
        throw new Error("Failed to link questions to exam.")
      }

      setSuccess(true)
      toast({
        title: "Success",
        description: "Exam uploaded successfully!",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      // Placeholder for future AI correction
      // if (err) {
      //   const correctedJson = await aiCorrectJson(jsonInput);
      //   setJsonInput(correctedJson);
      //   setError("JSON corrected by AI. Please review and submit again.");
      // }
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
              Import Exam as JSON
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
                "id": 1,
                "school": "St. Mary's High School",
                "grade_level": "Grade 10",
                "subject": "Mathematics",
                "date": "2025-05-15",
                "exam_type": "midterm_exam",
                "questions": [
                  {
                    "id": 1,
                    "question": "What is the value of x in 3x + 7 = 22?",
                    "question_type": "objective",
                    "topic": "Algebra",
                    "subtopic": "Linear Equations",
                    "options": ["5", "6", "7", "8"],
                    "correct_answers": ["5"],
                    "explanation": "Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5.",
                    "hint": "Isolate x by moving the constant term first.",
                    "difficulty": "Easy",
                    "marks": 5,
                    "media_url": "https://example.com/math-diagram.png",
                    "media_type": "image",
                    "learning_objectives": ["Solve linear equations"],
                    "estimated_time": "5 minutes",
                    "source_reference": "Midterm 2025 Paper 1 Q1"
                  }
                ],
                "questionCount": 1,
                "total_marks": 5,
                "duration": "1 hour",
                "isPublic": false,
                "examiner": "Mrs. Elizabeth Brown",
                "created_at": "2025-05-10T09:00:00Z",
                "updated_at": "2025-05-12T14:30:00Z",
                "file_url": "https://example.com/st-marys-midterm-2025.pdf",
                "tags": ["Algebra"],
                "difficulty": "Medium",
                "language": "English",
                "status": "Draft",
                "instructions": "Answer all questions."
              }`}
              className="min-h-[200px] font-mono text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
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