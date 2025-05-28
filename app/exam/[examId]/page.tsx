"use client"

import { use } from 'react';
import { useState, useEffect } from "react";
import KibraPractice from "@/components/learn/kibra-practice";
import { supabase } from "@/lib/supabase";
import { Question } from "@/types/question";
import { Loader2 } from "lucide-react";

interface Exam {
  id: string;
  exam_source: "school" | "waec" | "user";
  subject_id: number;
  subject: string;
  exam_type?: string; // Updated to use exam_type as a column
  waec_exam_metadata?: {
    exam_year: number;
    exam_session: "May/June" | "November/December";
    region: string;
    syllabus_version: string;
  };
}

interface PageProps {
  params: Promise<{ examId: string }>; // Update type to reflect params as a Promise
}

export default function ExamPage({ params }: PageProps) {
  const { examId } = use(params); 
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [waecExamType, setWaecExamType] = useState<string>("");
  const [waecExamYear, setWaecExamYear] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_source,
            subject_id,
            subject,
            exam_type, 
            waec_exam_metadata,
            subjects (name)
          `)
          .eq("id", examId)
          .single();

        if (examError || !examData) {
          throw new Error("Failed to fetch exam: " + (examError?.message || "Exam not found"));
        }

        const exam: Exam = examData as unknown as Exam;
        const subjectName = examData.subject;
        const source = exam.exam_source;
        const examYear = source === "waec" ? exam.waec_exam_metadata?.exam_year : null;
        const institution =
          source === "waec" ? exam.waec_exam_metadata?.region || "WAEC" : "Unknown";
        setQuizTitle(`${subjectName}`);
        if (exam.exam_source === "waec" && exam.exam_type) {  // Updated to use exam_type column
          setWaecExamType(exam.exam_type);
        }
        if (exam.exam_source === "waec" && exam.waec_exam_metadata) {
          setWaecExamYear(exam.waec_exam_metadata.exam_year.toString());
        }

        // Fetch questions
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
        examId={examId} // Pass examId as a prop
        waecExamType={waecExamType}
        quizTitle={quizTitle}
        waecExamYear={waecExamYear}
      />
    </div>
  );
}