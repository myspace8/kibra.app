import type { Question } from "@/types/question"

export interface SchoolExam {
  id: number
  name: string
  subject: string
  gradeLevel: string
  questions: Question[]
  totalMarks: number
  examDate: string
}

export const schoolExamData: SchoolExam[] = [
  {
    id: 1,
    name: "Mid-Term Exam 2025",
    subject: "Mathematics, English, Science",
    gradeLevel: "Senior High School - Year 2",
    questions: [
      {
        id: 301,
        question_type: "objective",
        topic: "Mathematics",
        subtopic: "Geometry",
        question: "What is the area of a triangle with base 6 cm and height 8 cm?",
        options: ["24 cm²", "48 cm²", "12 cm²", "36 cm²"],
        correct_answers: ["24 cm²"],
        explanation:
          "The area of a triangle is calculated using the formula: (1/2) × base × height. Here, base = 6 cm and height = 8 cm, so area = (1/2) × 6 × 8 = 24 cm².",
        hint: "Recall the formula for the area of a triangle: (1/2) × base × height.",
        difficulty: "Medium",
        marks: 3,
        media_url: "https://example.com/triangle-diagram.png",
        keywords: ["triangle", "area", "geometry"],
        learning_objectives: ["Calculate the area of basic shapes"],
        estimated_time: "3 minutes",
        source_reference: "Mid-Term Exam 2025, Q1",
      },
      {
        id: 302,
        question_type: "essay",
        topic: "English Language",
        subtopic: "Comprehension",
        question: "Write a summary of the following passage in 50 words or less: [Passage about the importance of education in modern society...]",
        model_answer:
          "Education is crucial in modern society as it empowers individuals, drives economic growth, and fosters innovation. It equips people with skills for better jobs and critical thinking for solving problems, ensuring a progressive and informed community.",
        explanation:
          "A good summary should capture the main ideas of the passage—education’s role in empowerment, economic growth, and innovation—while being concise and under 50 words.",
        difficulty: "Hard",
        marks: 5,
        keywords: ["education", "society", "summary"],
        learning_objectives: ["Summarize texts effectively"],
        estimated_time: "10 minutes",
        source_reference: "Mid-Term Exam 2025, Q2",
      },
      {
        id: 303,
        question_type: "practical",
        topic: "Science",
        subtopic: "Physics",
        question: "Describe an experiment to measure the acceleration due to gravity using a simple pendulum.",
        model_answer:
          "Set up a simple pendulum with a string and a bob. Measure the string length (L). Displace the bob slightly and time 10 oscillations (T). Calculate the period (T/10). Use the formula g = 4π²L/T² to find acceleration due to gravity (g).",
        explanation:
          "The answer should outline the setup (pendulum, string, bob), procedure (measure length, time oscillations), and calculation (using g = 4π²L/T²).",
        difficulty: "Hard",
        marks: 6,
        media_url: "https://example.com/pendulum-experiment-diagram.png",
        keywords: ["pendulum", "gravity", "physics"],
        learning_objectives: ["Conduct experiments to measure physical constants"],
        estimated_time: "15 minutes",
        source_reference: "Mid-Term Exam 2025, Q3",
      },
      {
        id: 304,
        question_type: "objective",
        topic: "Mathematics",
        subtopic: "Algebra",
        question: "Solve for x: 2x - 4 = 10",
        options: ["x = 3", "x = 7", "x = 5", "x = 8"],
        correct_answers: ["x = 7"],
        explanation:
          "To solve 2x - 4 = 10, add 4 to both sides: 2x = 14. Then divide by 2: x = 7.",
        hint: "Isolate x by adding 4 to both sides, then divide by 2.",
        difficulty: "Easy",
        marks: 2,
        keywords: ["linear equation", "algebra"],
        learning_objectives: ["Solve simple linear equations"],
        estimated_time: "2 minutes",
        source_reference: "Mid-Term Exam 2025, Q4",
      },
      {
        id: 305,
        question_type: "objective",
        topic: "English Language",
        subtopic: "Vocabulary",
        question: "Choose the synonym for 'benevolent':",
        options: ["Kind", "Harsh", "Indifferent", "Cautious"],
        correct_answers: ["Kind"],
        explanation:
          "'Benevolent' means showing kindness or goodwill. Among the options, 'Kind' is the closest synonym.",
        hint: "Think of a word that means showing kindness or goodwill.",
        difficulty: "Medium",
        marks: 3,
        keywords: ["vocabulary", "synonym"],
        learning_objectives: ["Expand vocabulary through synonyms"],
        estimated_time: "1 minute",
        source_reference: "Mid-Term Exam 2025, Q5",
        ai_feedback: "You selected 'Harsh,' which is an antonym. Review the meaning of 'benevolent'—it relates to kindness. Practice with similar words like 'charitable' to reinforce this concept."
      },
    ],
    totalMarks: 19,
    examDate: "2025-05-10",
  },
]