import type { Question } from "@/types/quiz"

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
        component: "Mathematics",
        question: "What is the value of x in the equation 2x + 5 = 15?",
        options: ["5", "10", "7.5", "5.5"],
        correct_answer: "A",
        explanation:
          "To solve for x, we need to isolate it by subtracting 5 from both sides: 2x + 5 - 5 = 15 - 5, which gives us 2x = 10. Then divide both sides by 2: 2x/2 = 10/2, resulting in x = 5.",
        hint: "Subtract 5 from both sides, then divide by 2.",
      },
      {
        id: 102,
        component: "Mathematics",
        question: "Which of the following expressions is equivalent to 3(x + 4)?",
        options: ["3x + 4", "3x + 7", "3x + 12", "7x"],
        correct_answer: "C",
        explanation:
          "To expand 3(x + 4), we multiply each term inside the parentheses by 3: 3(x + 4) = 3x + 3(4) = 3x + 12.",
        hint: "Use the distributive property: a(b + c) = ab + ac",
      },
      {
        id: 103,
        component: "Mathematics",
        question: "If y = 2x - 3, what is the value of y when x = 4?",
        options: ["5", "8", "1", "11"],
        correct_answer: "A",
        explanation: "Substitute x = 4 into the equation y = 2x - 3: y = 2(4) - 3 = 8 - 3 = 5.",
        hint: "Substitute x = 4 into the equation and solve for y.",
      },
      {
        id: 104,
        component: "Mathematics",
        question: "What is the slope of the line passing through the points (2, 3) and (4, 7)?",
        options: ["1", "2", "3", "4"],
        correct_answer: "B",
        explanation:
          "The slope is calculated using the formula (y₂ - y₁)/(x₂ - x₁). Substituting our points: (7 - 3)/(4 - 2) = 4/2 = 2.",
        hint: "Use the slope formula: (y₂ - y₁)/(x₂ - x₁)",
      },
      {
        id: 105,
        component: "Mathematics",
        question: "Solve for x: 3x - 7 = 2x + 5",
        options: ["x = 12", "x = -12", "x = 12/5", "x = 12/7"],
        correct_answer: "A",
        explanation: "3x - 7 = 2x + 5\n3x - 2x = 5 + 7\nx = 12",
        hint: "Move all terms with x to one side and all constants to the other side.",
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
        component: "English Language",
        question: "Which of the following sentences contains a pronoun error?",
        options: [
          "She and I went to the store.",
          "The teacher gave the book to him and me.",
          "Between you and I, the test was difficult.",
          "They asked her about the project.",
        ],
        correct_answer: "C",
        explanation:
          "In the phrase 'between you and I,' the pronoun 'I' is incorrect. Prepositions like 'between' should be followed by object pronouns, not subject pronouns. The correct form would be 'between you and me.'",
        hint: "Look for incorrect use of subject pronouns (I, he, she, we, they) where object pronouns (me, him, her, us, them) should be used.",
      },
      {
        id: 202,
        component: "English Language",
        question: "Which sentence uses the correct form of the verb?",
        options: [
          "The team are playing well today.",
          "The team is playing well today.",
          "The team were playing well today.",
          "The team be playing well today.",
        ],
        correct_answer: "B",
        explanation:
          "In American English, collective nouns like 'team' are treated as singular and take singular verbs. Therefore, 'The team is playing well today' is correct. (Note: In British English, collective nouns can sometimes take plural verbs when emphasizing the individuals in the group.)",
        hint: "Consider whether the subject is singular or plural, and match the verb accordingly.",
      },
      {
        id: 203,
        component: "English Language",
        question: "Identify the sentence with correct punctuation:",
        options: [
          "My friend who lives in Boston, is visiting next week.",
          "My friend, who lives in Boston is visiting next week.",
          "My friend who lives in Boston is visiting next week.",
          "My friend, who lives in Boston, is visiting next week.",
        ],
        correct_answer: "D",
        explanation:
          "When a non-restrictive clause (a clause that provides additional information but isn't essential to the sentence's meaning) is used, it should be set off with commas on both sides. 'Who lives in Boston' is a non-restrictive clause here, so option D with commas before and after the clause is correct.",
        hint: "Look for proper comma usage with non-restrictive clauses (clauses that add information but aren't essential to the sentence's meaning).",
      },
      {
        id: 204,
        component: "English Language",
        question: "Which sentence contains a misplaced modifier?",
        options: [
          "Running late, she quickly ate breakfast.",
          "She quickly ate breakfast, running late.",
          "Running late, breakfast was quickly eaten by her.",
          "Quickly eating breakfast, she was running late.",
        ],
        correct_answer: "C",
        explanation:
          "In option C, the modifier 'Running late' incorrectly modifies 'breakfast,' suggesting that the breakfast was running late, which is illogical. The modifier should describe the person (she) who was running late.",
        hint: "A misplaced modifier occurs when a descriptive phrase is positioned so that it appears to modify the wrong element in a sentence.",
      },
      {
        id: 205,
        component: "English Language",
        question: "Which of the following is a complete sentence (not a fragment)?",
        options: [
          "When the rain finally stopped.",
          "Although we waited for hours.",
          "After completing the difficult assignment.",
          "The museum closed early because of the storm.",
        ],
        correct_answer: "D",
        explanation:
          "A complete sentence must have a subject and a verb and express a complete thought. Options A, B, and C are all fragments because they begin with subordinating conjunctions or phrases that make them dependent clauses, lacking independent clauses to complete their meaning. Only option D has both a subject ('The museum') and a verb ('closed') and expresses a complete thought.",
        hint: "A complete sentence needs a subject, a verb, and must express a complete thought.",
      },
    ],
    completed: false,
    category: "English",
    questionCount: 5,
    isPublic: false,
    creator: "Mr. Aquah",
    institution: "Good Shepherd R/C JHS",
  },
]
