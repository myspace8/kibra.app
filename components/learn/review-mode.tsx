"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { Question } from "@/types/question"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

interface ReviewModeProps {
  questions: Question[]
  userAnswers: Record<number, string | string[]>
  correctAnswers: number[]
  onExit: () => void
  hintsUsed: number[]
  quizTitle?: string
}

export function ReviewMode({ questions, userAnswers, correctAnswers, onExit, hintsUsed, quizTitle }: ReviewModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [generatingNote, setGeneratingNote] = useState(false)
  const [aiNote, setAiNote] = useState<string | null>(null)

  const answeredQuestions = questions.filter((q) => userAnswers[q.id])
  const currentQuestion = answeredQuestions[currentQuestionIndex]

  const handleViewQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setViewMode("detail")
  }

  const handleBackToList = () => {
    setViewMode("list")
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < answeredQuestions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1)
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1)
  }

  const handleGenerateAINote = async () => {
    setGeneratingNote(true)
    try {
      const question = answeredQuestions[currentQuestionIndex]
      const userAnswer = userAnswers[question.id]
      const isCorrect = correctAnswers.includes(question.id)
      const prompt = `
        Analyze this question and student performance:
        - Question: ${question.question}
        - User Answer: ${Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer}
        - Correct Answer(s): ${Array.isArray(question.correct_answers) ? question.correct_answers.join(", ") : question.correct_answers}
        - Explanation: ${question.explanation}
        - Difficulty: ${question.difficulty}
        - Marks: ${question.marks}
        - Learning Objectives: ${question.learning_objectives?.join(", ") || "N/A"}
        - Is Correct: ${isCorrect}
        Generate a concise, personalized study note for a Junior/Senior High School student using Kibra, focusing on improving weak areas and reinforcing strengths. Include actionable steps.
      `
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(prompt)
      setAiNote(result.response.text())
    } catch (error) {
      console.error("Error generating AI note:", error)
      setAiNote("Failed to generate note. Please try again later.")
    }
    setGeneratingNote(false)
  }

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index)

  if (answeredQuestions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">No Questions Answered</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">You haven't answered any questions yet.</p>
        <Button onClick={onExit} className="gap-2">
          <ArrowLeft size={16} />
          Back to Results
        </Button>
      </Card>
    )
  }

  if (viewMode === "detail") {
    const userAnswer = userAnswers[currentQuestion.id]
    const isCorrect = correctAnswers.includes(currentQuestion.id)
    const usedHint = hintsUsed.includes(currentQuestion.id)

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList} className="gap-2 text-sm">
            <ArrowLeft size={14} />
            Back to List
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Q {currentQuestionIndex + 1} of {answeredQuestions.length} ({currentQuestion.marks} marks)
          </div>
        </div>
        <Card className="overflow-hidden border-0 shadow-md mb-4">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {currentQuestion.topic}
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full text-xs font-medium px-2.5 py-0.5"
                    style={{ backgroundColor: isCorrect ? "#d4edda" : "#f8d7da", color: isCorrect ? "#155724" : "#721c24" }}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                  {usedHint && (
                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      <HelpCircle size={10} className="mr-1" />
                      Hint Used
                    </span>
                  )}
                  <span className="text-xs text-gray-500">Difficulty: {currentQuestion.difficulty}</span>
                </div>
                <h2 className="text-base font-bold leading-tight tracking-tight">{currentQuestion.question}</h2>
                {/* {currentQuestion.media_url && (
                  <img src={currentQuestion.media_url} alt="Question media" className="max-w-[200px] mt-2" />
                )} */}
              </div>
            </div>
            {currentQuestion.question_type === "objective" && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = getOptionLetter(index)
                  const isUserAnswer = Array.isArray(userAnswer)
                    ? userAnswer.includes(option)
                    : option === userAnswer
                  const isCorrectAnswer = Array.isArray(currentQuestion.correct_answers)
                    ? currentQuestion.correct_answers.includes(option)
                    : option === currentQuestion.correct_answers

                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative rounded-lg border p-3",
                        isCorrectAnswer
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : isUserAnswer && !isCorrectAnswer
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200 dark:border-gray-700",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            isCorrectAnswer
                              ? "bg-green-500 text-white"
                              : isUserAnswer && !isCorrectAnswer
                                ? "bg-red-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {isCorrectAnswer ? (
                            <CheckCircle size={14} />
                          ) : isUserAnswer && !isCorrectAnswer ? (
                            <XCircle size={14} />
                          ) : (
                            optionLetter
                          )}
                        </div>
                        <div className="flex-1 text-sm">{option}</div>
                        {isUserAnswer && (
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Your answer</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {["essay", "practical"].includes(currentQuestion.question_type) && currentQuestion.model_answer && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Model Answer: {currentQuestion.model_answer}
                </p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Your Answer: {Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer || "Not provided"}
                </p>
              </div>
            )}
            {currentQuestion.hint && usedHint && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-xs">Hint Used</h3>
                </div>
                <p className="text-amber-900 dark:text-amber-200 text-xs leading-relaxed">{currentQuestion.hint}</p>
              </div>
            )}
            <div className="mt-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-xs mb-1.5">Explanation</h3>
              <p className="text-blue-900 dark:text-blue-200 text-xs leading-relaxed">{currentQuestion.explanation}</p>
              {currentQuestion.ai_feedback && (
                <p className="mt-2 text-blue-700 dark:text-blue-300 text-xs">
                  AI Feedback: {currentQuestion.ai_feedback}
                </p>
              )}
            </div>
          </div>
        </Card>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="gap-1 text-sm h-8"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <Button variant="outline" onClick={onExit} className="gap-1 text-sm h-8">
            <ArrowLeft size={14} />
            Back to Results
          </Button>
          <Button
            variant="outline"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === answeredQuestions.length - 1}
            className="gap-1 text-sm h-8"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800 dark:hover:border-purple-700 w-full"
            onClick={handleGenerateAINote}
            disabled={generatingNote}
          >
            <Sparkles size={16} className="text-purple-500" />
            {generatingNote ? "Generating..." : "Generate AI Study Note"}
          </Button>
          {aiNote && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 text-xs mb-1.5">Personalized Note</h3>
              <p className="text-purple-900 dark:text-purple-200 text-xs leading-relaxed">{aiNote}</p>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{quizTitle ? `Review: ${quizTitle}` : "Review Your Answers"}</h2>
        <Button variant="ghost" onClick={onExit} className="gap-2 text-sm">
          <ArrowLeft size={14} />
          Back to Results
        </Button>
      </div>
      <div className="space-y-3 mb-6">
        {answeredQuestions.map((question, index) => {
          const isCorrect = correctAnswers.includes(question.id)
          const usedHint = hintsUsed.includes(question.id)

          return (
            <Card
              key={question.id}
              className={cn(
                "border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                isCorrect ? "border-l-green-500" : "border-l-red-500",
              )}
              onClick={() => handleViewQuestion(index)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                      isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                    )}
                  >
                    {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1 line-clamp-2">{question.question}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{question.topic}</span>
                      <span>•</span>
                      <span
                        className={cn(
                          isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                      {usedHint && (
                        <>
                          <span>•</span>
                          <span className="flex items-center text-amber-600 dark:text-amber-400">
                            <HelpCircle size={10} className="mr-1" />
                            Hint
                          </span>
                        </>
                      )}
                      <span> ({question.marks} marks)</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={onExit} className="gap-2">
          <ArrowLeft size={16} />
          Back to Results
        </Button>
        <Button
          variant="outline"
          className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800 dark:hover:border-purple-700 w-full"
          onClick={handleGenerateAINote}
          disabled={generatingNote}
        >
          <Sparkles size={16} className="text-purple-500" />
          {generatingNote ? "Generating..." : "Generate AI Study Note"}
        </Button>
      </div>
    </motion.div>
  )
}