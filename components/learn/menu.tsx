"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, CheckCircle, Clock, ArrowRight, Building2, Globe, User, Loader2, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"

// Interfaces
interface Subject {
  id: number
  name: string
}

interface Exam {
  id: string
  exam_source: "school" | "waec" | "user"
  subject_id: number
  question_count: number
  total_marks: number
  sort_date: string
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  school_exam_metadata?: {
    school: string
    grade_level: string
    date: string
    exam_type: string
    examiner: string
    school_location?: { region: string; city?: string; country?: string }
  }
  waec_exam_metadata?: {
    exam_type: "BECE" | "WASSCE"
    exam_year: number
    exam_session: "May/June" | "November/December"
    region: string
    syllabus_version: string
  }
  user_exam_metadata?: {
    creator_id: string
    creator_name: string
    date?: string
    exam_type?: string
    description?: string
  }
  completed: boolean
}

interface UserSettings {
  educationalLevel: "JHS" | "SHS" | "Other"
  favoriteSubject: string
}

interface MenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectQuizSource?: (examId: string) => void
}

// Utility to get user settings from local storage
const getUserSettings = (): UserSettings => {
  if (typeof window === "undefined") {
    return { educationalLevel: "JHS", favoriteSubject: "Mathematics" }
  }
  const settings = localStorage.getItem("userSettings")
  return settings
    ? JSON.parse(settings)
    : { educationalLevel: "JHS", favoriteSubject: "Mathematics" }
}

export function Menuu({ open, onOpenChange, onSelectQuizSource }: MenuProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"waec" | "school" | "recommended" | "user">("waec")
  const [sortBy, setSortBy] = useState<"name" | "difficulty" | "date">("date")
  const [filterDifficulty, setFilterDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All")
  const [filterExamType, setFilterExamType] = useState<string>("All")
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [showMoreTags, setShowMoreTags] = useState<Record<string, boolean>>({})

  // Fetch user settings
  const userSettings = getUserSettings()

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, name")
          .order("name")

        if (subjectsError) throw new Error("Failed to fetch subjects: " + subjectsError.message)
        setSubjects(subjectsData)

        // Fetch exams with completion status
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select(`
            id,
            exam_source,
            subject_id,
            question_count,
            total_marks,
            sort_date,
            difficulty,
            tags,
            school_exam_metadata,
            waec_exam_metadata,
            user_exam_metadata,
            user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
          `)
          .eq("status", "Published")
          .order("sort_date", { ascending: false })

        if (examsError) throw new Error("Failed to fetch exams: " + examsError.message)

        const formattedExams: Exam[] = examsData.map((exam: any) => ({
          id: exam.id,
          exam_source: exam.exam_source,
          subject_id: exam.subject_id,
          question_count: exam.question_count,
          total_marks: exam.total_marks,
          sort_date: exam.sort_date,
          difficulty: exam.difficulty,
          tags: exam.tags,
          school_exam_metadata: exam.school_exam_metadata,
          waec_exam_metadata: exam.waec_exam_metadata,
          user_exam_metadata: exam.user_exam_metadata,
          completed: !!exam.user_exam_progress?.completed_at
        }))

        setExams(formattedExams)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching exams.")
      } finally {
        setLoading(false)
      }
    }

    if (open) fetchData()
  }, [open, session?.user?.id])

  // Real-time subscription for exams
  useEffect(() => {
    if (!open) return

    const channel = supabase
      .channel("exams_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exams", filter: "status=eq.Published" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newExam = payload.new as any
            const { data: progress } = await supabase
              .from("user_exam_progress")
              .select("completed_at")
              .eq("exam_id", newExam.id)
              .eq("user_id", session?.user?.id)
              .maybeSingle()

            setExams((prev) => [
              {
                id: newExam.id,
                exam_source: newExam.exam_source,
                subject_id: newExam.subject_id,
                question_count: newExam.question_count,
                total_marks: newExam.total_marks,
                sort_date: newExam.sort_date,
                difficulty: newExam.difficulty,
                tags: newExam.tags,
                school_exam_metadata: newExam.school_exam_metadata,
                waec_exam_metadata: newExam.waec_exam_metadata,
                user_exam_metadata: newExam.user_exam_metadata,
                completed: !!progress?.completed_at
              },
              ...prev
            ])
          } else if (payload.eventType === "UPDATE") {
            setExams((prev) =>
              prev.map((exam) =>
                exam.id === payload.new.id
                  ? { ...exam, ...payload.new, completed: exam.completed }
                  : exam
              )
            )
          } else if (payload.eventType === "DELETE") {
            setExams((prev) => prev.filter((exam) => exam.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, session?.user?.id])

  // Memoized recommended exams
  const recommendedExams = useMemo(() => {
    return exams
      .filter((exam) => {
        const subjectName = subjects.find((s) => s.id === exam.subject_id)?.name
        const isSubjectMatch = subjectName === userSettings.favoriteSubject
        const isLevelMatch =
          (userSettings.educationalLevel === "JHS" &&
            (exam.waec_exam_metadata?.exam_type === "BECE" ||
              exam.school_exam_metadata?.grade_level === "JHS")) ||
          (userSettings.educationalLevel === "SHS" &&
            (exam.waec_exam_metadata?.exam_type === "WASSCE" ||
              exam.school_exam_metadata?.grade_level === "SHS"))
        return isSubjectMatch && isLevelMatch && !exam.completed
      })
      .sort((a, b) => new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime())
      .slice(0, 5)
  }, [exams, subjects, userSettings])

  // Filter and sort exams
  const filterAndSortExams = useCallback(
    (exams: Exam[]) => {
      let filtered = exams

      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((exam) => {
          const subject = subjects.find((s) => s.id === exam.subject_id)?.name.toLowerCase() || ""
          const institution =
            exam.exam_source === "school"
              ? exam.school_exam_metadata?.school.toLowerCase() || ""
              : exam.exam_source === "waec"
              ? exam.waec_exam_metadata?.region.toLowerCase() || ""
              : exam.user_exam_metadata?.creator_name.toLowerCase() || ""
          const examiner =
            exam.exam_source === "school"
              ? exam.school_exam_metadata?.examiner.toLowerCase() || ""
              : exam.user_exam_metadata?.creator_name.toLowerCase() || ""
          return (
            subject.includes(query) ||
            institution.includes(query) ||
            examiner.includes(query) ||
            exam.tags.some((tag) => tag.toLowerCase().includes(query))
          )
        })
      }

      // Apply difficulty filter
      if (filterDifficulty !== "All") {
        filtered = filtered.filter((exam) => exam.difficulty === filterDifficulty)
      }

      // Apply exam type filter
      if (filterExamType !== "All") {
        filtered = filtered.filter((exam) =>
          exam.exam_source === "school"
            ? exam.school_exam_metadata?.exam_type === filterExamType
            : exam.exam_source === "waec"
            ? exam.waec_exam_metadata?.exam_type === filterExamType
            : exam.user_exam_metadata?.exam_type === filterExamType
        )
      }

      // Sort
      return filtered.sort((a, b) => {
        if (sortBy === "name") {
          const subjectA = subjects.find((s) => s.id === a.subject_id)?.name || ""
          const subjectB = subjects.find((s) => s.id === b.subject_id)?.name || ""
          return subjectA.localeCompare(subjectB)
        } else if (sortBy === "difficulty") {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        } else {
          return new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime()
        }
      })
    },
    [searchQuery, sortBy, filterDifficulty, filterExamType, subjects]
  )

  // Filtered exams by source
  const filteredSchoolExams = useMemo(
    () => filterAndSortExams(exams.filter((exam) => exam.exam_source === "school")),
    [exams, filterAndSortExams]
  )
  const filteredWaecExams = useMemo(
    () => filterAndSortExams(exams.filter((exam) => exam.exam_source === "waec")),
    [exams, filterAndSortExams]
  )
  const filteredUserExams = useMemo(
    () => filterAndSortExams(exams.filter((exam) => exam.exam_source === "user")),
    [exams, filterAndSortExams]
  )

  // Unique exam types for filter
  const examTypes = useMemo(() => {
    const types = new Set<string>()
    exams.forEach((exam) => {
      if (exam.exam_source === "school" && exam.school_exam_metadata?.exam_type) {
        types.add(exam.school_exam_metadata.exam_type)
      } else if (exam.exam_source === "waec" && exam.waec_exam_metadata?.exam_type) {
        types.add(exam.waec_exam_metadata.exam_type)
      } else if (exam.exam_source === "user" && exam.user_exam_metadata?.exam_type) {
        types.add(exam.user_exam_metadata.exam_type)
      }
    })
    return ["All", ...Array.from(types).sort()]
  }, [exams])

  const handleExamClick = (examId: string) => {
    if (onSelectQuizSource) {
      onSelectQuizSource(examId)
    }
    onOpenChange(false)
  }

  const renderExamList = (exams: Exam[]) => {
    return (
      <div className="space-y-3 pb-8" style={{scrollbarWidth: "thin"}}>
        {exams.map((exam) => {
          const subject = subjects.find((s) => s.id === exam.subject_id)?.name || "Unknown Subject"
          const institution =
            exam.exam_source === "school"
              ? exam.school_exam_metadata?.school || "Unknown School"
              : exam.exam_source === "waec"
              ? exam.waec_exam_metadata?.region || "WAEC"
              : exam.user_exam_metadata?.creator_name || "User Created"
          const examiner =
            exam.exam_source === "school"
              ? exam.school_exam_metadata?.examiner || "Unknown"
              : exam.user_exam_metadata?.creator_name || "Unknown"
          const examType =
            exam.exam_source === "school"
              ? exam.school_exam_metadata?.exam_type
              : exam.exam_source === "waec"
              ? exam.waec_exam_metadata?.exam_type
              : exam.user_exam_metadata?.exam_type || "Custom"
          const examDate =
            exam.exam_source === "school"
              ? exam.school_exam_metadata?.date
              : exam.exam_source === "waec"
              ? `${exam.waec_exam_metadata?.exam_year} ${exam.waec_exam_metadata?.exam_session}`
              : exam.user_exam_metadata?.date || ""

          return (
            <button
              key={exam.id}
              className={cn(
                "flex w-full items-center justify-between border-b py-4 md:px-0 px-2 text-left transition-colors",
                exam.completed
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
              )}
              onClick={() => handleExamClick(exam.id)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                    exam.completed
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {exam.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    {subject} {examType} {examDate && `(${examDate})`}
                  </h3>
                  <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {exam.exam_source === "school" && <Building2 className="h-3 w-3" />}
                      {exam.exam_source === "waec" && <Globe className="h-3 w-3" />}
                      {exam.exam_source === "user" && <User className="h-3 w-3" />}
                      <span>{institution}</span>
                    </div>
                    {/* Omit examiner. Not good for waec exam data. Check later */}
                    {/* <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{examiner}</span>
                    </div> */}
                    <div className="flex items-center gap-1">
                      <span>{exam.question_count} questions </span> {(exam.exam_source !== "waec" && exam.exam_source !== "school") && <span>• {exam.difficulty}</span>}
                    </div>

                    </div>
                    {exam.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exam.tags.slice(0, showMoreTags[exam.id] ? 18 : 3).map((tag) => (
                              <span
                              key={tag}
                              className="px-1.5 py-0.5 text-xs w-max bg-gray-100 dark:bg-gray-800 rounded-full"
                              >
                              {tag}
                              </span>
                              ))}
                              {exam.tags.length > 3 && (
                              <span
                              onClick={(e) => {
                              e.stopPropagation();
                              setShowMoreTags((prev) => ({
                                ...prev,
                                [exam.id]: !prev[exam.id],
                              }));
                              }}
                              role="button"
                              tabIndex={0}
                              className="px-1.5 py-0.5 text-xs w-max bg-gray-200 dark:bg-gray-700 rounded-full text-primary cursor-pointer"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setShowMoreTags((prev) => ({
                                  ...prev,
                                  [exam.id]: !prev[exam.id],
                                }));
                                }
                              }}
                              >
                              {showMoreTags[exam.id] ? "Less" : `+${exam.tags.length - 3} more`}
                              </span>
                              )}
                            </div>
                            )}
                      {/* </div> */}
                    {/* )} */}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    )
  }

  const content = (
    <div className="py-4">
      {/* Search Bar */}
      <div className="relative mb-4 border-b">
        <Input
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-3 border-0 rounded-none focus:ring-0 focus:border-b-0 focus:border-none dark:bg-gray-950 dark:text-white"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "recommended" | "school" | "waec" | "user")}
        className="w-full"
      >
        <div className="px-2 md:px-0">
          <TabsList className="grid w-full grid-cols-2 rounded-full h-12">
            <TabsTrigger value="waec" className="flex items-center gap-1.5 rounded-full h-10">
              <Globe className="h-3.5 w-3.5" />
              <span className="text-xs">BECE {"/"} WASCCE</span>
            </TabsTrigger>
            <TabsTrigger value="school" className="flex items-center gap-1.5 rounded-full h-10">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-xs">School-Based</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {!loading && !error && (
          <>
            <TabsContent value="school" className="m-0">
              <div className="flex justify-between items-center my-2">
              </div>
              <ScrollArea className={isDesktop ? "h-[45vh]" : "h-[45vh]"}>
                {filteredSchoolExams.length > 0 ? (
                  renderExamList(filteredSchoolExams)
                ) : (
                  <div className="py-8 text-center">
                    <p className="flex flex-col text-sm text-muted-foreground">
                      No school-based exams found
                    <span>Please come back later</span>
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="waec" className="m-0">
              <div className="flex justify-between items-center my-2">
              </div>
              <ScrollArea className={isDesktop ? "h-[45vh]" : "h-[45vh]"}>
                {filteredWaecExams.length > 0 ? (
                  renderExamList(filteredWaecExams)
                ) : (
                  <div className="py-8 text-center">
                    <p className="flex flex-col text-sm text-muted-foreground">
                      No WASCCE {"/"} BECE found
                    {/* <span>Please come back later</span> */}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </>
        )}
      </Tabs>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogTitle className="text-xl font-semibold p-4">Select Exam</DialogTitle>
          <div className="flex-1 overflow-hidden">{content}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-auto rounded-t-3xl">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">Select Exam</DrawerTitle>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  )
}