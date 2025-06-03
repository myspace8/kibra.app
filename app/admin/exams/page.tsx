"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, Edit, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

// Define interfaces for type safety
interface Exam {
  id: number;
  exam_type: string;
  exam_year: number;
  exam_session: string;
  region: string;
  subject: string;
  syllabus_version: string;
  sort_date: string;
}

interface Question {
  id: number;
  question: string;
  question_type: string;
  topic?: string;
  subtopic?: string;
  options?: string[];
  correct_answers?: string[];
  explanation?: string;
  hint?: string;
  difficulty?: string;
  marks?: number;
  media_url?: string;
  media_type?: string;
  keywords?: string[];
  learning_objectives?: string[];
  estimated_time?: string;
  source_reference?: string;
  ai_feedback?: string;
}

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Fetch all exams
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("*")
          .order("sort_date", { ascending: false });

        if (error) throw error;
        setExams(data || []);
      } catch (err) {
        setError("Failed to load exams: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Fetch questions when an exam is selected
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedExam) {
        setQuestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("exam_questions")
          .select("question_id")
          .eq("exam_id", selectedExam.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const questionIds: number[] = data.map((q) => q.question_id);
          const { data: questionsData, error: questionsError } = await supabase
            .from("question_pool")
            .select("*")
            .in("id", questionIds);

          if (questionsError) throw questionsError;
          setQuestions(questionsData || []);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        setError("Failed to load questions: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedExam]);

  // Handle exam updates
  const handleUpdateExam = async () => {
    if (!editingExam) return;

    try {
      const { error } = await supabase
        .from("exams")
        .update({
          exam_type: editingExam.exam_type,
          exam_year: editingExam.exam_year,
          exam_session: editingExam.exam_session,
          region: editingExam.region,
          subject: editingExam.subject,
          syllabus_version: editingExam.syllabus_version,
        })
        .eq("id", editingExam.id);

      if (error) throw error;

      setExams((prev) =>
        prev.map((exam) => (exam.id === editingExam.id ? { ...exam, ...editingExam } : exam))
      );
      setIsEditExamModalOpen(false);
      setEditingExam(null);
    } catch (err) {
      setError("Failed to update exam: " + (err as Error).message);
    }
  };

  // Handle question updates
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const { error } = await supabase
        .from("question_pool")
        .update({
          question: editingQuestion.question,
          question_type: editingQuestion.question_type,
          options: editingQuestion.options,
          correct_answers: editingQuestion.correct_answers,
          explanation: editingQuestion.explanation,
          hint: editingQuestion.hint,
          difficulty: editingQuestion.difficulty,
          marks: editingQuestion.marks,
          media_url: editingQuestion.media_url,
          media_type: editingQuestion.media_type,
          keywords: editingQuestion.keywords,
          learning_objectives: editingQuestion.learning_objectives,
          estimated_time: editingQuestion.estimated_time,
          source_reference: editingQuestion.source_reference,
          ai_feedback: editingQuestion.ai_feedback,
        })
        .eq("id", editingQuestion.id);

      if (error) throw error;

      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? { ...q, ...editingQuestion } : q))
      );
      setIsEditQuestionModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      setError("Failed to update question: " + (err as Error).message);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      {/* Exams Table */}
      <h1 className="text-2xl font-bold mb-4">Admin Exam Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Exam Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Syllabus</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.id}</TableCell>
              <TableCell>{exam.exam_type}</TableCell>
              <TableCell>{exam.exam_year}</TableCell>
              <TableCell>{exam.exam_session}</TableCell>
              <TableCell>{exam.region}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell>{exam.syllabus_version}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedExam(exam);
                      setIsQuestionsModalOpen(true);
                    }}
                  >
                    View Questions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingExam(exam);
                      setIsEditExamModalOpen(true);
                    }}
                  >
                    <Edit size={16} className="mr-1" /> Edit Exam
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Questions Modal */}
      <Dialog open={isQuestionsModalOpen} onOpenChange={setIsQuestionsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Questions for {selectedExam?.exam_type} {selectedExam?.exam_year}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm max-h-[60vh] max-w-screen-md text-wrap">
              {JSON.stringify(questions, null, 2)}
            </pre>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  questions.forEach((question) => {
                    console.log("Question ID:", question.id);
                  });
                  setIsEditQuestionModalOpen(true);
                }}
              >
                Edit Questions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Modal */}
      <Dialog open={isEditExamModalOpen} onOpenChange={setIsEditExamModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exam Details</DialogTitle>
          </DialogHeader>
          {editingExam && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="exam_type">Exam Type</Label>
                <Input
                  id="exam_type"
                  value={editingExam.exam_type}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, exam_type: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="exam_year">Exam Year</Label>
                <Input
                  id="exam_year"
                  type="number"
                  value={editingExam.exam_year}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, exam_year: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="exam_session">Exam Session</Label>
                <Input
                  id="exam_session"
                  value={editingExam.exam_session}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, exam_session: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={editingExam.region}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, region: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={editingExam.subject}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, subject: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="syllabus_version">Syllabus Version</Label>
                <Input
                  id="syllabus_version"
                  value={editingExam.syllabus_version}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, syllabus_version: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditExamModalOpen(false);
                    setEditingExam(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateExam}>
                  <CheckCircle size={16} className="mr-2" /> Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Question Modal */}
      <Dialog open={isEditQuestionModalOpen} onOpenChange={setIsEditQuestionModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {questions.map((question) => (
              <Card key={question.id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Question ID: {question.id}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingQuestion(question)}
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                </div>
                <p>{question.question}</p>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditQuestionModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Individual Question Modal */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Question ID: {editingQuestion?.id}</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4 max-h-[60vh] overflow-auto">
              <div>
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="question_type">Question Type</Label>
                <Input
                  id="question_type"
                  value={editingQuestion.question_type}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_type: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="options">Options (comma-separated)</Label>
                <Input
                  id="options"
                  value={editingQuestion.options?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      options: e.target.value.split(",").map((opt) => opt.trim()),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="correct_answers">Correct Answers (comma-separated)</Label>
                <Input
                  id="correct_answers"
                  value={editingQuestion.correct_answers?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      correct_answers: e.target.value.split(",").map((ans) => ans.trim()),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={editingQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="hint">Hint</Label>
                <Textarea
                  id="hint"
                  value={editingQuestion.hint || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, hint: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Input
                  id="difficulty"
                  value={editingQuestion.difficulty || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  value={editingQuestion.marks || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateQuestion}>
                  <CheckCircle size={16} className="mr-2" /> Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}