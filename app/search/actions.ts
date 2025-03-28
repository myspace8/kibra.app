"use server"

import { supabase } from "@/lib/supabase"

export async function searchBooks(query: string) {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, description, summary, cover_image_url, downloads, pdf_url")
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`) // Case-insensitive search on title or author
      .order("downloads", { ascending: false }) // Sort by popularity
      .limit(20) // Limit results for performance

    if (error) {
      console.error("Error searching books:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Unexpected error searching books:", error)
    return []
  }
}