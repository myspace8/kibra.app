"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Loader2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast";
import { ExamCard } from "@/components/ui/ExamCard";
// Interfaces
interface Subject {
  id: number
  name: string
}

interface Exam {
  id: string
  exam_source: "school" | "waec" | "user"
  subject_id: number
  exam_type: "BECE" | "WASSCE"
  question_count: number
  total_marks: number
  created_at: Date;
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

interface MenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectQuizSource?: (examId: string) => void
}

export function Menuu({ open, onOpenChange }: MenuProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "difficulty" | "date">("date")
  const [filterDifficulty, setFilterDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All")
  const [filterExamType, setFilterExamType] = useState<string>("All")
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [showMoreTopics, setshowMoreTopics] = useState<Record<string, boolean>>({})

  // SUPABASE FETCH
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
            created_at,
            sort_date,
            difficulty,
            topics,
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
          exam_type: exam.exam_type,
          question_count: exam.question_count,
          total_marks: exam.total_marks,
          created_at: new Date(exam.created_at),
          sort_date: exam.sort_date,
          difficulty: exam.difficulty,
          topics: exam.topics,
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

  // SUPABASE FETCH
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
                created_at: newExam.created_at,
                exam_type: newExam.exam_type,
                question_count: newExam.question_count,
                total_marks: newExam.total_marks,
                sort_date: newExam.sort_date,
                difficulty: newExam.difficulty,
                topics: newExam.topics,
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

  // DEV MODE MOCK DATA
  // useEffect(() => {
  //   const fetchExams = async () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       // Mock data
  //       const mockExams: Exam[] = [
  //         {
  //           id: "1",
  //           exam_source: "school",
  //           exam_type: "BECE",
  //           subject: "Mathematics",
  //           question_count: 40,
  //           total_marks: 100,
  //           sort_date: "2025-05-01",
  //           difficulty: "Medium",
  //           topics: ["Arithmetic (Fractions, Percentages, Ratios)", "Algebra (Equations, Expressions)"],
  //           school_exam_metadata: {
  //             school: "Accra Academy",
  //             grade_level: "JHS 3",
  //             date: "2025-04-15",
  //             examiner: "Mr. Kofi Mensah",
  //             school_location: { region: "Greater Accra", city: "Accra", country: "Ghana" },
  //           },
  //           completed: false,
  //         },
  //         {
  //           id: "2",
  //           exam_source: "waec",
  //           exam_type: "WASSCE",
  //           subject: "English Language",
  //           question_count: 60,
  //           total_marks: 150,
  //           sort_date: "2025-06-10",
  //           difficulty: "Hard",
  //           topics: ["Advanced Grammar and Usage", "Essay Writing (Argumentative, Expository)"],
  //           waec_exam_metadata: {
  //             exam_year: 2025,
  //             exam_session: "May/June",
  //             region: "West Africa",
  //             syllabus_version: "2025",
  //           },
  //           completed: true,
  //         },
  //         {
  //           id: "3",
  //           exam_source: "user",
  //           exam_type: "EXPLORER",
  //           subject: "Integrated Science",
  //           question_count: 25,
  //           total_marks: 50,
  //           sort_date: "2025-03-20",
  //           difficulty: "Easy",
  //           topics: ["Physical Science (Energy, Forces)", "Scientific Investigation"],
  //           user_exam_metadata: {
  //             creator_id: "user123",
  //             creator_name: "Jane Doe",
  //             date: "2025-03-18",
  //             description: "Practice test for science enthusiasts",
  //           },
  //           completed: false,
  //         },
  //         {
  //           id: "4",
  //           exam_source: "school",
  //           exam_type: "BECE",
  //           subject: "Social Studies",
  //           question_count: 50,
  //           total_marks: 120,
  //           sort_date: "2025-04-25",
  //           difficulty: "Medium",
  //           topics: ["Governance and Citizenship", "Geography (Physical and Human)"],
  //           school_exam_metadata: {
  //             school: "Wesley Girls High School",
  //             grade_level: "JHS 3",
  //             date: "2025-04-20",
  //             examiner: "Mrs. Ama Boateng",
  //             school_location: { region: "Central Region", city: "Cape Coast", country: "Ghana" },
  //           },
  //           completed: true,
  //         },
  //         {
  //           id: "5",
  //           exam_source: "waec",
  //           exam_type: "WASSCE",
  //           subject: "Financial Accounting",
  //           question_count: 45,
  //           total_marks: 100,
  //           sort_date: "2025-06-15",
  //           difficulty: "Hard",
  //           topics: ["Financial Statements and Analysis", "Bookkeeping and Ledger Accounts"],
  //           waec_exam_metadata: {
  //             exam_year: 2025,
  //             exam_session: "November/December",
  //             region: "West Africa",
  //             syllabus_version: "2025",
  //           },
  //           completed: false,
  //         },
  //       ];

  //       setExams(mockExams);
  //     } catch (err) {
  //       setError(
  //         err instanceof Error
  //           ? err.message
  //           : "An error occurred while fetching exams.",
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchExams();
  // }, [session?.user?.id]);

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
            exam.topics.some((tag) => tag.toLowerCase().includes(query))
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
            ? exam.exam_type === filterExamType
            : exam.exam_source === "waec"
              ? exam.exam_type === filterExamType
              : exam.exam_type === filterExamType
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

  const filteredWaecExams = useMemo(
    () => filterAndSortExams(exams.filter((exam) => exam.exam_source === "waec")),
    [exams, filterAndSortExams]
  )


  const handleCopyLink = (
    examId: string,
    platform: "copy" | "twitter" | "whatsapp",
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (platform === "copy") {
      const shareUrl = `${window.location.origin}/exam/${examId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Link Copied! Share this link with your friends!");
      }).catch((err) => {
        toast.error("Failed to copy link: " + err.message);
      });
    }
  };

  const renderExamList = (exams: Exam[]) => {
    return (
      <div className="pb-8" style={{ scrollbarWidth: "thin" }}>
        {exams.map((exam, index) => {
          const subject = subjects.find((s) => s.id === exam.subject_id)?.name || "Unknown Subject";
          return (
            <ExamCard
              key={exam.id}
              exam={{ ...exam, subject }} // Merge subject into exam object
              isDesktop={isDesktop}
              onShare={handleCopyLink}
              showMoreTopics={showMoreTopics}
              setShowMoreTopics={setshowMoreTopics}
              separator={index < exams.length - 1}
              className="w-full items-start justify-between gap-3 md:py-4 md:px-0 text-left transition-colors group"
            />
          );
        })}
      </div>
    );
  };

  const content = (
    <div className="py-4">
      {/* Search Bar */}
      <div className="relative mb- border-b">
        <Input
          placeholder="Search subject or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-3 border-0 rounded-none focus:ring-0 focus:border-b-0 focus:border-none dark:bg-gray-950 dark:text-white"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <ScrollArea className={isDesktop ? "h-[45vh]" : "h-[55vh]"}>
        {filteredWaecExams.length > 0 ? (
          renderExamList(filteredWaecExams)
        ) : (
          <div className="py-8 text-center">
            <p className="flex flex-col text-sm text-muted-foreground">
              No WASCCE {"/"} BECE found
              <span>Check spelling or search different topic</span>
            </p>
          </div>
        )}
      </ScrollArea>

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
          <DialogTitle className="text-xl font-semibold p-4">Select a test</DialogTitle>
          <div className="flex-1 overflow-hidden">{content}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-auto rounded-t-3xl">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">Select a test</DrawerTitle>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  )
}