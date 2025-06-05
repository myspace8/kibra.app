"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import KibraPractice from "@/components/learn/kibra-practice";
import { supabase } from "@/lib/supabase";
import { Question } from "@/types/question";
import { Loader2 } from "lucide-react";

interface Exam {
  id: string;
  exam_source: "school" | "waec" | "user";
  subject: string;
  exam_type: string;
  question_count: number;
  total_marks: number;
  sort_date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  created_at: Date;
  school_exam_metadata?: {
    school: string;
    grade_level: string;
    date: string;
    examiner: string;
    school_location?: { region: string; city?: string; country?: string };
  };
  waec_exam_metadata?: {
    exam_year: number;
    exam_session: "May/June" | "November/December";
    region: string;
    syllabus_version: string;
  };
  user_exam_metadata?: {
    creator_id: string;
    creator_name: string;
    date?: string;
    description?: string;
  };
  // score: number; // Retain score as it might be used for display purposes
}

interface PageProps {
  params: Promise<{ examId: string }>;
}

export default function ExamPage({ params }: PageProps) {
  const { examId } = use(params);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [waecExamType, setWaecExamType] = useState<string>("");
  const [waecExamYear, setWaecExamYear] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);

// In ExamPage.tsx
useEffect(() => {
  const fetchExamData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the current exam
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select(`
          id,
          exam_source,
          exam_type,
          subject,
          question_count,
          total_marks,
          sort_date,
          created_at,
          difficulty,
          topics,
          school_exam_metadata,
          waec_exam_metadata,
          user_exam_metadata,
          user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
        `)
        .eq("id", examId)
        .single();

      if (examError || !examData) {
        throw new Error("Failed to fetch exam: " + (examError?.message || "Exam not found"));
      }

      const currentExam = examData as Exam;
      setExams([currentExam]); // Temporarily set the current exam
      const subjectName = currentExam.subject || "Unknown Subject";
      const source = currentExam.exam_source;
      setQuizTitle(subjectName);
      if (source === "waec" && currentExam.exam_type) {
        setWaecExamType(currentExam.exam_type);
      }
      if (source === "waec" && currentExam.waec_exam_metadata && currentExam.waec_exam_metadata.exam_year) {
        setWaecExamYear(currentExam.waec_exam_metadata.exam_year.toString());
      }

      // Fetch additional exams with the same subject
      const { data: relatedExamsData, error: relatedExamsError } = await supabase
        .from("exams")
        .select(`
          id,
          exam_source,
          exam_type,
          subject,
          question_count,
          total_marks,
          sort_date,
          created_at,
          difficulty,
          topics,
          school_exam_metadata,
          waec_exam_metadata,
          user_exam_metadata
        `)
        .eq("subject", currentExam.subject)
        .neq("id", examId) // Exclude the current exam
        .limit(5); // Limit to a reasonable number of suggestions

      if (relatedExamsError) {
        console.error("Failed to fetch related exams:", relatedExamsError.message);
      } else {
        setExams([currentExam, ...(relatedExamsData as Exam[])]); // Combine current and related exams
      }

      // Fetch questions (unchanged)
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
            marks,
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
        question_type: q.question_pool.question_type || "",
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
      setError(err instanceof Error ? err.message : "An error occurred while loading the exam.");
    } finally {
      setLoading(false);
    }
  };

  fetchExamData();
}, [examId]);// In ExamPage.tsx
useEffect(() => {
  const fetchExamData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the current exam
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select(`
          id,
          exam_source,
          exam_type,
          subject,
          question_count,
          total_marks,
          sort_date,
          created_at,
          difficulty,
          topics,
          school_exam_metadata,
          waec_exam_metadata,
          user_exam_metadata,
          user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
        `)
        .eq("id", examId)
        .single();

      if (examError || !examData) {
        throw new Error("Failed to fetch exam: " + (examError?.message || "Exam not found"));
      }

      const currentExam = examData as Exam;
      setExams([currentExam]); // Temporarily set the current exam
      const subjectName = currentExam.subject || "Unknown Subject";
      const source = currentExam.exam_source;
      setQuizTitle(subjectName);
      if (source === "waec" && currentExam.exam_type) {
        setWaecExamType(currentExam.exam_type);
      }
      if (source === "waec" && currentExam.waec_exam_metadata && currentExam.waec_exam_metadata.exam_year) {
        setWaecExamYear(currentExam.waec_exam_metadata.exam_year.toString());
      }

      // Fetch additional exams with the same subject
      const { data: relatedExamsData, error: relatedExamsError } = await supabase
        .from("exams")
        .select(`
          id,
          exam_source,
          exam_type,
          subject,
          question_count,
          total_marks,
          sort_date,
          created_at,
          difficulty,
          topics,
          school_exam_metadata,
          waec_exam_metadata,
          user_exam_metadata
        `)
        .eq("subject", currentExam.subject)
        .neq("id", examId) // Exclude the current exam
        .limit(5); // Limit to a reasonable number of suggestions

      if (relatedExamsError) {
        console.error("Failed to fetch related exams:", relatedExamsError.message);
      } else {
        setExams([currentExam, ...(relatedExamsData as Exam[])]); // Combine current and related exams
      }

      // Fetch questions (unchanged)
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
            marks,
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
        question_type: q.question_pool.question_type || "",
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
      setError(err instanceof Error ? err.message : "An error occurred while loading the exam.");
    } finally {
      setLoading(false);
    }
  };

  fetchExamData();
}, [examId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <KibraPractice
        questions={questions}
        open={true}
        examId={examId}
        waecExamType={waecExamType}
        quizTitle={quizTitle}
        waecExamYear={waecExamYear}
        exams={exams}
      />
    </div>
  );
}