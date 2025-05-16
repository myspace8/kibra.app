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
  HelpCircle,
  EyeOff,
  BookOpen,
  Building2,
  Globe,
  User,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ReviewMode } from "@/components/learn/review-mode"
import type { Question } from "@/types/question"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"

type KibraPracticeProps = {
  questions: Question[];
  open: boolean;
  onSelectQuizSource?: (examId: string) => void;
  waecExamType: string;
  quizTitle?: string;
  onQuizComplete?: () => void;
  // setMenuOpen?: (open: boolean) => void;
};

// Interfaces
interface Subject {
  id: number
  name: string
}


interface Exam {
  id: string
  exam_source: "school" | "waec" | "user"
  subject_id: number
  question_count: number
  total_marks: number
  sort_date: string
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  school_exam_metadata?: {
    school: string
    grade_level: string
    date: string
    exam_type: string
    examiner: string
    school_location?: { region: string; city?: string; country?: string }
  }
  waec_exam_metadata?: {
    exam_type: "BECE" | "WASSCE"
    exam_year: number
    exam_session: "May/June" | "November/December"
    region: string
    syllabus_version: string
  }
  user_exam_metadata?: {
    creator_id: string
    creator_name: string
    date?: string
    exam_type?: string
    description?: string
  }
  completed: boolean
}

export default function KibraPractice({ open, questions: initialQuestions, waecExamType, quizTitle, onQuizComplete, onSelectQuizSource }: KibraPracticeProps) {
  const { data: session } = useSession()
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
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({})
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, string[]>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [exams, setExams] = useState<Exam[]>([])

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

  useEffect(() => {
    console.log("useEffect triggered, open:", open, "userId:", session?.user?.id);
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, name")
          .order("name");
        if (subjectsError) throw new Error("Failed to fetch subjects: " + subjectsError.message);
        console.log("Subjects fetched:", subjectsData);
        setSubjects(subjectsData);

        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_source,
            subject_id,
            question_count,
            total_marks,
            sort_date,
            difficulty,
            tags,
            school_exam_metadata,
            waec_exam_metadata,
            user_exam_metadata
          `)
          .eq("status", "Published")
          .limit(3)
          .order("sort_date", { ascending: false });
        if (examsError) throw new Error("Failed to fetch exams: " + examsError.message);
        console.log("Exams fetched:", examsData);
        const formattedExams: Exam[] = examsData.map((exam: any) => ({
          id: exam.id,
          exam_source: exam.exam_source,
          subject_id: exam.subject_id,
          question_count: exam.question_count,
          total_marks: exam.total_marks,
          sort_date: exam.sort_date,
          difficulty: exam.difficulty,
          tags: exam.tags,
          school_exam_metadata: exam.school_exam_metadata,
          waec_exam_metadata: exam.waec_exam_metadata,
          user_exam_metadata: exam.user_exam_metadata,
          completed: false,
        }));
        setExams(formattedExams);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching exams.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchData();
  }, [open]);



  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = (answeredQuestions.length / totalQuestions) * 100
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const currentEliminatedOptions = eliminatedOptions[currentQuestion?.id] || []

  const handleOptionSelect = (option: string) => {
    if (showExplanation || answeredQuestions.includes(currentQuestion.id)) return
    setTentativeOption(option)
  }

  const toggleEliminateOption = (option: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (showExplanation || answeredQuestions.includes(currentQuestion.id) || tentativeOption === option) return
    const questionId = currentQuestion.id
    const currentEliminated = eliminatedOptions[questionId] || []
    setEliminatedOptions({
      ...eliminatedOptions,
      [questionId]: currentEliminated.includes(option)
        ? currentEliminated.filter((opt) => opt !== option)
        : [...currentEliminated, option],
    })
  }

  const confirmAnswer = () => {
    if (!tentativeOption) return
    setSelectedOption(tentativeOption)
    setShowExplanation(true)
    if (!answeredQuestions.includes(currentQuestion.id)) {
      const isCorrect = Array.isArray(currentQuestion.correct_answers)
        ? currentQuestion.correct_answers.includes(tentativeOption)
        : tentativeOption === currentQuestion.correct_answers
      setAnsweredQuestions((prev) => [...prev, currentQuestion.id])
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: tentativeOption,
      }))
      if (isCorrect) {
        setCorrectAnswers((prev) => [...prev, currentQuestion.id])
        setScore((prev) => prev + (currentQuestion.marks || 1))
      }
      if (answeredQuestions.length + 1 === totalQuestions) {
        setQuizCompleted(true)
        if (onQuizComplete) onQuizComplete()
      }
    }
    setTentativeOption(null)
    setShowHint(false)
  }

  const handleNextQuestion = () => {
    if (isLastQuestion && quizCompleted) setShowResults(true)
    else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption(null)
      setTentativeOption(null)
      setShowExplanation(answeredQuestions.includes(questions[currentQuestionIndex + 1].id))
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

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index)

  const enterReviewMode = () => setShowReviewMode(true)
  const exitReviewMode = () => setShowReviewMode(false)

  const toggleHint = () => {
    if (!showHint && !hintsUsed.includes(currentQuestion.id)) setHintsUsed((prev) => [...prev, currentQuestion.id])
    setShowHint(!showHint)
  }

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
                  {score}/{questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
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
                  : score >= questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 0.8
                    ? "Excellent Work! 🌟"
                    : score >= questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 0.6
                      ? "Good Job! 👍"
                      : "Keep Learning! 📚"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {correctAnswers.length === totalQuestions
                  ? "You’ve mastered these concepts brilliantly!"
                  : score >= questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 0.8
                    ? "Strong grasp—focus on a few tricky areas!"
                    : score >= questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 0.6
                      ? "Solid foundation—practice more to excel!"
                      : "Practice these concepts—review explanations for growth!"}
              </p>
              {hintsUsed.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Hints used: {hintsUsed.length} of {totalQuestions}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={enterReviewMode} className="gap-2 px-4 py-2 text-sm font-medium hover:scale-105">
                Review Answers
              </Button>
              <Button onClick={resetQuiz} variant="outline" className="gap-2 px-4 py-2 text-sm font-medium hover:scale-105">
                <RotateCcw size={16} />
                Restart Quiz
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  const handleExamClick = (examId: string) => {
    console.log("Selected exam:", examId);
    if (onSelectQuizSource) {
      onSelectQuizSource(examId);
    }
  };

  if (!currentQuestion) {
    console.log("Rendering exam list, exams:", exams);
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
    const userName = session?.user?.name?.split(" ")[0] || "User";

    return (
      <>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {session ? (
            <h2 className="text-2xl font-semibold leading-tight tracking-tight">
              {greeting}, {userName}.
            </h2>
          ) : (
            <h2 className="text-2xl font-semibold tracking-tight">Welcome to Kibra.</h2>
          )}
          <p className="text-2xl leading-tight text-gray-600 dark:text-gray-400 mb-6">
            What will you practice today?
          </p>
        </div>
        <div className="w-full max-w-2xl space-y-4 m-auto">
          {exams.length === 0 ? (
            <p className="text-center text-gray-500">No exams available. Please try again later.</p>
          ) : (
            <div className="space-y-3 pb-8" style={{ scrollbarWidth: "thin" }}>
              {exams.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subject_id)?.name || "Unknown Subject";
                const institution =
                  exam.exam_source === "school"
                    ? exam.school_exam_metadata?.school || "Unknown School"
                    : exam.exam_source === "waec"
                      ? exam.waec_exam_metadata?.region || "WAEC"
                      : exam.user_exam_metadata?.creator_name || "User Created";
                const examType =
                  exam.exam_source === "school"
                    ? exam.school_exam_metadata?.exam_type
                    : exam.exam_source === "waec"
                      ? exam.waec_exam_metadata?.exam_type
                      : exam.user_exam_metadata?.exam_type || "Custom";
                const examDate =
                  exam.exam_source === "school"
                    ? exam.school_exam_metadata?.date
                    : exam.exam_source === "waec"
                      ? `${exam.waec_exam_metadata?.exam_year} ${exam.waec_exam_metadata?.exam_session}`
                      : exam.user_exam_metadata?.date || "";

                return (
                  <button
                    key={exam.id}
                    className={cn(
                      "flex w-full items-center justify-between border-b py-4 px-2 text-left transition-colors",
                      exam.completed
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                    )}
                    onClick={() => handleExamClick(exam.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                          exam.completed
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        )}
                      >
                        {exam.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">
                          {subject} {examType} {examDate && `(${examDate})`}
                        </h3>
                        <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {exam.exam_source === "school" && <Building2 className="h-3 w-3" />}
                              {exam.exam_source === "waec" && <Globe className="h-3 w-3" />}
                              {exam.exam_source === "user" && <User className="h-3 w-3" />}
                              <span>{institution}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{exam.question_count} questions </span>
                              {(exam.exam_source !== "waec" && exam.exam_source !== "school") && (
                                <span>• {exam.difficulty}</span>
                              )}
                            </div>
                          </div>
                          {exam.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exam.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 text-xs w-max bg-gray-100 dark:bg-gray-800 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-center text-center gap-2">
          {quizTitle && (
            <div className="max-w-[35vw] md:max-w-[45vw]">
              <h1 className="text-xs text-center font-medium leading-tight text-[#808080]">{quizTitle}</h1>
            </div>
          )}
          {currentQuestion.topic && currentQuestion.subtopic && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500">{currentQuestion.topic}</span>
              <span className="text-xs text-gray-500">{currentQuestion.subtopic}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          {currentQuestion.source_reference && (
            <p className="text-xs text-gray-500 max-w-[35vw]">
              <span>
                {currentQuestion.source_reference} ({waecExamType})
              </span>
            </p>
          )}
          <div className="bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
            Q {currentQuestionIndex + 1}/{totalQuestions}</div>
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
      <Card className="overflow-hidden border-0 rounded-none bg-inherit shadow-none">
        <div className="py-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-base leading-tight tracking-tight">{currentQuestion.question}</h2>
            {/* {currentQuestion.media_url && (
              <img src={currentQuestion.media_url} alt="Question media" className="max-w-[200px] mt-2" />
            )} */}
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
          {currentQuestion.question_type === "objective" && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const optionLetter = getOptionLetter(index)
                const isSelected = selectedOption === option
                const isTentative = tentativeOption === option
                const isCorrect = Array.isArray(currentQuestion.correct_answers)
                  ? currentQuestion.correct_answers.includes(option)
                  : optionLetter === currentQuestion.correct_answers
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
            </div>
          )}
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
                  {currentQuestion.ai_feedback && (
                    <p className="mt-2 text-blue-700 dark:text-blue-300 text-xs">
                      Feedback: {currentQuestion.ai_feedback}
                    </p>
                  )}
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
    </div>
  )
}