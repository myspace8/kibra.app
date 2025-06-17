"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "react-hot-toast";
import { ExamCard } from "@/components/ui/ExamCard";
import { useExams } from "@/hooks/useExam";
import { Exam } from "@/types/exam";
import { useDebounce } from "@/hooks/use-debounce";

interface MenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

export function ExamMenu({ open, onOpenChange }: MenuProps) {
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [showMoreTopics, setShowMoreTopics] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const debouncedSearchQuery = useDebounce(filterState.searchQuery, 300);

  const { exams, isLoading: examsLoading, isError: examsError, hasMore, totalCount } = useExams(
    page,
    itemsPerPage,
    debouncedSearchQuery,
    filterState.examType,
    filterState.difficulty
  );

  useEffect(() => {
    if (exams) {
      setAllExams((prev) => {
        const newExams = exams.filter(
          (exam) => !prev.some((existing) => existing.id === exam.id)
        );
        return [...prev, ...newExams];
      });
    }
  }, [exams]);

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / itemsPerPage) : 1;

  const handleFilterChange = useCallback((partialState: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partialState }));
    setAllExams([]);
    setPage(1);
  }, []);

  const sortedExams = useMemo(() => {
    return [...allExams].sort((a, b) => {
      switch (filterState.sortBy) {
        case "name":
          return (a.subject || "").localeCompare(b.subject || "");
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime();
      }
    });
  }, [allExams, filterState.sortBy]);

  const paginatedExams = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedExams.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedExams, page, itemsPerPage]);

  const handleCopyLink = useCallback(
    (examId: string, platform: "copy" | "twitter" | "whatsapp", event: React.MouseEvent) => {
      event.stopPropagation();
      if (platform === "copy") {
        const shareUrl = `${window.location.origin}/exam/${examId}`;
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => toast.success("Link copied to clipboard!"))
          .catch((err) => toast.error(`Failed to copy link: ${err.message}`));
      }
    },
    []
  );

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPages]);

  const renderPagination = () => {
    if (totalCount <= itemsPerPage) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between py-4 px-4 border-t">
        <div className="md:flex items-center gap-2 hidden">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * itemsPerPage + 1} to{" "}
            {Math.min(page * itemsPerPage, totalCount)} of {totalCount} exams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="hidden md:block"
          >
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setPage(1);
                setAllExams([]);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || examsLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={examsLoading}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || examsLoading}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
        />
      ))}
    </div>
  );

  const renderContent = () => (
    <div className="py-4">
      <div className="relative mb-4 border-b">
        <Input
          placeholder="Search by subject or topic..."
          value={filterState.searchQuery}
          onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
          className="pl-10 pr-3 py-2 border-0 rounded-none focus:ring-0 focus:border-b-0 focus:border-none dark:bg-gray-950 dark:text-white"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {(examsLoading && allExams.length === 0) && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {examsError && !examsLoading && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            {examsError.message || "An error occurred while fetching exams"}
          </p>
        </div>
      )}

      {!examsLoading && !examsError && (
        <div className={isDesktop ? "max-h-[45vh] overflow-auto" : "max-h-[45vh] overflow-auto"}>
          {paginatedExams.length > 0 ? (
            renderExamList(paginatedExams)
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No exams found. Try different subject or topic search terms.
              </p>
            </div>
          )}
          {renderPagination()}
        </div>
      )}
    </div>
  );

  return isDesktop ? (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="dialog-content" className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Select an exam</DialogTitle>
        <div className="p-4">
          <h2 className="text-xl font-semibold">Select an exam</h2>
        </div>
        {renderContent()}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent id="drawer-content" className="h-auto rounded-t-3xl">
        <DrawerHeader>
          <DrawerTitle className="sr-only">Select an exam</DrawerTitle>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Select an exam</h2>
          </div>
        </DrawerHeader>
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
}