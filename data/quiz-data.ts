import { Question } from "@/types/question"

export const quizData: { questions: Question[] } = {
  questions: [
    {
      id: 1,
      question_type: "objective",
      topic: "Mathematics",
      question: "What is the result of 7 + 8?",
      options: ["13", "14", "15", "16"],
      correct_answers: ["15"],
      explanation:
        "To find the sum of 7 and 8, we add the two numbers together: 7 + 8 = 15. Therefore, the correct answer is 15.",
      hint: "Try counting up from 7 by adding 8 more, or think about what number comes after 14.",
      difficulty: "Easy",
      marks: 2,
      learning_objectives: ["Perform basic arithmetic operations"],
    },
    {
      id: 2,
      question_type: "objective",
      topic: "English Language",
      question: "Which of the following is a proper noun?",
      options: ["book", "London", "teacher", "happy"],
      correct_answers: ["London"],
      explanation:
        "A proper noun is a specific name for a particular person, place, or thing and is always capitalized. In the options given, 'London' is a proper noun because it is the name of a specific city. The other options are common nouns (book, teacher) or an adjective (happy).",
      hint: "Proper nouns are names of specific places, people, or organizations and are always capitalized.",
      difficulty: "Easy",
      marks: 2,
      learning_objectives: ["Identify parts of speech"],
    },
  ],
}