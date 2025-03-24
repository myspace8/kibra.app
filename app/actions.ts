"use server"

import { supabase } from "@/lib/supabase"

export async function downloadBook(bookId: string) {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("pdf_url")
      .eq("id", bookId)
      .single()

    if (error || !data || !data.pdf_url) {
      console.error(`Error fetching PDF URL for book ${bookId}:`, error)
      return { success: false, error: "Book PDF not found" }
    }

    return { success: true, fileUrl: data.pdf_url }
  } catch (error) {
    console.error(`Unexpected error downloading book ${bookId}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}