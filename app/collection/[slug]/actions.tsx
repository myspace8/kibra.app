"use server"

import { supabase } from "@/lib/supabase"

// Define the Collection type
type Collection = {
  id: string
  name: string
  description: string
  cover_image_url: string
  slug: string
  category: string
  books?: Array<{
    id: string
    title: string
    author: string
    description: string
    summary: string
    cover_image_url: string
    downloads: number
    pdf_url: string
  }>
}

// Fetch a single collection by slug (unchanged)
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select(`
        id,
        name,
        description,
        cover_image_url,
        slug,
        category
      `)
      .eq("slug", slug)
      .single()

    if (collectionError || !collection) {
      console.error(`Error fetching collection ${slug}:`, collectionError)
      return null
    }

    const { data: booksData, error: booksError } = await supabase
      .from("collection_books")
      .select(`
        book_id,
        books (
          id,
          title,
          author,
          description,
          summary,
          cover_image_url,
          downloads,
          pdf_url
        )
      `)
      .eq("collection_id", collection.id)
      .order("book_id", { ascending: true })

    if (booksError) {
      console.error(`Error fetching books for collection ${slug}:`, booksError)
      return { ...collection, books: [] }
    }

    const books = booksData.map((item) => item.books).flat()
    return { ...collection, books }
  } catch (error) {
    console.error(`Unexpected error fetching collection ${slug}:`, error)
    return null
  }
}

// New function to fetch all collection slugs
export async function getAllCollectionSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("slug")

    if (error || !data) {
      console.error("Error fetching all collection slugs:", error)
      return []
    }

    return data.map((item) => item.slug)
  } catch (error) {
    console.error("Unexpected error fetching all collection slugs:", error)
    return []
  }
}