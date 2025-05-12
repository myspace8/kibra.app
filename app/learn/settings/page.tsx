"use client"

import { CustomizationSettings } from "@/components/learn/customization-settings"
import { LearnPageHeader } from "@/components/learn/learn-page-header"
import { QuizSource, quizSources } from "@/data/quiz-sources"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const handleSelectQuizSource = (sourceId: number) => {
    const source = quizSources.find((s) => s.id === sourceId)
    if (source) {
      setCurrentQuizSource(source)
    }
  }
  return (
    <div className="bg-gray-100 h-screen">
      <LearnPageHeader showActions={false} />
      <div className="container max-w-4xl py-6 px-2">
        <CustomizationSettings
          open={true}
          onOpenChange={() => router.push("/learn")}
          onComplete={(data) => {
            router.push("/learn")
          }}
        />
      </div>
    </div>
  )
} 

function setCurrentQuizSource(source: QuizSource) {
    throw new Error("Function not implemented.")
}
