"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Helper function to generate a slug from a string
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Add a new collection
export async function addCollection(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string // Add category
    const cover_image = formData.get("cover_image") as File
    const slug = generateSlug(name)

    let cover_image_url = null
    if (cover_image?.size > 0) {
      const coverFileName = `${uuidv4()}-${cover_image.name}`
      const coverBuffer = await cover_image.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from("collection-covers")
        .upload(coverFileName, coverBuffer, {
          contentType: cover_image.type,
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Error uploading cover image:", uploadError)
        return { success: false, error: "Failed to upload cover image" }
      }

      const { data: coverUrl } = supabase.storage.from("collection-covers").getPublicUrl(coverFileName)
      cover_image_url = coverUrl.publicUrl
    }

    const { data, error } = await supabase
      .from("collections")
      .insert([{ name, description, category, cover_image_url, slug }]) // Include category
      .select()

    if (error) {
      console.error("Error adding collection:", error)
      return { success: false, error: "Failed to save collection" }
    }

    revalidatePath("/admin/collections")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error adding collection:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Fetch all collections with book count
export async function getCollections() {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select(`
        id,
        name,
        description,
        cover_image_url,
        slug,
        category,
        created_at,
        collection_books (count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching collections:", error)
      return { success: false, error: error.message }
    }

    const collections = data.map((collection) => ({
      ...collection,
      book_count: collection.collection_books[0]?.count || 0, // Access count from the first array element
    }))

    return { success: true, data: collections }
  } catch (error) {
    console.error("Unexpected error fetching collections:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Fetch books in a specific collection
export async function getCollectionBooks(collectionId: string) {
  try {
    const { data, error } = await supabase
      .from("collection_books")
      .select("book_id, books (id, title, cover_image_url)")
      .eq("collection_id", collectionId)

    if (error) {
      console.error("Error fetching collection books:", error)
      return { success: false, error: error.message }
    }

    const books = data.map((item) => item.books)
    return { success: true, data: books }
  } catch (error) {
    console.error("Unexpected error fetching collection books:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Fetch all books (for assignment dropdown)
export async function getAllBooks() {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, cover_image_url")
      .order("title", { ascending: true })

    if (error) {
      console.error("Error fetching books:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error fetching books:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update an existing collection
export async function updateCollection(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string // Add category
    const cover_image = formData.get("cover_image") as File
    const slug = generateSlug(name)

    let cover_image_url = formData.get("existing_cover_image_url") as string | null
    if (cover_image?.size > 0) {
      const coverFileName = `${uuidv4()}-${cover_image.name}`
      const coverBuffer = await cover_image.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from("collection-covers")
        .upload(coverFileName, coverBuffer, {
          contentType: cover_image.type,
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Error uploading cover image:", uploadError)
        return { success: false, error: "Failed to upload cover image" }
      }

      const { data: coverUrl } = supabase.storage.from("collection-covers").getPublicUrl(coverFileName)
      cover_image_url = coverUrl.publicUrl
    }

    const { data, error } = await supabase
      .from("collections")
      .update({ name, description, category, cover_image_url, slug }) // Include category
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating collection:", error)
      return { success: false, error: "Failed to update collection" }
    }

    revalidatePath("/admin/collections")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating collection:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete a collection
export async function deleteCollection(id: string) {
  try {
    const { error } = await supabase.from("collections").delete().eq("id", id)

    if (error) {
      console.error("Error deleting collection:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/collections")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting collection:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Add books to a collection
export async function addBooksToCollection(collectionId: string, bookIds: string[]) {
  try {
    const dataToInsert = bookIds.map((bookId) => ({
      collection_id: collectionId,
      book_id: bookId,
    }))

    const { error } = await supabase.from("collection_books").insert(dataToInsert).select()

    if (error) {
      console.error("Error adding books to collection:", error)
      return { success: false, error: "Failed to add books" }
    }

    revalidatePath("/admin/collections")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error adding books to collection:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Remove books from a collection
export async function removeBooksFromCollection(collectionId: string, bookIds: string[]) {
  try {
    const { error } = await supabase
      .from("collection_books")
      .delete()
      .eq("collection_id", collectionId)
      .in("book_id", bookIds)

    if (error) {
      console.error("Error removing books from collection:", error)
      return { success: false, error: "Failed to remove books" }
    }

    revalidatePath("/admin/collections")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error removing books from collection:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}