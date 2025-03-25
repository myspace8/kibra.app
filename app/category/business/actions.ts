"use server"

import { supabase } from "@/lib/supabase"

export async function getPopularBusinessBooks() {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, description, cover_image_url, downloads, pdf_url")
      .eq("category", "Business")
      .order("downloads", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error fetching business books:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error fetching business books:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getBusinessCollections() {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("id, name, description, cover_image_url, slug, category")
      .eq("category", "Business")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching business collections:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error fetching business collections:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
} 