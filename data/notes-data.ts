export interface Note {
  id: number
  title: string
  content: string
  quizTitle?: string
  createdAt: string
  isAIGenerated: boolean
}

export const sampleNotes: Note[] = [
  {
    id: 1,
    title: "Algebra Fundamentals Review",
    content: `# Algebra Fundamentals Review

## Key Concepts to Review:
- Linear equations and their solutions
- Understanding the distributive property
- Solving for variables in complex expressions

## Strengths:
- Strong understanding of basic equation solving
- Good grasp of the distributive property

## Areas for Improvement:
- Practice more complex equations with multiple variables
- Review the concept of slope in linear equations
- Work on word problems that require setting up equations

## Recommended Resources:
- Khan Academy: Linear Equations
- Practice problems from textbook chapter 3
- Schedule a review session with a tutor for complex problems`,
    quizTitle: "Mathematics: Algebra Basics",
    createdAt: "2023-11-15T14:30:00Z",
    isAIGenerated: true,
  },
  {
    id: 2,
    title: "Grammar Rules to Remember",
    content: `# Grammar Rules to Remember

## Punctuation:
- Commas are used to separate items in a list, set off non-restrictive clauses, and separate independent clauses joined by a conjunction.
- Semicolons connect related independent clauses.

## Common Errors to Avoid:
- Subject-verb agreement issues
- Misplaced modifiers
- Pronoun reference errors

## Practice Exercises:
1. Identify and correct errors in sample sentences
2. Write paragraphs focusing on proper punctuation
3. Review examples of correctly structured complex sentences

## Next Steps:
- Read more complex texts to observe grammar in context
- Practice writing daily to reinforce proper grammar usage
- Review specific rules for comma usage`,
    quizTitle: "English: Grammar Fundamentals",
    createdAt: "2023-12-02T09:15:00Z",
    isAIGenerated: false,
  },
]
