"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Share, Copy, Twitter, MessageCircle, ChartNoAxesColumnIcon } from "lucide-react";
import { CheckCircle } from "lucide-react";

interface Exam {
  id: string;
  exam_source: "school" | "waec" | "user";
  subject: string;
  exam_type: string;
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
}

interface ExamCardProps {
  exam: Exam;
  examScores?: Record<string, { score: number; totalMarks: number }>;
  isDesktop: boolean;
  onShare: (examId: string, platform: "copy" | "twitter" | "whatsapp", event: React.MouseEvent) => void;
  onViewCountClick?: (examId: string) => void;
  showMoreTopics: Record<string, boolean>;
  setShowMoreTopics: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedTopics?: string[];
  className?: string;
  separator?: boolean;
}

const formatExamDetails = (exam: Exam) => {
  const institution =
    exam.exam_source === "school"
      ? exam.school_exam_metadata?.school || "Unknown School"
      : exam.exam_source === "waec"
      ? exam.waec_exam_metadata?.region || "WAEC"
      : exam.user_exam_metadata?.creator_name || "User Created";
  const examType =
    exam.exam_source === "school"
      ? exam.exam_type
      : exam.exam_source === "waec"
      ? exam.exam_type
      : exam.exam_type || "Custom";
  const examDate =
    exam.exam_source === "school"
      ? exam.school_exam_metadata?.date
      : exam.exam_source === "waec"
      ? `${exam.waec_exam_metadata?.exam_year} ${exam.waec_exam_metadata?.exam_session}`
      : exam.user_exam_metadata?.date || "";
  return { institution, examType, examDate };
};

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
export const ExamCard = ({
  exam,
  examScores,
  isDesktop,
  onShare,
  onViewCountClick,
  showMoreTopics,
  setShowMoreTopics,
  selectedTopics,
  className,
  separator,
}: ExamCardProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isViewCountOpen, setIsViewCountOpen] = useState(false);
  const { examType, examDate } = formatExamDetails(exam);
  const isCompleted = !!examScores?.[exam.id];
  const timeAgo = formatTimeAgo(exam.created_at.toISOString());

  return (
    <div className={cn("md:px-0 group", className)}>
      <Link
        href={`/exam/${exam.id}`}
        className={cn(
          "block w-full px-4 pt-4 transition-colors dark:bg-gray-950 dark:border-gray-800 hover:bg-[#f7f7f7] dark:hover:border-gray-700",
          isCompleted && "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
        )}
      >
        <div className="flex items-start">
          <div
            className={cn(
              "flex flex-shrink-0 items-center justify-center",
              isCompleted ? "h-6 w-6 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full" : ""
            )}
          >
            {isCompleted ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <p className="text-sm font-medium text-center text-gray-500">
                {timeAgo.endsWith("h") || timeAgo.endsWith("d") ? `${timeAgo} ago` : timeAgo}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="ml-3 flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-left text-gray-600">
                {exam.subject} {examType} {examDate && `(${examDate})`} Trial
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>{exam.question_count} Questions</span>
              </div>
              {exam.topics.length > 0 && (
                <div className="flex flex-wrap gap-x-2">
                  {exam.topics
                    .slice(0, showMoreTopics[exam.id] ? exam.topics.length : 3)
                    .map((topic) => (
                      <span
                        key={topic}
                        className={cn(
                          "py-1 text-xs underline underline-offset-4",
                          selectedTopics?.includes(topic)
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "text-gray-500"
                        )}
                      >
                        {topic}
                      </span>
                    ))}
                  {exam.topics.length > 3 && !showMoreTopics[exam.id] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowMoreTopics((prev) => ({ ...prev, [exam.id]: true }));
                      }}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      +{exam.topics.length - 3} more
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-1 w-full">
              {isDesktop ? (
                <DropdownMenu
                  open={isShareOpen}
                  onOpenChange={(open) => setIsShareOpen(open)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex justify-center focus:outline-none rounded-full hover:bg-blue-50 w-9"
                      role="button"
                      aria-label="Share exam link"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsShareOpen(!isShareOpen);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsShareOpen(!isShareOpen);
                        }
                      }}
                    >
                      <Share className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-48 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuLabel>Share This Test</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <button
                      onClick={(e) => onShare(exam.id, "copy", e)}
                      className="flex items-center w-full p-3 text-left text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </button>
                    <button
                      onClick={(e) => onShare(exam.id, "twitter", e)}
                      className="flex items-center w-full p-3 text-left text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Share on Twitter/X
                    </button>
                    <button
                      onClick={(e) => onShare(exam.id, "whatsapp", e)}
                      className="flex items-center w-full p-3 text-left text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Share on WhatsApp
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex justify-center focus:outline-none rounded-full hover:bg-blue-50 w-9"
                  role="button"
                  aria-label="Share exam link"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsShareOpen(!isShareOpen);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsShareOpen(!isShareOpen);
                    }
                  }}
                >
                  <Share className="h-4 w-4 text-gray-500" />
                </Button>
              )}
              <Drawer
                open={isShareOpen && !isDesktop}
                onOpenChange={(open) => setIsShareOpen(open)}
              >
                <DrawerContent className="h-auto rounded-t-3xl">
                  <DrawerHeader>
                    <DrawerTitle>Share This Test</DrawerTitle>
                  </DrawerHeader>
                  <div className="py-4 space-y-2 px-4">
                    <button
                      onClick={(e) => onShare(exam.id, "copy", e)}
                      className="flex items-center w-full p-3 text-left text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </button>
                    <button
                      onClick={(e) => onShare(exam.id, "twitter", e)}
                      className="flex items-center w-full p-3 text-left text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Share on Twitter/X
                    </button>
                    <button
                      onClick={(e) => onShare(exam.id, "whatsapp", e)}
                      className="flex items-center w-full p-3 text-left text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Share on WhatsApp
                    </button>
                  </div>
                </DrawerContent>
              </Drawer>

              {isDesktop ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu
                    open={isViewCountOpen}
                    onOpenChange={(open) => setIsViewCountOpen(open)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex justify-center focus:outline-none rounded-full hover:bg-blue-50 w-9"
                        role="button"
                        aria-label="View exam clicks"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsViewCountOpen(!isViewCountOpen);
                          onViewCountClick?.(exam.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsViewCountOpen(!isViewCountOpen);
                            onViewCountClick?.(exam.id);
                          }
                        }}
                      >
                        <ChartNoAxesColumnIcon className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-48 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuLabel>Test View Count</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2 text-center">
                        <p className="text-sm text-gray-500">Coming soon</p>
                        <p className="text-xs text-gray-400">
                          The number of times this test has been completed will be displayed here
                        </p>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {examScores?.[exam.id] && (
                    <span className="text-xs text-green-500 font-medium">
                      Score: {examScores[exam.id].score}/{examScores[exam.id].totalMarks}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex justify-center focus:outline-none rounded-full hover:bg-blue-50 w-9"
                    role="button"
                    aria-label="View exam clicks"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsViewCountOpen(!isViewCountOpen);
                      onViewCountClick?.(exam.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsViewCountOpen(!isViewCountOpen);
                        onViewCountClick?.(exam.id);
                      }
                    }}
                  >
                    <ChartNoAxesColumnIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                  {examScores?.[exam.id] && (
                    <span className="text-xs text-green-500 font-medium">
                      Score: {examScores[exam.id].score}/{examScores[exam.id].totalMarks}
                    </span>
                  )}
                </div>
              )}
              <Drawer
                open={isViewCountOpen && !isDesktop}
                onOpenChange={(open) => setIsViewCountOpen(open)}
              >
                <DrawerContent className="h-auto rounded-t-3xl">
                  <DrawerHeader>
                    <DrawerTitle>Test View Count</DrawerTitle>
                  </DrawerHeader>
                  <div className="py-4 space-y-2 px-4 text-center mb-12">
                    <h3 className="text-lg">Coming soon</h3>
                    <p className="text-base text-gray-500">
                      The number of times this test has been clicked will be displayed here
                    </p>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </Link>
      {separator && <div className="opacity-1 transition-opacity duration-300 h-[1px] bg-black/5" />}
    </div>
  );
};