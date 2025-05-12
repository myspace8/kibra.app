"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  AlertCircle,
  ClipboardList,
  HelpCircle,
  EyeOff,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ReviewMode } from "@/components/learn/review-mode"
import type { Question } from "@/types/quiz"

type QuizAppProps = {
  questions: Question[]
  quizTitle?: string
  onQuizComplete?: () => void
}

export default function QuizApp({ questions: initialQuestions, quizTitle, onQuizComplete }: QuizAppProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [tentativeOption, setTentativeOption] = useState<string | null>(null)
  const [showReviewMode, setShowReviewMode] = useState(false)
  const [hintsUsed, setHintsUsed] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)

  // Track user answers for review mode
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})

  // Track eliminated options for each question
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, string[]>>({})

  // Reset the quiz when questions change
  useEffect(() => {
    setQuestions(initialQuestions)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setAnsweredQuestions([])
    setCorrectAnswers([])
    setQuizCompleted(false)
    setShowResults(false)
    setTentativeOption(null)
    setShowReviewMode(false)
    setHintsUsed([])
    setShowHint(false)
    setUserAnswers({})
    setEliminatedOptions({})
  }, [initialQuestions])

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = (answeredQuestions.length / totalQuestions) * 100
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  // Get eliminated options for current question
  const currentEliminatedOptions = eliminatedOptions[currentQuestion?.id] || []

  const handleOptionSelect = (option: string) => {
    if (showExplanation || answeredQuestions.includes(currentQuestion.id)) return

    // Just set the tentative selection, don't confirm yet
    setTentativeOption(option)
  }

  const toggleEliminateOption = (option: string, event: React.MouseEvent) => {
    // Stop propagation to prevent selecting the option when clicking the eliminate button
    event.stopPropagation()

    // Don't allow elimination if question is already answered
    if (showExplanation || answeredQuestions.includes(currentQuestion.id)) return

    // If this option is currently tentatively selected, don't allow elimination
    if (tentativeOption === option) return

    const questionId = currentQuestion.id
    const currentEliminated = eliminatedOptions[questionId] || []

    // Toggle elimination status
    if (currentEliminated.includes(option)) {
      // Remove from eliminated options
      setEliminatedOptions({
        ...eliminatedOptions,
        [questionId]: currentEliminated.filter((opt) => opt !== option),
      })
    } else {
      // Add to eliminated options
      setEliminatedOptions({
        ...eliminatedOptions,
        [questionId]: [...currentEliminated, option],
      })
    }
  }

  const confirmAnswer = () => {
    if (!tentativeOption) return

    setSelectedOption(tentativeOption)
    setShowExplanation(true)

    // Check if this question has already been answered (to prevent double counting)
    if (!answeredQuestions.includes(currentQuestion.id)) {
      const optionIndex = currentQuestion.options.indexOf(tentativeOption)
      const optionLetter = String.fromCharCode(65 + optionIndex)
      const isCorrect = optionLetter === currentQuestion.correct_answer

      // Update answered questions list
      setAnsweredQuestions((prev) => [...prev, currentQuestion.id])

      // Store the user's answer for review mode
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: tentativeOption,
      }))

      // If correct, update correct answers list and score
      if (isCorrect) {
        setCorrectAnswers((prev) => [...prev, currentQuestion.id])
        setScore((prev) => prev + 1)
      }

      // Mark quiz as completed if this is the last question to be answered
      if (answeredQuestions.length + 1 === totalQuestions) {
        setQuizCompleted(true)
        if (onQuizComplete) {
          onQuizComplete()
        }
      }
    }

    // Reset tentative selection after confirming
    setTentativeOption(null)
    // Hide hint after answering
    setShowHint(false)
  }

  const handleNextQuestion = () => {
    if (isLastQuestion && quizCompleted) {
      // If we're on the last question and the quiz is completed, show results
      setShowResults(true)
    } else if (currentQuestionIndex < totalQuestions - 1) {
      // Otherwise go to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption(null)
      setTentativeOption(null)
      setShowExplanation(false)
      setShowHint(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(null)
      setTentativeOption(null)
      setShowExplanation(answeredQuestions.includes(questions[currentQuestionIndex - 1].id))
      setShowHint(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setTentativeOption(null)
    setShowExplanation(false)
    setScore(0)
    setAnsweredQuestions([])
    setCorrectAnswers([])
    setQuizCompleted(false)
    setShowResults(false)
    setEliminatedOptions({})
    setUserAnswers({})
    setShowReviewMode(false)
    setHintsUsed([])
    setShowHint(false)
  }

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index)
  }

  // Enter review mode
  const enterReviewMode = () => {
    setShowReviewMode(true)
  }

  // Exit review mode
  const exitReviewMode = () => {
    setShowReviewMode(false)
  }

  // Toggle hint visibility
  const toggleHint = () => {
    // If hint is not already shown, mark it as used
    if (!showHint && !hintsUsed.includes(currentQuestion.id)) {
      setHintsUsed((prev) => [...prev, currentQuestion.id])
    }
    setShowHint(!showHint)
  }

  // If review mode is active, show the review component
  if (showReviewMode) {
    return (
      <ReviewMode
        questions={questions}
        userAnswers={userAnswers}
        correctAnswers={correctAnswers}
        onExit={exitReviewMode}
        hintsUsed={hintsUsed}
        quizTitle={quizTitle}
      />
    )
  }

  if (showResults) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-primary/90 to-primary p-6 text-white">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Quiz Completed!</h2>
            <p className="text-white/80 text-base">
              {quizTitle ? `You've completed "${quizTitle}"` : "You've completed all questions"}. Here's how you did:
            </p>
          </div>

          <div className="p-6 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="text-4xl font-bold text-primary">
                  {correctAnswers.length}/{totalQuestions}
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Award size={32} className="text-yellow-500 drop-shadow-md" />
              </div>
            </div>

            <div className="text-center mb-6 max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                {correctAnswers.length === totalQuestions
                  ? "Perfect Score! 🎉"
                  : correctAnswers.length >= totalQuestions * 0.8
                    ? "Excellent Work! 🌟"
                    : correctAnswers.length >= totalQuestions * 0.6
                      ? "Good Job! 👍"
                      : "Keep Learning! 📚"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {correctAnswers.length === totalQuestions
                  ? "You have an exceptional understanding of these concepts. Outstanding!"
                  : correctAnswers.length >= totalQuestions * 0.8
                    ? "You have a strong grasp of these concepts. Just a few more details to master!"
                    : correctAnswers.length >= totalQuestions * 0.6
                      ? "You have a solid foundation. Keep practicing to improve further."
                      : "These concepts take practice to master. Review the explanations and try again!"}
              </p>

              {hintsUsed.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Hints used: {hintsUsed.length} of {totalQuestions}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={enterReviewMode}
                className="gap-2 px-4 py-2 text-sm font-medium transition-all hover:scale-105"
              >
                <ClipboardList size={16} />
                Review Answers
              </Button>

              <Button
                onClick={resetQuiz}
                variant="outline"
                className="gap-2 px-4 py-2 text-sm font-medium transition-all hover:scale-105"
              >
                <RotateCcw size={16} />
                Restart Quiz
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="h-16 w-16 text-primary/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          There are no questions available for this quiz. Please select a different quiz or try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Return to Home</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        {quizTitle && (
          <div className="max-w-[45vw]">
            <h1 className="text-sm font-medium leading-tight text-[#808080] text-left">{quizTitle}</h1>
          </div>
        )}

        <div className="flex sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-[0.786px]">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
      {/* <div>
        {!answeredQuestions.includes(currentQuestion.id) && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 ml-2 mt-1">
            <span>Click x to eliminate options</span>
          </div>
        )}
      </div> */}

      {/* <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        > */}
          <Card className="overflow-hidden border-0 rounded-none bg-inherit shadow-none">
            <div className="py-5">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-base leading-tight tracking-tight">{currentQuestion.question}</h2>


              </div>

              {showHint && currentQuestion.hint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <p className="text-xs">{currentQuestion.hint}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = getOptionLetter(index)
                  const isSelected = selectedOption === option
                  const isTentative = tentativeOption === option
                  const isCorrect = optionLetter === currentQuestion.correct_answer
                  const isAnswered = answeredQuestions.includes(currentQuestion.id)
                  const isWrong = isAnswered && isSelected && !isCorrect
                  const isEliminated = currentEliminatedOptions.includes(option)

                  return (
                    <div
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={cn(
                        "relative group transition-all duration-200 border-y",
                        isAnswered && isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : isWrong
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : isTentative
                              ? "border-gray-200"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                        !isAnswered && !isTentative && "hover:shadow-sm",
                        isEliminated && !isAnswered ? "opacity-60" : "",
                        "cursor-pointer",
                      )}
                    >
                      <div className="p-3 flex items-start gap-3">
                        <div
                          className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                            isAnswered && isCorrect
                              ? "bg-green-500 text-white"
                              : isWrong
                                ? "bg-red-500 text-white"
                                : isTentative
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 border dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {isAnswered && isCorrect ? (
                            <CheckCircle size={14} />
                          ) : isWrong ? (
                            <XCircle size={14} />
                          ) : (
                            optionLetter
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex-1 text-sm",
                            isEliminated && !isAnswered ? "line-through text-gray-500 dark:text-gray-400" : "",
                          )}
                        >
                          {option}
                        </div>

                        {/* Eliminate button */}
                        {!isAnswered && (
                          <button
                            onClick={(e) => toggleEliminateOption(option, e)}
                            className={cn(
                              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                              "border border-gray-200 dark:border-gray-700",
                              "text-gray-500 dark:text-gray-400",
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                              "transition-colors",
                              isEliminated ? "bg-gray-100 dark:bg-gray-800" : "",
                              isTentative ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                            )}
                            disabled={isTentative}
                            aria-label={isEliminated ? "Uneliminate option" : "Eliminate option"}
                          >
                            {isEliminated ? <span className="text-xs font-medium">↩</span> : <XCircle size={12} />}
                          </button>
                        )}
                      </div>

                      {/* {isTentative && (
                        <div className="absolute -top-1.5 -right-1.5 bg-primary text-white text-xs font-medium px-1.5 py-0.5 rounded-full text-[10px]">
                          Selected
                        </div>
                      )} */}
                    </div>
                  )
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertCircle size={14} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-xs">Explanation</h3>
                      </div>
                      <p className="text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="hidden mt-5 md:flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-1 text-sm h-8"
                >
                  <ChevronLeft size={14} />
                  Previous
                </Button>

                {showExplanation ? (
                  <Button onClick={handleNextQuestion} className="gap-1 text-sm h-8 bg-primary hover:bg-primary/90">
                    {isLastQuestion ? "See Results" : "Next"}
                    {!isLastQuestion && <ChevronRight size={14} />}
                  </Button>
                ) : tentativeOption ? (
                  <Button onClick={confirmAnswer} className="gap-1 text-sm h-8 bg-green-600 hover:bg-green-700">
                    <CheckCircle size={14} />
                    Confirm
                  </Button>
                ) : (
                  <div className="flex flex-col items-start">
                  <Button
                    variant="outline"
                    onClick={() => setShowExplanation(true)}
                    disabled={!answeredQuestions.includes(currentQuestion.id)}
                    className="gap-1 text-sm h-8"
                  >
                    Show Explanation
                  </Button>
                  {currentQuestion.hint && !answeredQuestions.includes(currentQuestion.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleHint}
                    className="mt-2 flex-shrink-0 h-7 px-2 text-xs"
                    aria-label={showHint ? "Hide hint" : "Show hint"}
                  >
                    {showHint ? <EyeOff size={14} /> : <HelpCircle size={14} />}
                    {showHint ? "Hide Hint" : "Hint"}
                  </Button>
                )}
                  </div>
                )}
              </div>
             
            </div>
          </Card>
          <div className="md:hidden mt-5 flex justify-between fixed bottom-0 left-0 right-0 border-t bg-white p-4 min-h-[12vh]">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-1 text-sm h-8"
                >
                  <ChevronLeft size={14} />
                  Previous
                </Button>

                {showExplanation ? (
                  <Button onClick={handleNextQuestion} className="gap-1 text-sm h-8 bg-primary hover:bg-primary/90">
                    {isLastQuestion ? "See Results" : "Next"}
                    {!isLastQuestion && <ChevronRight size={14} />}
                  </Button>
                ) : tentativeOption ? (
                  <Button onClick={confirmAnswer} className="gap-1 text-sm h-8 bg-green-600 hover:bg-green-700">
                    <CheckCircle size={14} />
                    Confirm
                  </Button>
                ) : (
                  <div className="flex flex-col items-start">
                  <Button
                    variant="outline"
                    onClick={() => setShowExplanation(true)}
                    disabled={!answeredQuestions.includes(currentQuestion.id)}
                    className="gap-1 text-sm h-8"
                  >
                    Show Explanation
                  </Button>
                  {currentQuestion.hint && !answeredQuestions.includes(currentQuestion.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleHint}
                    className="mt-2 flex-shrink-0 h-7 px-2 text-xs"
                    aria-label={showHint ? "Hide hint" : "Show hint"}
                  >
                    {showHint ? <EyeOff size={14} /> : <HelpCircle size={14} />}
                    {showHint ? "Hide Hint" : "Hint"}
                  </Button>
                )}
                  </div>
                )}
              </div>
        {/* </motion.div>
      </AnimatePresence> */}
    </div>
  )
}
