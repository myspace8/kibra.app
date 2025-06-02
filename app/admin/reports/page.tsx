"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("question_reports").select("*").order("reported_at", { ascending: false });

        if (filterStatus !== "All") {
          query = query.eq("status", filterStatus);
        }

        const { data, error } = await query;

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        setError("Failed to load reports: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filterStatus]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from("question_reports")
        .update({
          status: selectedReport.status,
          admin_notes: selectedReport.admin_notes,
        })
        .eq("id", selectedReport.id);

      if (error) throw error;
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, status: selectedReport.status, admin_notes: selectedReport.admin_notes } : r))
      );
      setSelectedReport(null);
    } catch (err) {
      setError("Failed to update report: " + (err as Error).message);
    }
  };

  if (isLoading) return <div className="p-4">Loading reports...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Report Management</h1>

      {/* Filter */}
      <div className="mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Reviewed">Reviewed</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Question ID</TableHead>
            <TableHead>Exam ID</TableHead>
            <TableHead>Issue Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reported At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.id}</TableCell>
              <TableCell>{report.question_id}</TableCell>
              <TableCell>{report.exam_id}</TableCell>
              <TableCell>{report.issue_type}</TableCell>
              <TableCell>{report.description}</TableCell>
              <TableCell>{new Date(report.reported_at).toLocaleString()}</TableCell>
              <TableCell>{report.status}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  className="mr-2"
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Report #{selectedReport.id}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select
                  value={selectedReport.status}
                  onValueChange={(value) =>
                    setSelectedReport({ ...selectedReport, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin Notes
                </label>
                <Textarea
                  value={selectedReport.admin_notes || ""}
                  onChange={(e) =>
                    setSelectedReport({ ...selectedReport, admin_notes: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Add notes or resolution details"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CheckCircle size={16} className="mr-2" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}