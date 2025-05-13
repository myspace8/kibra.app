// app/admin/upload-waec/page.tsx
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"

export default function UploadWAECExam() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    exam_type: "BECE",
    exam_year: new Date().getFullYear(),
    exam_session: "May/June",
    region: "Ghana",
    subject: "",
    syllabus_version: "",
    questions: [],
    questionCount: 0,
    total_marks: 0,
    duration: "",
    file_url: "",
    instructions: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    const { error } = await supabase.from("waec_exams").insert({
      ...formData,
      uploaded_by: session.user?.email || "unknown",
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (!error) alert("Exam uploaded successfully!")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload WAEC Exam</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="exam_type">Exam Type</Label>
          <select
            id="exam_type"
            value={formData.exam_type}
            onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="BECE">BECE</option>
            <option value="WASSCE">WASSCE</option>
          </select>
        </div>
        {/* Add other form fields for each property */}
        <Button type="submit">Upload</Button>
      </form>
    </div>
  )
}