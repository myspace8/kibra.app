import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { Exam } from "@/types/exam";

const fetchExams = async (
  key: string,
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  examType: string = "All",
  difficulty: string = "All"
) => {
  let query = supabase
    .from("exams")
    .select(
      `
        id,
        exam_source,
        exam_type,
        subject_id,
        subject,
        question_count,
        total_marks,
        created_at,
        sort_date,
        difficulty,
        topics,
        school_exam_metadata,
        waec_exam_metadata,
        user_exam_metadata,
        user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
      `,
      { count: "exact" }
    )
    .eq("exam_source", "waec")
    .range((page - 1) * limit, page * limit - 1);

  if (examType !== "All") {
    query = query.eq("exam_type", examType);
  }

  if (difficulty !== "All") {
    query = query.eq("difficulty", difficulty);
  }

  if (searchQuery.trim()) {
    const queryLower = searchQuery.toLowerCase().trim();
    query = query.or(
      `subject.ilike.%${queryLower}%,and(topics.cs.{${queryLower}})`
    );
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    exams: data.map((exam) => ({
      ...exam,
      subject: exam.subject || "Unknown",
      exam_type: exam.exam_type === "BECE" ? "BECE" : "WASSCE",
    })),
    hasMore: count ? count > page * limit : false,
    totalCount: count || 0,
  };
};

export function useExams(
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  examType: string = "All",
  difficulty: string = "All"
) {
  const { data, error, isLoading } = useSWR(
    ["exams", page, limit, searchQuery, examType, difficulty],
    ([_, page, limit, searchQuery, examType, difficulty]: [
      string,
      number,
      number,
      string,
      string,
      string
    ]) => fetchExams("exams", page, limit, searchQuery, examType, difficulty),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  return {
    exams: data?.exams as Exam[] | undefined,
    isLoading,
    isError: error,
    hasMore: data?.hasMore ?? false,
    totalCount: data?.totalCount ?? 0,
  };
}