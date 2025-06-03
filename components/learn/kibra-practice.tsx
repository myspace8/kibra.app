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
import MathExpression from "@/components/MathExpression"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Other themes we can use: 'prism', 'prism-okaidia', 'prism-tomorrow', 'prism-coy', 'prism-solarizedlight'

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
interface Student {
  id: number;
  name: string;
  code: string;
}

export default function KibraPractice({ open, questions: initialQuestions, waecExamType, quizTitle, waecExamYear, examId, onQuizComplete }: KibraPracticeProps) {
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
  const [students, setStudents] = useState<Student[]>([])
  // Report issue state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [issue_type, setissue_type] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedName, setSelectedName] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)


  const renderTextWithMath = (text: string) => {
    // Normalize literal \n to actual newlines
    const normalizedText = text.replace(/\\n/g, '\n');

    // Match code blocks with optional language, handling both literal \n and actual newlines
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    let lastIndex = 0;
    const elements = [];

    normalizedText.replace(codeBlockRegex, (match, language, code, index) => {
      // Add text before the code block
      if (index > lastIndex) {
        elements.push(...renderTextParts(normalizedText.slice(lastIndex, index)));
      }
      // Add code block
      const lang = (language || 'text').toLowerCase();
      elements.push(
        <div key={`code-${index}`} className="my-2">
          <SyntaxHighlighter
            language={lang}
            style={prism}
            customStyle={{ fontSize: '0.75rem', padding: '0.5rem', borderRadius: '0.375rem' }}
            wrapLines={true}
          >
            {code.trim()}
          </SyntaxHighlighter>
        </div>
      );
      lastIndex = index + match.length;
      return match;
    });

    // Add remaining text after the last code block
    if (lastIndex < normalizedText.length) {
      elements.push(...renderTextParts(normalizedText.slice(lastIndex)));
    }

    return elements;

    // Helper function to handle LaTeX and plain text
    function renderTextParts(textPart: string) {
      const subParts = textPart.split(/(\$\$.*?\$\$|\$.*?\$)/g).filter(part => part.trim());
      return subParts.map((subPart, subIndex) => {
        if (subPart.startsWith('$$') && subPart.endsWith('$$')) {
          return <MathExpression key={`math-${subIndex}`} latex={subPart} isBlock={true} className="inline-block" />;
        } else if (subPart.startsWith('$') && subPart.endsWith('$')) {
          return <MathExpression key={`math-${subIndex}`} latex={subPart} className="inline" />;
        } else {
          return <span key={`text-${subIndex}`} dangerouslySetInnerHTML={{ __html: subPart.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline; text-underline-offset: 2px;">$1</span>') }} />;
        }
      });
    }
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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from("students").select("id, name, code");
        if (error) {
          console.error("Error fetching students:", error.message);
          setFormError("Failed to load student list. Please try again later.");
          return;
        }
        setStudents(data || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setFormError("An unexpected error occurred while loading students.");
      }
    };

    fetchStudents();
  }, []);

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

  const handleReportSubmit = async () => {
    setIsSubmittingReport(true);
    setReportError(null);
    setReportSuccess(null);

    try {
      const response = await fetch('/api/report-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          exam_id: examId || 'unknown',
          issue_type,
          description,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit report');

      setReportSuccess('Thank you for your report!');
      setissue_type('');
      setDescription('');
      setTimeout(() => setIsReportModalOpen(false), 2000);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

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
          <div className="fixed inset-0  bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
              role="dialog"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Send Result to Sir Joe
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedName("");
                    setCode("");
                    setFormError(null);
                    setSubmitSuccess(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p id="modal-description" className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Submit your quiz results to Sir Joe, your AI-powered learning assistant! Ensure your name and code are correct.
              </p>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Name
                  </label>
                  {students.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading student list...
                    </div>
                  ) : (
                    <select
                      id="student-name"
                      value={selectedName}
                      onChange={(e) => {
                        setSelectedName(e.target.value);
                        setFormError(null);
                      }}
                      className={cn(
                        "mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm transition-all",
                        !selectedName && formError && "border-red-500"
                      )}
                      aria-invalid={!!formError && !selectedName}
                      aria-describedby="student-name-error"
                    >
                      <option value="">Select your name</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.name}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {!selectedName && formError && (
                    <p id="student-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    4-Digit Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                      setFormError(null);
                    }}
                    maxLength={4}
                    className={cn(
                      "mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm transition-all",
                      formError && code.length !== 4 && "border-red-500"
                    )}
                    placeholder="Enter your 4-digit code"
                    aria-invalid={!!formError && code.length !== 4}
                    aria-describedby="code-error"
                  />
                  {formError && code.length !== 4 && (
                    <p id="code-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formError}
                    </p>
                  )}
                </div>
                {formError && !formError.includes("Please") && (
                  <p
                    className="text-sm text-red-600 dark:text-red-400"
                    dangerouslySetInnerHTML={{
                      __html: formError.includes("WhatsApp")
                        ? formError
                        : "Invalid name or code. Please try again.",
                    }}
                  />
                )}
                {submitSuccess && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {submitSuccess}
                  </motion.p>
                )}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedName("");
                      setCode("");
                      setFormError(null);
                      setSubmitSuccess(null);
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendResult}
                    disabled={isSubmitting || students.length === 0}
                    className="px-4 py-2 text-sm flex items-center gap-2 bg-primary hover:bg-primary/90"
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
            </motion.div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-primary/90 to-primary p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-white/90 text-sm">
                {quizTitle
                  ? `You've completed "${quizTitle} ${waecExamYear}"`
                  : "You've completed all questions"}
                . Here's your performance summary:
              </p>
            </div>
            <div className="p-6 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-5xl font-bold text-primary">
                    {score}/{questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                  </div>
                </div>
                <Award
                  size={36}
                  className="absolute -top-2 -right-2 text-yellow-500 drop-shadow-md"
                />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold mb-3">
                  {correctAnswers.length === totalQuestions
                    ? "Perfect Score! 🎉"
                    : score >= questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 0.8
                      ? "Excellent Work! 🌟"
                      : score >= questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 0.6
                        ? "Good Job! 👍"
                        : "Keep Learning! 📚"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
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
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={enterReviewMode}
                  className="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary/90"
                >
                  Review Answers
                </Button>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="px-5 py-2 text-sm font-medium flex items-center gap-2"
                >
                  <Send size={16} />
                  Send Result to Sir Joe
                </Button>
                <Link
                  href="/learn"
                  className="px-5 py-2 text-sm font-medium text-primary flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Home size={16} />
                  Go Home
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </>
    );
  }

  const QuizHeader = ({ quizTitle, topic, subtopic }: { quizTitle?: string; topic?: string; subtopic?: string }) => (
    <div className="flex flex-col items-center gap-2">
      {quizTitle && (
      <h1 className="text-xs font-medium text-center text-gray-500 max-w-[35vw] md:max-w-[45vw] leading-tight">
        {quizTitle}
      </h1>
      )}
      {(topic) && (
      <div className="flex flex-col items-center gap-1 max-w-[64%]">
        {topic && <span className="text-xs text-gray-500 text-center">{topic}</span>}
        {quizTitle === "English Language" && subtopic && (
        <span className="text-xs text-gray-400 text-center">{subtopic}</span>
        )}
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
        <div className="flex items-start justify-between w-full gap-2">
          <Link href="/learn" className="flex items-center gap-2 w-max p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex items-center justify-between w-full relative">
            {showDetails && (
              <div className="flex items-start justify-between w-full gap-2">
                <QuizHeader quizTitle={quizTitle} topic={currentQuestion.topic} subtopic={currentQuestion.subtopic} />
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
            {isReportModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-3">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Report an Issue</h2>
                    <button
                      onClick={() => setIsReportModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label="Close report modal"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Let us know if something is wrong with this question. Your feedback helps us improve!
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Issue Type
                      </label>
                      <select
                        id="issue-type"
                        value={issue_type}
                        onChange={(e) => setissue_type(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm"
                        aria-required="true"
                      >
                        <option value="">Select an issue</option>
                        <option value="Question unclear">Question unclear</option>
                        <option value="Option incorrect">Option incorrect</option>
                        <option value="Correct answer wrong">Correct answer wrong</option>
                        <option value="Typographical error">Typographical error</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm p-2"
                        placeholder="Please describe the issue (e.g., 'Option B should be 1/3, not 1/2')"
                        aria-required="true"
                      />
                    </div>
                    {reportError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{reportError}</p>
                    )}
                    {reportSuccess && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle size={16} /> {reportSuccess}
                      </p>
                    )}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsReportModalOpen(false)}
                        disabled={isSubmittingReport}
                        className="px-4 py-2 text-sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReportSubmit}
                        disabled={isSubmittingReport || !issue_type || !description}
                        className="px-4 py-2 text-sm flex items-center gap-2 bg-primary hover:bg-primary/90"
                      >
                        {isSubmittingReport ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                          </>
                        ) : (
                          <>Submit</>
                        )}
                      </Button>
                    </div>
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
            <h2 className="text-base leading-tight">
              {renderTextWithMath(currentQuestion.question)}
            </h2>
          </div>
          {showHint && currentQuestion.hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md"
            >
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <p className="text-xs">{renderTextWithMath(currentQuestion.hint)}</p>
              </div>
            </motion.div>
          )}
          {currentQuestion.question_type === "objective" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === option
                const isTentative = tentativeOption === option
                const isCorrect = Array.isArray(currentQuestion.correct_answers)
                  ? currentQuestion.correct_answers.includes(option)
                  : option.startsWith(currentQuestion.correct_answers ?? "")
                const isAnswered = answeredQuestions.includes(currentQuestion.id)
                const isWrong = isAnswered && isSelected && !isCorrect
                const isEliminated = currentEliminatedOptions.includes(option)

                // Check if it's a True/False question (2 options: "True", "False")
                const isTrueFalse = currentQuestion.options?.length === 2 && currentQuestion.options.every(opt => ["True", "False"].includes(opt));

                return (
                  <div
                    key={index}
                    onClick={() => !isTrueFalse && handleOptionSelect(option)}
                    className={cn(
                      "relative group transition-all duration-200 border-y",
                      isAnswered && isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isWrong ? "border-red-500 bg-red-50 dark:bg-red-900/20" : isTentative ? "border-gray-200" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                      !isAnswered && !isTentative && !isTrueFalse && "hover:shadow-sm",
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
                        {isAnswered && isCorrect ? <CheckCircle size={14} /> : isWrong ? <XCircle size={14} /> : isTrueFalse ? option : option.split(".")[0]}
                      </div>
                      <div className={cn("flex-1 text-sm", isEliminated && !isAnswered ? "line-through text-gray-500 dark:text-gray-400" : "")}>
                        {renderTextWithMath(isTrueFalse ? option : option.split(".").slice(1).join(".").trim())}
                      </div>
                      {!isAnswered && !isTrueFalse && (
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
              <p className="text-sm text-gray-700 dark:text-gray-300">Model Answer: {renderTextWithMath(currentQuestion.model_answer)}</p>
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
                    <div className="text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
                      {renderTextWithMath(currentQuestion.explanation.replace(/option (\w)/gi, (match, letter) => `Option ${letter.toUpperCase()}`))}
                    </div>
                  </div>
                </motion.div>
                <div className="min-h-[12vh] md:min-h-0"></div>
              </>
            )}
          </AnimatePresence>
          <div className="hidden mt-5 md:flex justify-between">
            <div className="flex flex-col items-start gap-2">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="gap-1 text-sm h-8"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                className="mt-2 flex-shrink-0 h-7 px-2 text-xs text-red-600 hover:text-red-700"
                aria-label="Report an issue with this question"
              >
                <AlertCircle size={14} /> Report Issue
              </Button>
            </div>
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
        <div className="flex flex-col items-start gap-">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="gap-1 text-sm h-8"
          >
            <ChevronLeft size={14} /> Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="mt-2 flex-shrink-0 h-7 px-2 text-xs text-red-600 hover:text-red-700"
            aria-label="Report an issue with this question"
          >
            <AlertCircle size={14} /> Report Issue
          </Button>
        </div>
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