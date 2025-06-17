"use client";

import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { ExamCard } from "@/components/ui/ExamCard";
import { useExams } from "@/hooks/useExam";
import { Exam } from "@/types/exam";
import { useDebounce } from "@/hooks/use-debounce";

interface MenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuizSource?: (examId: string) => void;
}

type SortBy = "name" | "difficulty" | "date";
type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";
type ExamTypeFilter = "All" | "BECE" | "WASSCE";

interface FilterState {
  searchQuery: string;
  sortBy: SortBy;
  difficulty: DifficultyFilter;
  examType: ExamTypeFilter;
}

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: "",
  sortBy: "date",
  difficulty: "All",
  examType: "All",
};

export function ExamMenu({ open, onOpenChange, onSelectQuizSource }: MenuProps) {
  const { data: session } = useSession();
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [showMoreTopics, setShowMoreTopics] = useState<Record<string, boolean>>({});
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const debouncedSearchQuery = useDebounce(filterState.searchQuery, 300);

  const { exams, isLoading: examsLoading, isError: examsError } = useExams(session?.user?.id);

  const handleFilterChange = useCallback(
    (partialState: Partial<FilterState>) => {
      setFilterState((prev) => ({ ...prev, ...partialState }));
    },
    []
  );

  const filterAndSortExams = useCallback(
    (exams: Exam[]): Exam[] => {
      return (
        exams
          .filter((exam) => exam.exam_source === "waec")
          .map((exam) => ({
            ...exam,
            exam_type: exam.exam_type === "BECE" ? "BECE" : "WASSCE",
          }))
          .filter((exam) => {
            if (filterState.examType !== "All" && exam.exam_type !== filterState.examType) {
              return false;
            }
            if (
              filterState.difficulty !== "All" &&
              exam.difficulty !== filterState.difficulty
            ) {
              return false;
            }
            if (!debouncedSearchQuery.trim()) return true;

            const query = debouncedSearchQuery.toLowerCase();
            const subject = exam.subject?.toLowerCase() || "";
            const institution =
              exam.waec_exam_metadata?.region.toLowerCase() ||
              exam.user_exam_metadata?.creator_name.toLowerCase() ||
              "";
            const examiner = exam.user_exam_metadata?.creator_name.toLowerCase() || "";
            return (
              subject.includes(query) ||
              institution.includes(query) ||
              examiner.includes(query) ||
              exam.topics?.some((tag) => tag.toLowerCase().includes(query))
            );
          })
          .sort((a, b) => {
            switch (filterState.sortBy) {
              case "name":
                return (a.subject || "").localeCompare(b.subject || "");
              case "difficulty":
                const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
                return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
              default:
                return (
                  new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime()
                );
            }
          })
      );
    },
    [debouncedSearchQuery, filterState.sortBy, filterState.difficulty, filterState.examType]
  );

  const filteredExams = useMemo(
    () => filterAndSortExams(exams || []),
    [exams, filterAndSortExams]
  );

  const handleCopyLink = useCallback(
    (
      examId: string,
      platform: "copy" | "twitter" | "whatsapp",
      event: React.MouseEvent
    ) => {
      event.stopPropagation();
      if (platform === "copy") {
        const shareUrl = `${window.location.origin}/exam/${examId}`;
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => toast.success("Link copied to clipboard!"))
          .catch((err) =>
            toast.error(`Failed to copy link: ${err.message}`)
          );
      }
    },
    []
  );

  const renderExamList = (exams: Exam[]) => (
    <div className="pb-8">
      {exams.map((exam, index) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          isDesktop={isDesktop}
          onShare={handleCopyLink}
          showMoreTopics={showMoreTopics}
          setShowMoreTopics={setShowMoreTopics}
          separator={index < exams.length - 1}
          className="w-full items-start justify-between gap-3 md:py-4 md:px-0 text-left transition-colors group"
          // onClick={() => onSelectQuizSource?.(exam.id)}
        />
      ))}
    </div>
  );

  const renderContent = () => (
    <div className="py-4">
      <div className="relative mb-4 border-b">
        <Input
          placeholder="Search subject or topic..."
          value={filterState.searchQuery}
          onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
          className="pl-3 border-0 rounded-none focus:ring-0 focus:border-b-0 focus:border-none dark:bg-gray-950 dark:text-white"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {examsLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {examsError && !examsLoading && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            {examsError.message || "An error occurred"}
          </p>
        </div>
      )}

      {!examsLoading && !examsError && (
        <ScrollArea className={isDesktop ? "h-[45vh]" : "h-[55vh]"}>
          {filteredExams.length > 0 ? (
            renderExamList(filteredExams)
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No WASSCE/BECE exams found. Try different search terms.
              </p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );

  const commonProps = {
    open,
    onOpenChange,
    children: (
      <>
        <div className="p-4">
          <h2 className="text-xl font-semibold">Select a test</h2>
        </div>
        {renderContent()}
      </>
    ),
  };

  return isDesktop ? (
    <Dialog {...commonProps}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Select a test</DialogTitle>
        {renderContent()}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer {...commonProps}>
      <DrawerContent className="h-auto rounded-t-3xl">
        <DrawerHeader>
          <DrawerTitle className="sr-only">Select a test</DrawerTitle>
        </DrawerHeader>
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
}