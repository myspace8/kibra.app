export interface Question {
  id: number
  dok_level?: number
  component: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  hint?: string // Optional hint field
}
