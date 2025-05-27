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
  Award,
  AlertCircle,
  HelpCircle,
  EyeOff,
  BookOpen,
  Building2,
  Globe,
  User,
  Clock,
  ChevronUp,
  ChevronDown,
  Loader2,
  Send,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ReviewMode } from "@/components/learn/review-mode"
import type { Question } from "@/types/question"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { quizData } from "@/data/quiz-data"

type KibraPracticeProps = {
  questions: Question[];
  open: boolean;
  examId?: string;
  onSelectQuizSource?: (examId: string) => void;
  waecExamType?: string;
  quizTitle?: string;
  onQuizComplete?: () => void;
  waecExamYear?: string;
};

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
  topics: string[]
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

interface Student {
  id: number;
  name: string;
  code: string;
}

export default function KibraPractice({ open, questions: initialQuestions, waecExamType, quizTitle, waecExamYear, examId, onQuizComplete, onSelectQuizSource }: KibraPracticeProps) {
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
  const [showDetails, setShowDetails] = useState(true)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMoretopics, setShowMoretopics] = useState<Record<string, boolean>>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedName, setSelectedName] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const renderQuestionText = (text: string) => {
    return { __html: text.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline; text-underline-offset: 2px;">$1</span>') };
  };

  const loadCompletedExams = (): string[] => {
    const userId = session?.user?.id || "anonymous";
    const storedData = localStorage.getItem(`kibra_completed_exams_${userId}`);
    return storedData ? JSON.parse(storedData) : [];
  };

  const saveCompletedExams = (completedExams: string[]) => {
    const userId = session?.user?.id || "anonymous";
    localStorage.setItem(`kibra_completed_exams_${userId}`, JSON.stringify(completedExams));
  };

  const syncCompletionWithSupabase = async (examId: string) => {
    if (session?.user?.id && examId) {
      try {
        const { error } = await supabase
          .rpc("increment_exam_completion", { p_exam_id: examId });

        if (error) {
          console.error("Failed to sync completion with Supabase:", error.message);
        } else {
          console.log("Successfully synced completion for examId:", examId);
        }
      } catch (err) {
        console.error("Error syncing completion with Supabase:", err);
      }
    }
  };

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

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [subjectsData, examsData, studentsData] = await Promise.all([
        supabase.from("subjects").select("id, name").order("name"),
        supabase.from("exams").select(`
          id,
          exam_source,
          subject_id,
          question_count,
          total_marks,
          sort_date,
          difficulty,
          topics,
          school_exam_metadata,
          waec_exam_metadata,
          user_exam_metadata
        `).eq("status", "Published").limit(3).order("sort_date", { ascending: false }),
        supabase.from("students").select("id, name, code"),
      ])

      if (subjectsData.error) throw new Error("Failed to fetch subjects: " + subjectsData.error.message)
      if (examsData.error) throw new Error("Failed to fetch exams: " + examsData.error.message)
      if (studentsData.error) throw new Error("Failed to fetch students: " + studentsData.error.message)

      console.log("Subjects fetched:", subjectsData.data)
      setSubjects(subjectsData.data)

      const completedExamsFromStorage = loadCompletedExams();
      const formattedExams: Exam[] = examsData.data.map((exam: any) => ({
        id: exam.id,
        exam_source: exam.exam_source,
        subject_id: exam.subject_id,
        question_count: exam.question_count,
        total_marks: exam.total_marks,
        sort_date: exam.sort_date,
        difficulty: exam.difficulty,
        topics: exam.topics,
        school_exam_metadata: exam.school_exam_metadata,
        waec_exam_metadata: exam.waec_exam_metadata,
        user_exam_metadata: exam.user_exam_metadata,
        completed: completedExamsFromStorage.includes(exam.id),
      }))
      setExams(formattedExams)

      setStudents(studentsData.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching data.")
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchData()
  }, [open])

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
    if (!tentativeOption) return;
    setSelectedOption(tentativeOption);
    setShowExplanation(true);
    if (!answeredQuestions.includes(currentQuestion.id)) {
      const isCorrect = Array.isArray(currentQuestion.correct_answers)
        ? currentQuestion.correct_answers.includes(tentativeOption)
        : tentativeOption === currentQuestion.correct_answers;
      setAnsweredQuestions((prev) => [...prev, currentQuestion.id]);
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: tentativeOption,
      }));
      if (isCorrect) {
        setCorrectAnswers((prev) => [...prev, currentQuestion.id]);
        setScore((prev) => prev + (currentQuestion.marks || 1));
      }
      const newAnsweredCount = answeredQuestions.length + 1;
      if (newAnsweredCount === totalQuestions) {
        setQuizCompleted(true);
        if (examId && onQuizComplete) {
          const completedExams = loadCompletedExams();
          if (!completedExams.includes(examId)) {
            saveCompletedExams([...completedExams, examId]);
            syncCompletionWithSupabase(examId);
          }
          if (onQuizComplete) onQuizComplete();
        }
      }
    }
    setTentativeOption(null);
    setShowHint(false);
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion && quizCompleted) {
      if (examId) {
        try {
          const { error } = await supabase
            .rpc("increment_exam_completion", { p_exam_id: examId });
          if (error) console.error("Failed to increment exam completion count:", error.message);
          else console.log("Successfully incremented completion count for examId:", examId);
        } catch (err) {
          console.error("Error incrementing exam completion:", err);
        }
      } else {
        console.error("examId is undefined");
      }
      setShowResults(true);
    } else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setTentativeOption(null);
      setShowExplanation(answeredQuestions.includes(questions[currentQuestionIndex + 1].id));
      setShowHint(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(null)
      setTentativeOption(null)
      setShowExplanation(answeredQuestions.includes(questions[currentQuestionIndex - 1].id))
      setShowHint(false)
    }
  }

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index)

  const enterReviewMode = () => setShowReviewMode(true)
  const exitReviewMode = () => setShowReviewMode(false)

  const toggleHint = () => {
    if (!showHint && !hintsUsed.includes(currentQuestion.id)) setHintsUsed((prev) => [...prev, currentQuestion.id])
    setShowHint(!showHint)
  }

  const handleSendResult = async () => {
    setFormError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    if (!selectedName) {
      setFormError("Please select your name.")
      setIsSubmitting(false)
      return
    }

    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      setFormError("Please enter a valid 4-digit code.")
      setIsSubmitting(false)
      return
    }

    const student = students.find(s => s.name === selectedName && s.code === code)
    if (!student) {
      setFormError("Student not found or code is incorrect. Join our WhatsApp group to get enlisted! <a href='https://chat.whatsapp.com/KYL78XfvAy9KQLf5aANOut' target='_blank' class='text-primary underline'>Join Now</a>")
      setIsSubmitting(false)
      return
    }

    try {
      const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0)
      const details = {
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correct_answers: q.correct_answers,
          student_answer: userAnswers[q.id] || null,
        })),
        score: score,
        total_marks: totalMarks,
        timestamp: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("student_results")
        .insert({
          student_name: selectedName,
          exam_id: examId,
          score: score,
          total_marks: totalMarks,
          details: details,
          created_at: new Date().toISOString(),
        })

      if (error) throw new Error("Failed to send result: " + error.message)

      setSubmitSuccess("Result successfully sent to Sir Joe, the ultimate AI sidekick! 🚀")
      setTimeout(() => {
        setIsModalOpen(false)
        setSelectedName("")
        setCode("")
        setSubmitSuccess(null)
      }, 2000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred while sending the result.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!initialQuestions || initialQuestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No questions available. Please select an exam.
        </p>
      </div>
    );
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
      <>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Send Result to Sir Joe</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Meet Sir Joe—An Intelligent assistant wingman to conquer any topic or subject with epic skills! 🎯
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Your Name
                  </label>
                  <select
                    id="student-name"
                    value={selectedName}
                    onChange={(e) => setSelectedName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="">Select a name</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.name}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Your 4-Digit Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={4}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="e.g., 1234"
                  />
                </div>
                {formError && (
                  <p className="text-sm text-red-600 dark:text-red-400" dangerouslySetInnerHTML={{ __html: formError }} />
                )}
                {submitSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">{submitSuccess}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false)
                      setSelectedName("")
                      setCode("")
                      setFormError(null)
                      setSubmitSuccess(null)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendResult}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Result
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-primary/90 to-primary p-6 text-white">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Completed!</h2>
              <p className="text-white/80 text-base">
                {quizTitle ? `You've completed "${quizTitle} ${waecExamYear}"` : "You've completed all questions"}. Here's how you did:
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
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="gap-2 px-4 py-2 text-sm font-medium hover:scale-105"
                >
                  <Send size={16} />
                  Send your result to Sir Joe
                </Button>
                <Link href={"/learn"} className="text-primary underline-offset-4 hover:underline px-4 py-2 hover:scale-105 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                  <Home />
                  <span>Go Home</span>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </>
    )
  }

  const QuizHeader = ({ quizTitle, topic }: { quizTitle?: string; topic?: string; subtopic?: string }) => (
    <div className="flex flex-col items-center gap-2">
      {quizTitle && (
        <h1 className="text-xs font-medium text-center text-gray-500 max-w-[35vw] md:max-w-[45vw] leading-tight">
          {quizTitle}
        </h1>
      )}
      {(topic) && (
        <div className="flex flex-col items-center gap-1 max-w-[64%]">
          {topic && <span className="text-xs text-gray-500 text-center">{topic}</span>}
        </div>
      )}
    </div>
  )

  const QuizFooter = ({ sourceReference, waecExamType }: { sourceReference?: string; waecExamType?: string; currentIndex: number; total: number }) => (
    <div className="flex flex-col items-center gap-2">
      {sourceReference && (
        <p className="text-xs text-gray-500 max-w-[35vw] text-center">
          {"Trial"} <br /> ({waecExamType || ""}{waecExamYear ? `, ${waecExamYear}` : ""})
        </p>
      )}

    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-start justify-between w-full">
          <Link href="/learn" className="flex items-center gap-2 w-max p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex items-center justify-between w-full relative">

            {showDetails && (
              <div className="flex items-start justify-between w-full gap-2">
                <QuizHeader quizTitle={quizTitle} topic={currentQuestion.topic} />
                <QuizFooter sourceReference={currentQuestion.source_reference} waecExamType={waecExamType} currentIndex={currentQuestionIndex} total={totalQuestions} />
              </div>
            )}
          </div>

        </div>
        <div className="flex justify-between w-full">
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex justify-center items-center bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs"
            >
              Q {currentQuestionIndex + 1}/{totalQuestions}
            </button>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-3">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Jump to Question</h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label="Close modal"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {questions.map((_, index) => {
                      const isAnswered = answeredQuestions.includes(questions[index].id);
                      const isCorrect = correctAnswers.includes(questions[index].id);
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentQuestionIndex(index);
                            setIsModalOpen(false);
                          }}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                            isAnswered
                              ? isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                              : index === currentQuestionIndex
                                ? "bg-primary text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          )}
                          aria-label={`Go to question ${index + 1}`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 hover:bg-gray-200 border-black dark:hover:bg-gray-800 absolut bottom-[-15px] right-0 transition-colors"
            aria-label={showDetails ? "Hide question details" : "Show question details"}
          >
            {showDetails ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </Button>
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
            <h2 className="text-base leading-tight tracking-tight" dangerouslySetInnerHTML={renderQuestionText(currentQuestion.question)} />
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
                      isAnswered && isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isWrong ? "border-red-500 bg-red-50 dark:bg-red-900/20" : isTentative ? "border-gray-200" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                      !isAnswered && !isTentative && "hover:shadow-sm",
                      isEliminated && !isAnswered ? "opacity-60" : "",
                      "cursor-pointer",
                    )}
                  >
                    <div className="p-3 flex items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          isAnswered && isCorrect ? "bg-green-500 text-white" : isWrong ? "bg-red-500 text-white" : isTentative ? "bg-primary text-white" : "bg-gray-100 border dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                        )}
                      >
                        {isAnswered && isCorrect ? <CheckCircle size={14} /> : isWrong ? <XCircle size={14} /> : optionLetter}
                      </div>
                      <div className={cn("flex-1 text-sm", isEliminated && !isAnswered ? "line-through text-gray-500 dark:text-gray-400" : "")}>
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
              <p className="text-sm text-gray-700 dark:text-gray-300">Model Answer: {currentQuestion.model_answer}</p>
            </div>
          )}
          <AnimatePresence>
            {showExplanation && (
              <>
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
                    <p className="text-blue-900 dark:text-blue-200 text-xs leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                </motion.div>
                <div className="min-h-[12vh]"></div>
              </>
            )}
          </AnimatePresence>
          <div className="hidden mt-5 md:flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="gap-1 text-sm h-8"
            >
              <ChevronLeft size={14} /> Previous
            </Button>
            {showExplanation ? (
              <Button onClick={handleNextQuestion} className="gap-1 text-sm h-8 bg-primary hover:bg-primary/90">
                {isLastQuestion ? "See Results" : "Next"} {!isLastQuestion && <ChevronRight size={14} />}
              </Button>
            ) : tentativeOption ? (
              <Button onClick={confirmAnswer} className="gap-1 text-sm h-8 bg-green-600 hover:bg-green-700">
                <CheckCircle size={14} /> Confirm
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
                    {showHint ? <EyeOff size={14} /> : <HelpCircle size={14} />} {showHint ? "Hide Hint" : "Hint"}
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
          <ChevronLeft size={14} /> Previous
        </Button>
        {showExplanation ? (
          <Button onClick={handleNextQuestion} className="gap-1 text-sm h-8 bg-primary hover:bg-primary/90">
            {isLastQuestion ? "See Results" : "Next"} {!isLastQuestion && <ChevronRight size={14} />}
          </Button>
        ) : tentativeOption ? (
          <Button onClick={confirmAnswer} className="gap-1 text-sm h-8 bg-green-600 hover:bg-green-700">
            <CheckCircle size={14} /> Confirm
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
                {showHint ? <EyeOff size={14} /> : <HelpCircle size={14} />} {showHint ? "Hide Hint" : "Hint"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}