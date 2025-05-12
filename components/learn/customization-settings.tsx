"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

interface CustomizationData {
  favoriteSubject: string
  hobbies: string[]
  knowledgeLevel: string
  educationalLevel: string
  age: string
}

interface CustomizationSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: CustomizationData) => void
}

const steps = [
  {
    id: "educationalLevel",
    title: "What is your current educational level?",
    description: "Choose the level of school you are currently in.",
    type: "list",
    options: [
      "Junior High School",
      "Senior High School",
      "Tertiary (University/College/Technical Institute)",
      "Not currently in school",
    ],
    icon: "🎓",
  },
  {
    id: "age",
    title: "How old are you?",
    description: "Tell us your age so we can make learning just right for you.",
    type: "list",
    options: [
      "10 or younger",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18 or older",
    ],
    icon: "🎈",
  },
  {
    id: "favoriteSubject",
    title: "What's your favorite subject?",
    description: "Pick the one you like learning about the most!",
    type: "list",
    options: [
      "English Language",
      "Mathematics",
      "Science",
      "Social Studies",
      "Culture",
      "ICT",
      "French",
      "Basic Design and Technology",
      "Religious and Moral Education",
      "Physical Education",
      "Creative Arts",
    ],
    icon: "📚",
  },
  {
    id: "knowledgeLevel",
    title: "How good are you at your favorite subject?",
    description: "Be honest - it's okay to be a beginner!",
    type: "list",
    options: ["Beginner (I'm just starting)", "Intermediate (I know some things)", "Advanced (I'm really good at it)"],
    icon: "🧠",
  },
  {
    id: "hobbies",
    title: "What do you like to do for fun?",
    description: "Choose your favorite activities!",
    type: "list",
    options: [
      "Football",
      "Music",
      "Dancing",
      "Gaming",
      "Reading",
      "Cooking",
      "Drawing",
      "Watching Movies",
      "Farming",
      "Other",
    ],
    icon: "🎮",
  },
]

export function CustomizationSettings({ open, onOpenChange, onComplete }: CustomizationSettingsProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<CustomizationData>({
    favoriteSubject: "",
    hobbies: [],
    knowledgeLevel: "",
    educationalLevel: "",
    age: "",
  })

  useEffect(() => {
    // Load existing customizations when the component mounts
    const customizations = localStorage.getItem("userCustomizations")
    if (customizations) {
      setFormData(JSON.parse(customizations))
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      localStorage.setItem("userCustomizations", JSON.stringify(formData))
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleOptionClick = (value: string) => {
    if (steps[currentStep].id === "hobbies") {
      setFormData({
        ...formData,
        hobbies: formData.hobbies.includes(value)
          ? formData.hobbies.filter(h => h !== value)
          : [...formData.hobbies, value],
      })
    } else {
      setFormData({
        ...formData,
        [steps[currentStep].id]: value,
      })
    }
  }

  const isStepComplete = () => {
    const currentField = steps[currentStep].id
    if (currentField === "hobbies") {
      return formData.hobbies.length > 0
    }
    return formData[currentField as keyof CustomizationData] !== ""
  }

  return (
    <div className="bg-card rounded-lg shadow-lg">
      <div className="p-6 md:p-8">
        <div className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="bg-primary/10 text-primary p-2 rounded-full">{steps[currentStep].icon}</span>
          <span>Customize Your Experience</span>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="text-sm font-medium">{Math.round(((currentStep + 1) / steps.length) * 100)}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div key={currentStep} className="space-y-4 transition-all duration-300">
          <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>

          <div className="flex flex-wrap gap-2">
            {steps[currentStep].options?.map((option) => {
              const isSelected = steps[currentStep].id === "hobbies"
                ? formData.hobbies.includes(option)
                : formData[steps[currentStep].id as keyof CustomizationData] === option

              return (
                <div key={option} className={`transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]`}>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleOptionClick(option)}
                    className={`h-auto py-2 px-4 ${isSelected ? "border-primary ring-1 ring-primary" : ""}`}
                  >
                    <span>{option}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 ml-2 text-primary-foreground" />}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!isStepComplete()} className="flex items-center gap-1">
            {currentStep === steps.length - 1 ? "Save Changes" : "Next"}
            {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
} 