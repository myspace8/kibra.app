export interface Exam {
    score: any;
    id: string;
    exam_source: "school" | "waec" | "user";
    subject: string;
    exam_type: string; // "BECE", "WASSCE", or "EXPLORER"
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
    completed: boolean;
    // score: number;
}