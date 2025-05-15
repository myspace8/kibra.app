"use client"

import { useState } from "react"
import KibraPractice from "@/components/learn/kibra-practice"
import { LearnPageHeader } from "@/components/learn/learn-page-header"
import { supabase } from "@/lib/supabase"
import type { Question } from "@/types/question"

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizTitle, setQuizTitle] = useState<string | undefined>(undefined)
  const [waecExamType, setWaecExamType] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectQuizSource = async (examId: number) => {
    setLoading(true)
    setError(null)
    setQuestions([]) // Clear previous questions

    try {
      // Fetch exam details to get the subject and metadata
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select(`
          id,
          subject_id,
          subject,
          school_exam_metadata,
          waec_exam_metadata,
          difficulty,
          exam_source,
          subjects (name)
        `)
        .eq("id", examId)
        .single()

      if (examError || !examData) {
        throw new Error("Failed to fetch exam details: " + (examError?.message || "Exam not found"))
      }

      // Construct quiz title
      const subjectName = examData.subject || ""
      const source = examData.exam_source
      // const institution =
      //   source === "school" ? examData.school_exam_metadata?.school || "Unknown School" :
      //   source === "waec" ? examData.waec_exam_metadata?.exam_type : "Unknown"
      setQuizTitle(`${subjectName}`)
      const waecExamType = examData.waec_exam_metadata?.exam_type || "Unknown"
      setWaecExamType(waecExamType)

      // Fetch questions for the exam
      const { data: questionsData, error: questionsError } = await supabase
        .from("exam_questions")
        .select(`
          question_id,
          marks,
          order,
          question_pool (
            id,
            question,
            question_type,
            topic,
            subtopic,
            options,
            correct_answers,
            model_answer,
            explanation,
            hint,
            difficulty,
            media_url,
            media_type,
            keywords,
            learning_objectives,
            estimated_time,
            source_reference,
            ai_feedback
          )
        `)
        .eq("exam_id", examId)
        .order("order", { ascending: true })

      if (questionsError || !questionsData) {
        throw new Error("Failed to fetch questions: " + (questionsError?.message || "No questions found"))
      }

      // Map Supabase data to the Question type expected by KibraPractice
      const formattedQuestions: Question[] = questionsData.map((q: any, index: number) => ({
        id: q.question_id,
        question: q.question_pool.question,
        question_type: q.question_pool.question_type,
        topic: q.question_pool.topic,
        subtopic: q.question_pool.subtopic,
        options: q.question_pool.options,
        correct_answers: q.question_pool.correct_answers,
        model_answer: q.question_pool.model_answer,
        explanation: q.question_pool.explanation,
        hint: q.question_pool.hint,
        difficulty: q.question_pool.difficulty || "Medium",
        marks: q.marks,
        media_url: q.question_pool.media_url,
        media_type: q.question_pool.media_type,
        keywords: q.question_pool.keywords,
        learning_objectives: q.question_pool.learning_objectives,
        estimated_time: q.question_pool.estimated_time,
        source_reference: q.question_pool.source_reference,
        ai_feedback: q.question_pool.ai_feedback,
      }))

      setQuestions(formattedQuestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while loading the quiz.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LearnPageHeader onSelectQuizSource={handleSelectQuizSource} />
      <main className="min-h-[calc(100vh-4rem)] overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-6 px-3">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading quiz...</p>
            </div>
          )}
          {error && (
            <div className="flex justify-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <KibraPractice
              questions={questions}
              waecExamType={waecExamType ?? ""}
              quizTitle={quizTitle}
              onQuizComplete={() => {
                if (quizTitle) {
                  console.log(`Quiz completed: ${quizTitle}`)
                }
              }}
            />
          )}
        </div>
      </main>
    </>
  )
}