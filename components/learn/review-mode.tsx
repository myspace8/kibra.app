"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { Question } from "@/types/quiz"

interface ReviewModeProps {
  questions: Question[]
  userAnswers: Record<number, string>
  correctAnswers: number[]
  onExit: () => void
  hintsUsed: number[]
  quizTitle?: string
}

export function ReviewMode({ questions, userAnswers, correctAnswers, onExit, hintsUsed, quizTitle }: ReviewModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  // State to track if an AI note is being generated (for UI feedback)
  const [generatingNote, setGeneratingNote] = useState(false)

  // Filter to only show answered questions
  const answeredQuestions = questions.filter((q) => userAnswers[q.id])

  const handleViewQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setViewMode("detail")
  }

  const handleBackToList = () => {
    setViewMode("list")
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < answeredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Function to handle AI note generation (placeholder for now)
  const handleGenerateAINote = () => {
    // Set generating state to true to show loading UI
    setGeneratingNote(true)

    // Simulate a delay (this would be replaced with actual API call)
    setTimeout(() => {
      setGeneratingNote(false)
      // Show success message or the generated note
      alert(
        "This feature will be implemented in the future. The AI note would analyze your performance and provide personalized feedback.",
      )
    }, 1500)

    /*
    IMPLEMENTATION NOTES FOR FUTURE DEVELOPMENT:
    
    1. AI Model Integration:
       - Use an LLM like GPT-4 or similar to generate personalized notes
       - Send the following data to the AI model:
         - Quiz title and subject
         - Questions the user got right vs. wrong
         - Patterns in mistakes (e.g., consistently missing certain types of questions)
         - Whether hints were used and for which questions
         - Time spent on the quiz (if tracked)
    
    2. Prompt Engineering:
       - Create a detailed prompt that instructs the AI to:
         - Analyze the user's performance
         - Identify knowledge gaps
         - Suggest specific areas for improvement
         - Provide encouragement and positive reinforcement
         - Recommend resources or practice exercises
    
    3. Response Handling:
       - Parse the AI response and format it nicely
       - Allow users to save the note to their account
       - Implement a notes library where users can review past feedback
    
    4. UI/UX Considerations:
       - Show a loading state while generating
       - Allow users to regenerate if they're not satisfied
       - Provide options to share or export the note
    */
  }

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index)
  }

  // If there are no answered questions, show a message
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

  // Detail view of a specific question
  if (viewMode === "detail") {
    const question = answeredQuestions[currentQuestionIndex]
    const userAnswer = userAnswers[question.id]
    const isCorrect = correctAnswers.includes(question.id)
    const usedHint = hintsUsed.includes(question.id)

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList} className="gap-2 text-sm">
            <ArrowLeft size={14} />
            Back to List
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {answeredQuestions.length}
          </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-md mb-4">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {question.component}
                  </span>
                  {isCorrect ? (
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                      Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                      Incorrect
                    </span>
                  )}
                  {usedHint && (
                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      <HelpCircle size={10} className="mr-1" />
                      Hint Used
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold leading-tight tracking-tight">{question.question}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const optionLetter = getOptionLetter(index)
                const isUserAnswer = option === userAnswer
                const isCorrectAnswer = optionLetter === question.correct_answer

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

            {question.hint && usedHint && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-xs">Hint Used</h3>
                </div>
                <p className="text-amber-900 dark:text-amber-200 text-xs leading-relaxed">{question.hint}</p>
              </div>
            )}

            <div className="mt-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-xs mb-1.5">Explanation</h3>
              <p className="text-blue-900 dark:text-blue-200 text-xs leading-relaxed">{question.explanation}</p>
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
      </motion.div>
    )
  }

  // List view of all answered questions
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
                      <span>{question.component}</span>
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

        {/* AI Note Generation Button */}
        <Button
          variant="outline"
          className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800 dark:hover:border-purple-700"
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
