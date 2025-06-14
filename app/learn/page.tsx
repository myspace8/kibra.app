"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  RefreshCw,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { LearnPageHeader } from "@/components/learn/learn-page-header";
import { useMediaQuery } from "@/hooks/use-media-query";
import Banner from "@/components/annAdBanner";
import { ExamCard } from "@/components/ui/ExamCard";

// Interfaces
interface Exam {
  score: any;
  id: string;
  exam_source: "school" | "waec" | "user";
  subject: string;
  exam_type: string; // "BECE", "WASSCE", or "EXPLORER"
  question_count: number;
  total_marks: number;
  sort_date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  created_at: Date;
  school_exam_metadata?: {
    school: string;
    grade_level: string;
    date: string;
    examiner: string;
    school_location?: { region: string; city?: string; country?: string };
  };
  waec_exam_metadata?: {
    exam_year: number;
    exam_session: "May/June" | "November/December";
    region: string;
    syllabus_version: string;
  };
  user_exam_metadata?: {
    creator_id: string;
    creator_name: string;
    date?: string;
    description?: string;
  };
  completed: boolean;
  // score: number;
}

// Helper function to format time difference
const formatTimeAgo = (sortDate: string): string => {
  const now = new Date();
  const examDate = new Date(sortDate);
  const diffInMs = now.getTime() - examDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 1) {
    return `${diffInHours}h`;
  } else if (diffInDays < 6) {
    return `${diffInDays}d`;
  } else {
    return examDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }
};

const loadExamScores = (): Record<string, { score: number; totalMarks: number }> => {
  const key = `kibra_exam_scores`;
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : {};
  } catch (e) {
    console.error("Error parsing exam scores from localStorage:", e);
    return {};
  }
};

// WAEC-based subjects for BECE and WASSCE (2025, Ghana)
const BECE_SUBJECTS = [
  "Social Studies",
  "Information and Communication Technology",
  "English Language",
  "Integrated Science",
  "Mathematics",
];

const WASSCE_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Integrated Science",
  "Elective ICT",
  "Financial Accounting",
];

// WAEC-based topics by subject for BECE (aligned with 2025 syllabus)
const BECE_TOPICS_BY_SUBJECT: Record<string, string[]> = {
  "English Language": [
    "Grammar and Structure",
    "Reading Comprehension",
    "Essay and Letter Writing",
    "Literature (Prose, Drama, Poetry)",
  ],
  Mathematics: [
    "Arithmetic (Fractions, Percentages, Ratios)",
    "Algebra (Equations, Expressions)",
    "Geometry (Shapes, Measurements)",
    "Probability and Statistics",
  ],
  "Integrated Science": [
    "Physical Science (Energy, Forces)",
    "Life Science (Photosynthesis, Human Systems)",
    "Earth Science (Atmosphere, Resources)",
    "Scientific Investigation",
  ],
  "Social Studies": [
    "Governance and Citizenship",
    "Cultural Heritage",
    "Geography (Physical and Human)",
    "Economic Development",
  ],
  "Information and Communication Technology": [
    "Computer Fundamentals (Hardware, Software)",
    "Application Software (Word Processing, Spreadsheets)",
    "Networking and Internet",
    "Digital Citizenship (Ethics, Safety)",
    "Emerging Technologies (AI, Programming)",
  ],
};

// WAEC-based topics by subject for WASSCE (aligned with 2025 syllabus)
const WASSCE_TOPICS_BY_SUBJECT: Record<string, string[]> = {
  "English Language": [
    "Advanced Grammar and Usage",
    "Reading Comprehension and Summary",
    "Essay Writing (Argumentative, Expository)",
    "Literature (African and Non-African Prose, Drama, Poetry)",
  ],
  Mathematics: [
    "Algebra (Equations, Matrices)",
    "Geometry and Trigonometry",
    "Statistics and Probability",
    "Calculus (Differentiation, Integration)",
  ],
  "Integrated Science": [
    "Physics (Mechanics, Electricity)",
    "Chemistry (Organic, Inorganic)",
    "Biology (Ecology, Genetics)",
    "Scientific Methods and Applications",
  ],
  "Elective ICT": [
    "Computer Hardware and Software",
    "Networking and Data Communication",
    "Application Packages (Word, Excel, Databases)",
    "Web Technologies",
    "Basic Programming (Visual Basic, Python)",
  ],
  "Financial Accounting": [
    "Principles of Accounting",
    "Financial Statements and Analysis",
    "Bookkeeping and Ledger Accounts",
    "Cost and Management Accounting",
  ],
};

export default function Learn() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [showMoreTopics, setShowMoreTopics] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedExamType, setSelectedExamType] = useState<"BECE" | "WASSCE" | "EXPLORER">(
    "BECE",
  );
  const [selectedSubject, setSelectedSubject] = useState<string>("For you");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExamTypeOpen, setIsExamTypeOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<
    Record<string, boolean>
  >({});
  const [isShareOpen, setIsShareOpen] = useState<string | null>(null);
  const [isViewCountOpen, setIsViewCountOpen] = useState<string | null>(null);
  const [examScores, setExamScores] = useState<Record<string, { score: number; totalMarks: number }>>({});
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Initialize state from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedExamType = localStorage.getItem("selectedExamType");
      const storedSubject = localStorage.getItem("selectedSubject");
      let storedTopics: string[] = [];

      try {
        const stored = localStorage.getItem("selectedTopics");
        if (stored) {
          storedTopics = JSON.parse(stored);
          if (!Array.isArray(storedTopics)) {
            storedTopics = [];
          }
        }
      } catch (e) {
        console.error("Error parsing selectedTopics from localStorage:", e);
        storedTopics = [];
      }

      setSelectedExamType(
        storedExamType === "BECE" || storedExamType === "WASSCE" || storedExamType === "EXPLORER"
          ? storedExamType
          : "BECE",
      );
      const subjects =
        storedExamType === "BECE" ? BECE_SUBJECTS : WASSCE_SUBJECTS;
      setSelectedSubject(
        storedSubject && (subjects.includes(storedSubject) || storedSubject === "For you")
          ? storedSubject
          : "For you",
      );
      setSelectedTopics(storedTopics);
    }
  }, []);

  const getTopicsBySubject = () => {
    return selectedExamType === "BECE"
      ? BECE_TOPICS_BY_SUBJECT
      : WASSCE_TOPICS_BY_SUBJECT;
  };

  const getFilteredExams = () => {
    let filtered = exams.filter((exam) =>
      selectedExamType === "EXPLORER" ? true : exam.exam_type === selectedExamType
    );

    if (selectedSubject === "For you") {
      if (selectedTopics.length > 0) {
        filtered = filtered.filter((exam) =>
          exam.topics.some((topic) => selectedTopics.includes(topic))
        );
      } else if (selectedExamType !== "EXPLORER") {
        filtered = filtered.slice(0, 5);
      }
    } else {
      filtered = filtered.filter((exam) => exam.subject === selectedSubject);
    }

    return filtered;
  };

  const handleShare = (examId: string, action: "copy" | "twitter" | "whatsapp", e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = `${window.location.origin}/exam/${examId}`;
    switch (action) {
      case "copy":
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast.success("Link copied to clipboard!");
          setIsShareOpen(null);
        }).catch(() => {
          toast.error("Failed to copy link.");
        });
        break;
      case "twitter":
        window.open(
          `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this ${selectedExamType} exam on Kibra!`,
          "_blank"
        );
        toast.success("Opening Twitter/X to share!");
        setIsShareOpen(null);
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=Check out this ${selectedExamType} exam on Kibra: ${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        toast.success("Opening WhatsApp to share!");
        setIsShareOpen(null);
        break;
    }
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) => {
      const newTopics = prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic];
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedTopics", JSON.stringify(newTopics));
      }
      return newTopics;
    });
  };

  const clearSelectedTopics = () => {
    setSelectedTopics([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTopics", JSON.stringify([]));
    }
  };

  const toggleSubjectExpansion = (subject: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }));
  };

  const selectAllTopicsForSubject = (subject: string, topics: string[]) => {
    setSelectedTopics((prev) => {
      const currentTopics = new Set(prev);
      const allSelected = topics.every((topic) => currentTopics.has(topic));
      let newTopics: string[];

      if (allSelected) {
        newTopics = prev.filter((topic) => !topics.includes(topic));
      } else {
        newTopics = [
          ...prev,
          ...topics.filter((topic) => !currentTopics.has(topic)),
        ];
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("selectedTopics", JSON.stringify(newTopics));
      }
      return newTopics;
    });
  };

  const handleExamTypeChange = (examType: "BECE" | "WASSCE" | "EXPLORER") => {
    setSelectedExamType(examType);
    setSelectedTopics([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedExamType", examType);
      localStorage.setItem("selectedTopics", JSON.stringify([]));
    }
    setIsExamTypeOpen(false);
  };

  // SUPABASE FETCH
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);

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
            created_at,
            difficulty,
            topics,
            school_exam_metadata,
            waec_exam_metadata,
            user_exam_metadata,
            user_exam_progress!user_exam_progress_exam_id_fkey(completed_at)
          `)
          .order("sort_date", { ascending: false });

        if (examsError)
          throw new Error("Failed to fetch exams: " + examsError.message);

        const formattedExams: Exam[] =
          examsData?.map((exam: any) => ({
            id: exam.id,
            exam_source: exam.exam_source,
            exam_type: exam.exam_type,
            subject: exam.subject,
            created_at: new Date(exam.created_at),
            question_count: exam.question_count || 0,
            total_marks: exam.total_marks || 0,
            sort_date: exam.sort_date,
            difficulty: exam.difficulty || "Medium",
            topics: exam.topics || [],
            school_exam_metadata: exam.school_exam_metadata || undefined,
            waec_exam_metadata: exam.waec_exam_metadata || undefined,
            user_exam_metadata: exam.user_exam_metadata || undefined,
            completed: !!exam.user_exam_progress?.completed_at,
            score: exam.user_exam_progress?.completed_at
          })) || [];

        setExams(formattedExams);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching exams.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [session?.user?.id]);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scores = loadExamScores();
      setExamScores(scores);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedExamType", selectedExamType);
      localStorage.setItem("selectedSubject", selectedSubject);
    }
  }, [selectedExamType, selectedSubject]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTopics", JSON.stringify(selectedTopics));
    }
  }, [selectedTopics]);

  useEffect(() => {
    const subjects = selectedExamType === "BECE" ? BECE_SUBJECTS : WASSCE_SUBJECTS;
    if (!subjects.includes(selectedSubject) && selectedSubject !== "For you") {
      setSelectedSubject("For you");
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedSubject", "For you");
      }
    }

    // Initialize expanded state for subjects
    const topicsBySubject = getTopicsBySubject();
    const initialExpandedState: Record<string, boolean> = {};
    Object.keys(topicsBySubject).forEach((subject) => {
      initialExpandedState[subject] = false;
    });
    setExpandedSubjects(initialExpandedState);

    // Validate selectedTopics against current exam type
    const validTopics = Object.values(topicsBySubject).flat();
    setSelectedTopics((prev) => {
      const filteredTopics = prev.filter((topic) => validTopics.includes(topic));
      if (filteredTopics.length !== prev.length && typeof window !== "undefined") {
        localStorage.setItem("selectedTopics", JSON.stringify(filteredTopics));
      }
      return filteredTopics;
    });
  }, [selectedExamType]);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";
  const userName = session?.user?.name?.split(" ")[0] || "User";

  const subjectsToDisplay =
    selectedExamType === "BECE" ? BECE_SUBJECTS : WASSCE_SUBJECTS;

  const examTypeContent = (
    <div className="py-4">
      <div className="space-y-2">
        {[
          { value: "BECE", label: "I am a BECE candidate" },
          { value: "WASSCE", label: "I am a WASSCE candidate" },
          { value: "EXPLORER", label: "Just an explorer" },
        ].map((examType) => (
          <button
            key={examType.value}
            onClick={() => handleExamTypeChange(examType.value as "BECE" | "WASSCE" | "EXPLORER")}
            className={cn(
              "w-full p-3 text-left text-sm font-medium transition-colors",
              selectedExamType === examType.value
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
            )}
          >
            {examType.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <LearnPageHeader />
      <main className="min-h-[calc(100vh-4rem)] overflow-auto bg-white dark:from-gray-900 dark:to-gray-950 pb-6 md:px-3">
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                {error}
              </p>
              <a
                href="/learn"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                <RefreshCw size={16} />
                Reload
              </a>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="w-full border border-y-0 border-x">
                {/* Subject Categories */}
                <div>
                  <div className="flex justify-center min-w-max border-b">
                    <button
                      onClick={() => setSelectedSubject("For you")}
                      className={cn(
                        "mx-4 py-3 text-base whitespace-nowrap transition-colors relative",
                        selectedSubject === "For you"
                          ? "text-gray-900 font-medium dark:text-gray-100"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                      )}
                    >
                      <span className="relative z-10">
                        For you
                        {selectedTopics.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-4 w-4 p-0 text-xs"
                          >
                            {selectedTopics.length}
                          </Badge>
                        )}
                      </span>
                      {selectedSubject === "For you" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-blue-500 dark:bg-blue-400 rounded-full z-0"></div>
                      )}
                    </button>
                    <div className="flex max-w-[70vw] overflow-x-auto scrollbar-hide">
                      {subjectsToDisplay.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject)}
                          className={cn(
                            "mx-2 py-2 text-base whitespace-nowrap transition-colors relative",
                            selectedSubject === subject
                              ? "text-gray-900 font-medium dark:text-gray-100"
                              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                          )}
                        >
                          <span className="relative z-10">
                            {subject === "Information and Communication Technology" ? "ICT" : subject}
                          </span>
                          {selectedSubject === subject && (
                            <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-blue-500 dark:bg-blue-400 rounded-full z-0"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-b py-1">
                  <Banner />
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-3 px-3 border-b">
                  You're {selectedExamType === "EXPLORER" ? "an explorer" : `a ${selectedExamType} candidate`}.{" "}
                  <Dialog open={isExamTypeOpen && isDesktop} onOpenChange={setIsExamTypeOpen}>
                    <DialogTrigger asChild>
                      <button className="inline-block text-blue-600">Change</button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Select Preference</DialogTitle>
                      </DialogHeader>
                      {examTypeContent}
                    </DialogContent>
                  </Dialog>
                  <Drawer open={isExamTypeOpen && !isDesktop} onOpenChange={setIsExamTypeOpen}>
                    <DrawerContent className="h-auto rounded-t-3xl">
                      <DrawerHeader>
                        <DrawerTitle>Select Preference</DrawerTitle>
                      </DrawerHeader>
                      {examTypeContent}
                    </DrawerContent>
                  </Drawer>
                </div>


                {/* Exam Cards */}
                {(() => {
                  const filteredExams = getFilteredExams();
                  return filteredExams.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">
                        {selectedSubject === "For you" && selectedTopics.length > 0
                          ? `No ${selectedExamType} exams found for your selected topics.`
                          : selectedSubject === "For you"
                            ? `No ${selectedExamType} exams available. Try selecting some topics to personalize your experience.`
                            : `No ${selectedExamType} exams available for ${selectedSubject}.`}
                      </p>
                      {selectedSubject === "For you" &&
                        selectedTopics.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFilterOpen(true)}
                            className="mt-2"
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Select Topics
                          </Button>
                        )}
                    </div>
                  ) : (
                    <div>
                      {filteredExams.map((exam, index) => (
                        <ExamCard
                          key={exam.id}
                          exam={exam}
                          examScores={examScores}
                          isDesktop={isDesktop}
                          onShare={handleShare}
                          showMoreTopics={showMoreTopics}
                          setShowMoreTopics={setShowMoreTopics}
                          selectedTopics={selectedTopics}
                          separator={index < filteredExams.length - 1}
                          className="md:px-0 group"
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </main>
      <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            © 2025 Kibra. All rights reserved. | 2025
          </p>
          <div className="mt-2 space-x-4">
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}