"use client";

import { useState, useEffect } from "react";
import { LearnPageHeader } from "@/components/learn/learn-page-header";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/question";
import { useSession } from "next-auth/react";
import { Building2, CheckCircle, Clock, Globe, Loader2, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Interfaces
interface Subject {
  id: number;
  name: string;
}

interface Exam {
  id: string;
  exam_source: "school" | "waec" | "user";
  subject_id: number;
  subject: string;
  question_count: number;
  total_marks: number;
  sort_date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  school_exam_metadata?: {
    school: string;
    grade_level: string;
    date: string;
    exam_type: string;
    examiner: string;
    school_location?: { region: string; city?: string; country?: string };
  };
  waec_exam_metadata?: {
    exam_type: "BECE" | "WASSCE";
    exam_year: number;
    exam_session: "May/June" | "November/December";
    region: string;
    syllabus_version: string;
  };
  user_exam_metadata?: {
    creator_id: string;
    creator_name: string;
    date?: string;
    exam_type?: string;
    description?: string;
  };
  completed: boolean;
}

export default function Learn() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string | undefined>(undefined);
  const [waecExamType, setWaecExamType] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true); // Start as true to show loading state initially
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(true); // Set to true initially
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [showMoretopics, setShowMoretopics] = useState<Record<string, boolean>>({});

  // Fetch all published exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, name")
          .order("name");

        if (subjectsError) throw new Error("Failed to fetch subjects: " + subjectsError.message);
        setSubjects(subjectsData || []);

        // Fetch published exams with completion status
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_source,
            subject_id,
            subject,
            question_count,
            total_marks,
            sort_date,
            difficulty,
            topics,
            school_exam_metadata,
            waec_exam_metadata,
            user_exam_metadata,
            user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
          `)
          .order("sort_date", { ascending: false })
          .limit(3); // Limit to 3 exams

        if (examsError) throw new Error("Failed to fetch exams: " + examsError.message);

        const formattedExams: Exam[] = examsData?.map((exam: any) => ({
          id: exam.id,
          exam_source: exam.exam_source,
          subject_id: exam.subject_id,
          subject: exam.subject,
          question_count: exam.question_count || 0,
          total_marks: exam.total_marks || 0,
          sort_date: exam.sort_date,
          difficulty: exam.difficulty || "Medium",
          topics: exam.topics || [],
          school_exam_metadata: exam.school_exam_metadata || undefined,
          waec_exam_metadata: exam.waec_exam_metadata || undefined,
          user_exam_metadata: exam.user_exam_metadata || undefined,
          completed: !!exam.user_exam_progress?.completed_at,
        })) || [];

        setExams(formattedExams);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching exams.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [session?.user?.id]);

  // Fetch specific exam data when selected
  const fetchData = async (examId: string) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setMenuOpen(false); // Close menu here

    try {
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select(`
          id,
          exam_source,
          subject_id,
          subject,
          subjects (name),
          school_exam_metadata,
          waec_exam_metadata,
          difficulty
        `)
        .eq("id", examId)
        .eq("status", "Published")
        .limit(3)
        .order("sort_date", { ascending: false })
        .single();

      if (examError || !examData) {
        throw new Error("Failed to fetch exam details: " + (examError?.message || "Exam not found"));
      }

      const subjectName = examData.subject || "Unknown Subject";
      const institution =
        examData.exam_source === "school"
          ? examData.school_exam_metadata?.school || "Unknown School"
          : examData.exam_source === "waec"
          ? examData.waec_exam_metadata?.region || "WAEC"
          : "User Created";
      setQuizTitle(`${subjectName} - ${institution}`);
      if (examData.exam_source === "waec" && examData.waec_exam_metadata) {
        setWaecExamType(examData.waec_exam_metadata.exam_type);
      }

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
        .order("order", { ascending: true });

      if (questionsError || !questionsData) {
        throw new Error("Failed to fetch questions: " + (questionsError?.message || "No questions found"));
      }

      const formattedQuestions: Question[] = questionsData.map((q: any) => ({
        id: q.question_id,
        question: q.question_pool.question || "",
        question_type: q.question_pool.question_type || "objective",
        topic: q.question_pool.topic || "",
        subtopic: q.question_pool.subtopic || "",
        options: q.question_pool.options || [],
        correct_answers: q.question_pool.correct_answers || "",
        model_answer: q.question_pool.model_answer || "",
        explanation: q.question_pool.explanation || "",
        hint: q.question_pool.hint || "",
        difficulty: q.question_pool.difficulty || "Medium",
        marks: q.marks || 1,
        media_url: q.question_pool.media_url || "",
        media_type: q.question_pool.media_type || "",
        keywords: q.question_pool.keywords || [],
        learning_objectives: q.question_pool.learning_objectives || [],
        estimated_time: q.question_pool.estimated_time || 0,
        source_reference: q.question_pool.source_reference || "",
        ai_feedback: q.question_pool.ai_feedback || "",
      }));

      setQuestions(formattedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while loading the quiz.");
    } finally {
      setLoading(false);
    }
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
  const userName = session?.user?.name?.split(" ")[0] || "User";

  return (
    <>
      <LearnPageHeader onSelectQuizSource={fetchData} />
      <main className="min-h-[calc(100vh-4rem)] overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-6 px-3">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
              <Link
              href={"/learn"}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                <RefreshCw size={16} />
                Reload
              </Link>
            </div>
          )}

          {!loading && !error && (
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
                  Learn by solving
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-4 m-auto">
                {exams.length === 0 ? (
                  <p className="text-center text-gray-500">No exams available. Please try again later.</p>
                ) : (
                  <div className="space-y-3 pb-8" style={{ scrollbarWidth: "thin" }}>
                    {exams.map((exam) => {
                      // const subject = subjects.find((s) => s.id === exam.subject_id)?.name || "Unknown Subject";
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
                        <Link
                        href={`/exam/${exam.id}`}
                        key={exam.id}
                        className={cn(
                          "flex w-full items-center justify-between border-b py-4 px-2 text-left transition-colors",
                          exam.completed
                            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                        )}
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
                            {exam.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium">
                              {exam.subject} {examType} {examDate && `(${examDate})`}
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
                                  <span>{exam.question_count} questions</span>
                                  {exam.exam_source !== "waec" && exam.exam_source !== "school" && (
                                    <span> • {exam.difficulty}</span>
                                  )}
                                </div>
                              </div>
                              {exam.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {exam.topics.slice(0, showMoretopics[exam.id] ? 18 : 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 text-xs w-max bg-gray-100 dark:bg-gray-800 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {exam.topics.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowMoretopics((prev) => ({
                                          ...prev,
                                          [exam.id]: !prev[exam.id],
                                        }));
                                      }}
                                      className="px-1.5 py-0.5 text-xs w-max bg-gray-200 dark:bg-gray-700 rounded-full text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setShowMoretopics((prev) => ({
                                            ...prev,
                                            [exam.id]: !prev[exam.id],
                                          }));
                                        }
                                      }}
                                    >
                                      {showMoretopics[exam.id] ? "Less" : `+${exam.topics.length - 3} more`}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}