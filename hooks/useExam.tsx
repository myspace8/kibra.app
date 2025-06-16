import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { Exam } from "@/types/exam";

// Fetcher function that properly handles Supabase queries
const fetchExams = async (key: string, userId?: string) => {
    let query = supabase.from("exams").select(
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
        `
    );

    if (userId) {
        query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return data.map((exam) => ({
        ...exam,
        subject: exam.subject || "Unknown",
    }));
};

export function useExams(userId?: string) {
    const { data, error, isLoading } = useSWR(
        userId ? ["exams", userId] : ["exams"],
        ([_, userId]: [string, string?]) => fetchExams("exams", userId),
        {
            refreshInterval: 30000, // Revalidate every 30 seconds
            revalidateOnFocus: false, // Optional: disable revalidation on window focus
        }
    );

    return {
        exams: data as Exam[] | undefined,
        isLoading,
        isError: error,
    };
}