"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"
import { CheckCircle, Clock, Globe, Loader2, RefreshCw, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LearnPageHeader } from "@/components/learn/learn-page-header"

// Interfaces
interface Exam {
  id: string
  exam_source: "school" | "waec" | "user"
  subject: string
  exam_type: "BECE" | "WASSCE"
  question_count: number
  total_marks: number
  sort_date: string
  difficulty: "Easy" | "Medium" | "Hard"
  topics: string[]
  school_exam_metadata?: {
    school: string
    grade_level: string
    date: string
    examiner: string
    school_location?: { region: string; city?: string; country?: string }
  }
  waec_exam_metadata?: {
    exam_year: number
    exam_session: "May/June" | "November/December"
    region: string
    syllabus_version: string
  }
  user_exam_metadata?: {
    creator_id: string
    creator_name: string
    date?: string
    description?: string
  }
  completed: boolean
}

// Hardcoded subjects for BECE and WASSCE
const BECE_SUBJECTS = ["Mathematics", "Integrated Science", "English Language", "Computing", "Social Studies"]
const WASSCE_SUBJECTS = ["Mathematics", "English Language", "Computing", "Science", "Financial Accounting"]

// Hardcoded topics
const ALL_TOPICS = [
  "Programming", "Computer Fundamentals", "Digital Citizenship", "Energy", "Atmosphere",
  "Photosynthesis", "Algebra", "Geometry", "Statistics", "Trigonometry", "Grammar",
  "Comprehension", "Essay Writing", "Literature", "Physics", "Chemistry", "Biology",
  "Environmental Science", "Calculus", "Data Structures", "Algorithms", "Database Systems",
  "Web Development", "Software Engineering", "Advanced Grammar", "Literary Analysis",
  "Creative Writing", "Critical Thinking", "Advanced Physics", "Organic Chemistry",
  "Molecular Biology", "Research Methods"
]

export default function Learn() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [showMoretopics, setShowMoretopics] = useState<Record<string, boolean>>({})
  const [selectedExamType, setSelectedExamType] = useState<"BECE" | "WASSCE">(() => {
    return (localStorage.getItem("selectedExamType") as "BECE" | "WASSCE") || "BECE"
  })
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const storedSubject = localStorage.getItem("selectedSubject")
    const subjects = selectedExamType === "BECE" ? BECE_SUBJECTS : WASSCE_SUBJECTS
    return storedSubject && (subjects.includes(storedSubject) || storedSubject === "For you") ? storedSubject : "For you"
  })
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => {
    const storedTopics = localStorage.getItem("selectedTopics")
    return storedTopics ? JSON.parse(storedTopics) : []
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const getFilteredExams = () => {
    let filtered = exams.filter((exam) => exam.exam_type === selectedExamType)

    if (selectedSubject === "For you") {
      if (selectedTopics.length > 0) {
        filtered = filtered.filter((exam) => exam.topics.some((topic) => selectedTopics.includes(topic)))
      } else {
        filtered = filtered.slice(0, 5) // Show all exams limited to 5 if no topics
      }
    } else {
      filtered = filtered.filter((exam) => exam.subject === selectedSubject)
    }

    return filtered
  }

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) => {
      const newTopics = prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
      localStorage.setItem("selectedTopics", JSON.stringify(newTopics))
      return newTopics
    })
  }

  const clearSelectedTopics = () => {
    setSelectedTopics([])
    localStorage.setItem("selectedTopics", JSON.stringify([]))
  }

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_source,
            exam_type,
            subject,
            question_count,
            total_marks,
            sort_date,
            difficulty,
            topics,
            school_exam_metadata,
            waec_exam_metadata,
            user_exam_metadata,
            user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
          `)
          .order("sort_date", { ascending: false })

        if (examsError) throw new Error("Failed to fetch exams: " + examsError.message)

        const formattedExams: Exam[] = examsData?.map((exam: any) => ({
          id: exam.id,
          exam_source: exam.exam_source,
          exam_type: exam.exam_type,
          subject: exam.subject,
          question_count: exam.question_count || 0,
          total_marks: exam.total_marks || 0,
          sort_date: exam.sort_date,
          difficulty: exam.difficulty || "Medium",
          topics: exam.topics || [],
          school_exam_metadata: exam.school_exam_metadata || undefined,
          waec_exam_metadata: exam.waec_exam_metadata || undefined,
          user_exam_metadata: exam.user_exam_metadata || undefined,
          completed: !!exam.user_exam_progress?.completed_at,
        })) || []

        setExams(formattedExams)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching exams.")
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [session?.user?.id])

  useEffect(() => {
    localStorage.setItem("selectedExamType", selectedExamType)
    localStorage.setItem("selectedSubject", selectedSubject)
  }, [selectedExamType, selectedSubject])

  useEffect(() => {
    const subjects = selectedExamType === "BECE" ? BECE_SUBJECTS : WASSCE_SUBJECTS
    if (!subjects.includes(selectedSubject) && selectedSubject !== "For you") {
      setSelectedSubject("For you")
    }
  }, [selectedExamType])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening"
  const userName = session?.user?.name?.split(" ")[0] || "User"

  const subjectsToDisplay = selectedExamType === "BECE" ? BECE_SUBJECTS : WASSCE_SUBJECTS

  return (
    <>
      <LearnPageHeader />
      <main className="min-h-[calc(100vh-4rem)] overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-6 px-3">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                <RefreshCw size={16} />
                Reload
              </Link>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex flex-col md:items-center justify-center py-6 md:p-6 md:text-center">
                {session ? (
                  <h2 className="text-2xl font-semibold leading-tight">
                    {greeting}, {userName}.
                  </h2>
                ) : (
                  <h2 className="text-2xl font-semibold">Welcome to Kibra.</h2>
                )}
                <p className="text-sm leading-tight text-gray-600 dark:text-gray-400 mb-6">
                  Quickly test your skills on WAEC-Based topics
                </p>
              </div>
              <div className="w-full space-y-6">
                {/* BECE/WASSCE Toggle with Filter Button */}
                <div className="flex items-center justify-between">
                  <Tabs
                    value={selectedExamType}
                    onValueChange={(value) => setSelectedExamType(value as "BECE" | "WASSCE")}
                  >
                    <TabsList className="grid w-fit grid-cols-2 rounded-full">
                      <TabsTrigger className="rounded-3xl" value="BECE">BECE</TabsTrigger>
                      <TabsTrigger className="rounded-3xl" value="WASSCE">WASSCE</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="relative">
                        <Filter className="h-4 w-4 mr-2" />
                        Topics
                        {selectedTopics.length > 0 && (
                          <Badge variant="secondary" className="flex justify-center items-center ml-2 h-5 w-5 p-0 text-xs">
                            <span>
                              {selectedTopics.length}
                            </span>
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Filter by Topics</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Select topics you want to focus on</p>
                          {selectedTopics.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearSelectedTopics}
                              className="h-auto p-1 text-xs"
                            >
                              Clear all
                            </Button>
                          )}
                        </div>

                        {selectedTopics.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Selected topics:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedTopics.map((topic) => (
                                <Badge
                                  key={topic}
                                  variant="secondary"
                                  className="text-xs cursor-pointer"
                                  onClick={() => handleTopicToggle(topic)}
                                >
                                  {topic}
                                  <X className="h-3 w-3 ml-1" />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                          {ALL_TOPICS.map((topic) => (
                            <div key={topic} className="flex items-center space-x-2">
                              <Checkbox
                                id={topic}
                                checked={selectedTopics.includes(topic)}
                                onCheckedChange={() => handleTopicToggle(topic)}
                              />
                              <label
                                htmlFor={topic}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {topic}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Subject Categories */}
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-2 min-w-max">
                    <button
                      onClick={() => setSelectedSubject("For you")}
                      className={cn(
                        "px-0 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                        selectedSubject === "For you"
                          ? "text-gray-900 border-b-2 border-gray-900 dark:text-gray-100 dark:border-gray-100"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                      )}
                    >
                      For you
                      {selectedTopics.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                          {selectedTopics.length}
                        </Badge>
                      )}
                    </button>
                    {subjectsToDisplay.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={cn(
                          "px-0 mr-2 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                          selectedSubject === subject
                            ? "text-gray-900 border-b-2 border-gray-900 dark:text-gray-100 dark:border-gray-100"
                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                        )}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Cards */}
                {(() => {
                  const filteredExams = getFilteredExams()
                  return filteredExams.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">
                        {selectedSubject === "For you" && selectedTopics.length > 0
                          ? `No ${selectedExamType} exams found for your selected topics.`
                          : selectedSubject === "For you"
                            ? `No ${selectedExamType} exams available. Try selecting some topics to personalize your experience.`
                            : `No ${selectedExamType} exams available for ${selectedSubject}.`}
                      </p>
                      {selectedSubject === "For you" && selectedTopics.length === 0 && (
                        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} className="mt-2">
                          <Filter className="h-4 w-4 mr-2" />
                          Select Topics
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredExams.map((exam) => {
                        const institution =
                          exam.exam_source === "school"
                            ? exam.school_exam_metadata?.school || "Unknown School"
                            : exam.exam_source === "waec"
                              ? exam.waec_exam_metadata?.region || "WAEC"
                              : exam.user_exam_metadata?.creator_name || "User Created"
                        const examType =
                          exam.exam_source === "school"
                            ? exam.exam_type
                            : exam.exam_source === "waec"
                              ? exam.exam_type
                              : exam.exam_type || "Custom"
                        const examDate =
                          exam.exam_source === "school"
                            ? exam.school_exam_metadata?.date
                            : exam.exam_source === "waec"
                              ? `${exam.waec_exam_metadata?.exam_year} ${exam.waec_exam_metadata?.exam_session}`
                              : exam.user_exam_metadata?.date || ""

                        return (
                          <Link
                            href={`/exam/${exam.id}`}
                            key={exam.id}
                            className={cn(
                              "block w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors dark:bg-gray-950 dark:border-gray-800 dark:hover:border-gray-700",
                              exam.completed &&
                              "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                                  exam.completed
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                                )}
                              >
                                {exam.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  {exam.subject} {examType} {examDate && `(${examDate}) Trial`}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    <span>{institution}</span>
                                  </div>
                                  <span>{exam.question_count} Questions</span>
                                </div>
                                {exam.topics.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {exam.topics
                                      .slice(0, showMoretopics[exam.id] ? exam.topics.length : 3)
                                      .map((topic) => (
                                        <span
                                          key={topic}
                                          className={cn(
                                            "px-2 py-1 text-xs font-medium rounded-md",
                                            selectedTopics.includes(topic)
                                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                          )}
                                        >
                                          {topic}
                                        </span>
                                      ))}
                                    {exam.topics.length > 3 && !showMoretopics[exam.id] && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          e.preventDefault()
                                          setShowMoretopics((prev) => ({
                                            ...prev,
                                            [exam.id]: true,
                                          }))
                                        }}
                                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                      >
                                        +{exam.topics.length - 3} more
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )
                })()}
                {/* Ad Placeholder */}
                <div className="mt-6 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Advertisement Placeholder</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">300x250px Ad Space</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      {/* Footer */}
      <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 Kibra. All rights reserved. | Today is Thursday, May 29, 2025, 04:47 PM GMT</p>
          <div className="mt-2 space-x-4">
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </>
  )
}