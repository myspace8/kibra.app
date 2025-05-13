export interface Question {
  id: number;
  question: string; // The question text
  question_type: "objective" | "essay" | "comprehension_and_summary" | "guided_essay" | "theory" | "practical"; // Expanded types
  topic: string; // e.g., Algebra
  subtopic?: string; // e.g., Quadratic Equations
  options?: string[]; // Optional: For objective questions
  correct_answers?: string[]; // Supports multiple correct answers
  model_answer?: string; // For essays, practicals, or theory questions
  explanation: string; // Detailed explanation of the correct answer
  hint?: string; // Optional hint for the student
  difficulty: "Easy" | "Medium" | "Hard"; // Difficulty level
  marks: number; // Points allocated, e.g., 5
  media_url?: string; // URL to image, audio, or video
  media_type?: "image" | "audio" | "video"; // Type of media
  keywords?: string[]; // e.g., ["quadratic", "equations"]
  learning_objectives?: string[]; // e.g., ["Solve quadratic equations"]
  estimated_time?: string; // e.g., "5 minutes"
  source_reference?: string; // e.g., "2023 WASSCE Paper 1 Q5"
  ai_feedback?: string; // AI-generated feedback based on student performance
}