import type { Question } from "@/types/question"

export interface QuizSource {
  id: number
  name: string
  questions: Question[]
  completed: boolean
  category: string
  questionCount: number
  isPublic: boolean
  creator: string
  institution: string
}

export const quizSources: QuizSource[] = [
  {
    id: 1,
    name: "Mathematics: Algebra Basics",
    questions: [
      {
        id: 101,
        question_type: "objective",
        topic: "Mathematics",
        question: "What is the value of x in the equation 2x + 5 = 15?",
        options: ["5", "10", "7.5", "5.5"],
        correct_answers: ["5"],
        explanation:
          "To solve for x, subtract 5 from both sides: 2x + 5 - 5 = 15 - 5, which gives 2x = 10. Then divide by 2: 2x/2 = 10/2, resulting in x = 5.",
        hint: "Subtract 5 from both sides, then divide by 2.",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Solve linear equations"],
      },
      {
        id: 102,
        question_type: "objective",
        topic: "Mathematics",
        question: "Which of the following expressions is equivalent to 3(x + 4)?",
        options: ["3x + 4", "3x + 7", "3x + 12", "7x"],
        correct_answers: ["3x + 12"],
        explanation:
          "Expand 3(x + 4) using the distributive property: 3(x + 4) = 3x + 3(4) = 3x + 12.",
        hint: "Use the distributive property: a(b + c) = ab + ac",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Apply distributive property"],
      },
      {
        id: 103,
        question_type: "objective",
        topic: "Mathematics",
        question: "If y = 2x - 3, what is the value of y when x = 4?",
        options: ["5", "8", "1", "11"],
        correct_answers: ["5"],
        explanation: "Substitute x = 4 into y = 2x - 3: y = 2(4) - 3 = 8 - 3 = 5.",
        hint: "Substitute x = 4 into the equation and solve for y.",
        difficulty: "Easy",
        marks: 2,
        learning_objectives: ["Evaluate linear expressions"],
      },
      {
        id: 104,
        question_type: "objective",
        topic: "Mathematics",
        question: "What is the slope of the line passing through the points (2, 3) and (4, 7)?",
        options: ["1", "2", "3", "4"],
        correct_answers: ["2"],
        explanation:
          "The slope is (y₂ - y₁)/(x₂ - x₁): (7 - 3)/(4 - 2) = 4/2 = 2.",
        hint: "Use the slope formula: (y₂ - y₁)/(x₂ - x₁)",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Calculate slope of a line"],
      },
      {
        id: 105,
        question_type: "objective",
        topic: "Mathematics",
        question: "Solve for x: 3x - 7 = 2x + 5",
        options: ["x = 12", "x = -12", "x = 12/5", "x = 12/7"],
        correct_answers: ["x = 12"],
        explanation: "3x - 7 = 2x + 5\n3x - 2x = 5 + 7\nx = 12",
        hint: "Move all x terms to one side and constants to the other.",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Solve linear equations"],
      },
    ],
    completed: false,
    category: "Mathematics",
    questionCount: 5,
    isPublic: false,
    creator: "Ms. Johnson",
    institution: "Prempeh College",
  },
  {
    id: 2,
    name: "English: Grammar Fundamentals",
    questions: [
      {
        id: 201,
        question_type: "objective",
        topic: "English Language",
        question: "Which of the following sentences contains a pronoun error?",
        options: [
          "She and I went to the store.",
          "The teacher gave the book to him and me.",
          "Between you and I, the test was difficult.",
          "They asked her about the project.",
        ],
        correct_answers: ["Between you and I, the test was difficult"],
        explanation:
          "The phrase 'between you and I' is incorrect. Prepositions like 'between' require object pronouns ('me'), not subject pronouns ('I'). Correct form: 'between you and me.'",
        hint: "Check for subject vs. object pronoun usage after prepositions.",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Identify pronoun errors"],
      },
      {
        id: 202,
        question_type: "objective",
        topic: "English Language",
        question: "Which sentence uses the correct form of the verb?",
        options: [
          "The team are playing well today.",
          "The team is playing well today.",
          "The team were playing well today.",
          "The team be playing well today.",
        ],
        correct_answers: ["The team is playing well today"],
        explanation:
          "In American English, 'team' is singular, requiring 'is.' In British English, plural verbs are sometimes used, but 'is' is standard here.",
        hint: "Match the verb to the singular/plural subject.",
        difficulty: "Easy",
        marks: 2,
        learning_objectives: ["Use correct verb agreement"],
      },
      {
        id: 203,
        question_type: "objective",
        topic: "English Language",
        question: "Identify the sentence with correct punctuation:",
        options: [
          "My friend who lives in Boston, is visiting next week.",
          "My friend, who lives in Boston is visiting next week.",
          "My friend who lives in Boston is visiting next week.",
          "My friend, who lives in Boston, is visiting next week.",
        ],
        correct_answers: ["My friend, who lives in Boston, is visiting next week"],
        explanation:
          "Non-restrictive clauses (extra info) need commas on both sides. 'Who lives in Boston' is non-restrictive, so option D is correct.",
        hint: "Use commas for non-essential clauses.",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Apply correct punctuation"],
      },
      {
        id: 204,
        question_type: "objective",
        topic: "English Language",
        question: "Which sentence contains a misplaced modifier?",
        options: [
          "Running late, she quickly ate breakfast.",
          "She quickly ate breakfast, running late.",
          "Running late, breakfast was quickly eaten by her.",
          "Quickly eating breakfast, she was running late.",
        ],
        correct_answers: ["Running late, breakfast was quickly eaten by her"],
        explanation:
          "The modifier 'Running late' wrongly modifies 'breakfast,' implying it was late, which is illogical. It should modify 'she.'",
        hint: "Ensure modifiers describe the intended subject.",
        difficulty: "Hard",
        marks: 4,
        learning_objectives: ["Correct misplaced modifiers"],
      },
      {
        id: 205,
        question_type: "objective",
        topic: "English Language",
        question: "Which of the following is a complete sentence (not a fragment)?",
        options: [
          "When the rain finally stopped.",
          "Although we waited for hours.",
          "After completing the difficult assignment.",
          "The museum closed early because of the storm.",
        ],
        correct_answers: ["The museum closed early because of the storm"],
        explanation:
          "A complete sentence needs a subject, verb, and complete thought. Only D has these, while A, B, and C are dependent clauses.",
        hint: "Look for a subject and verb expressing a full idea.",
        difficulty: "Medium",
        marks: 3,
        learning_objectives: ["Identify complete sentences"],
      },
    ],
    completed: true,
    category: "English",
    questionCount: 5,
    isPublic: true,
    creator: "Mr. Aquah",
    institution: "Good Shepherd R/C JHS",
  },
]