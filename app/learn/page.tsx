"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  Loader2,
  RefreshCw,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useExams } from "@/hooks/useExam";

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
  const [showMoreTopics, setShowMoreTopics] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedExamType, setSelectedExamType] = useState<"BECE" | "WASSCE" | "EXPLORER">(
    "BECE",
  );
  const [selectedSubject, setSelectedSubject] = useState<string>("For you");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isExamTypeOpen, setIsExamTypeOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<
    Record<string, boolean>
  >({});
  const [isShareOpen, setIsShareOpen] = useState<string | null>(null);
  const [examScores, setExamScores] = useState<Record<string, { score: number; totalMarks: number }>>({});
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { exams, isLoading, isError } = useExams(session?.user?.id);

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
    let filtered = (exams ?? []).filter((exam) =>
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

  const handleExamTypeChange = (examType: "BECE" | "WASSCE" | "EXPLORER") => {
    setSelectedExamType(examType);
    setSelectedTopics([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedExamType", examType);
      localStorage.setItem("selectedTopics", JSON.stringify([]));
    }
    setIsExamTypeOpen(false);
  };

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
          {/* Show loading spinner while fetching */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Show error message if there's an error */}
          {isError && !isLoading && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                {isError?.message || "An error occurred while fetching exams."}
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

          {/* Show content when not loading and no error */}
          {!isLoading && !isError && (
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
                         ""
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