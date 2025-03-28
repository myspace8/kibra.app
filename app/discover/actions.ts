"use server"

import { supabase } from "@/lib/supabase"

async function getBooksByCollectionSlug(slug: string): Promise<{ slug: string, books: any[] }> {
  try {
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id, slug")
      .eq("slug", slug)
      .single()

    if (collectionError || !collection) {
      console.error(`Error fetching collection ${slug}:`, collectionError)
      return { slug, books: [] }
    }

    const { data, error } = await supabase
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

    if (error) {
      console.error(`Error fetching books for collection ${slug}:`, error)
      return { slug: collection.slug, books: [] }
    }

    const books = data.map((item) => item.books)
    return { slug: collection.slug, books }
  } catch (error) {
    console.error(`Unexpected error fetching books for ${slug}:`, error)
    return { slug, books: [] }
  }
}

async function getTrendingBooks(limit: number = 3) {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, description, summary, cover_image_url, downloads, pdf_url") // Add pdf_url
      .order("downloads", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching trending books:", error)
      return { slug: "trending", books: [] }
    }

    return { slug: "trending", books: data }
  } catch (error) {
    console.error("Unexpected error fetching trending books:", error)
    return { slug: "trending", books: [] }
  }
}

export { getBooksByCollectionSlug, getTrendingBooks }