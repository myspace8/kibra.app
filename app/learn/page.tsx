"use client"

import { useState, useEffect } from "react"
import QuizApp from "@/components/learn/quiz-app"
import { LearnPageHeader } from "@/components/learn/learn-page-header"
import { quizData } from "@/data/quiz-data"
import { quizSources } from "@/data/quiz-sources"
import type { QuizSource } from "@/data/quiz-sources"
import { CustomizationFlow } from "@/components/learn/customization-flow"

export default function Home() {
  const [currentQuizSource, setCurrentQuizSource] = useState<QuizSource | null>(null)
  const [showCustomization, setShowCustomization] = useState(false)

  useEffect(() => {
    const hasCustomizations = localStorage.getItem("userCustomizations")
    if (!hasCustomizations) {
      setShowCustomization(true)
    }
  }, [])

  const handleSelectQuizSource = (sourceId: number) => {
    const source = quizSources.find((s) => s.id === sourceId)
    if (source) {
      setCurrentQuizSource(source)
    }
  }
  
  const handleCustomizationComplete = (data: any) => {
    localStorage.setItem("userCustomizations", JSON.stringify(data))
    setShowCustomization(false)
  }

  return (
    <>
      <LearnPageHeader onSelectQuizSource={handleSelectQuizSource} />
      <main className="min-h-[calc(100vh-4rem)] overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-6 px-3 ">
        <div className="max-w-4xl mx-auto">
          <QuizApp
            questions={currentQuizSource ? currentQuizSource.questions : quizData.questions}
            quizTitle={currentQuizSource?.name}
            onQuizComplete={() => {
              if (currentQuizSource) {
                // Mark the quiz as completed (in a real app, this would update the database)
                console.log(`Quiz completed: ${currentQuizSource.name}`)
              }
            }}
          />
        </div>
      </main>
      <CustomizationFlow 
        isOpen={showCustomization} 
        onComplete={handleCustomizationComplete}
      />
    </>
  )
}
