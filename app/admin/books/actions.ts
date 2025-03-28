"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function getBooks() {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, description, isbn, language, publication_year, cover_image_url, pdf_url, status, author, category, downloads")
      .order("id", { ascending: false })

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

export async function addBook(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const isbn = formData.get("isbn") as string
    const language = formData.get("language") as string
    const publication_year = formData.get("publication_year") ? parseInt(formData.get("publication_year") as string, 10) : null
    const author = formData.get("author") as string
    const category = formData.get("category") as string
    const cover_image = formData.get("cover_image") as File
    const pdf_file = formData.get("pdf_file") as File
    const summary = formData.get("summary") as string

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 60)

    const coverFileName = cover_image?.size > 0 ? `${uuidv4()}-${cover_image.name}` : null
    const pdfFileName = `${uuidv4()}-${pdf_file.name}`

    let cover_image_url = null
    if (coverFileName) {
      const coverBuffer = await cover_image.arrayBuffer()
      const { data: coverData, error: coverError } = await supabase.storage
        .from("book-covers")
        .upload(coverFileName, coverBuffer, {
          contentType: cover_image.type,
          cacheControl: "3600",
        })

      if (coverError) {
        console.error("Error uploading cover image:", coverError)
        return { success: false, error: "Failed to upload cover image" }
      }

      const { data: coverUrl } = supabase.storage.from("book-covers").getPublicUrl(coverFileName)
      cover_image_url = coverUrl.publicUrl
    }

    const pdfBuffer = await pdf_file.arrayBuffer()
    const { data: pdfData, error: pdfError } = await supabase.storage.from("book-pdfs").upload(pdfFileName, pdfBuffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
    })

    if (pdfError) {
      console.error("Error uploading PDF file:", pdfError)
      return { success: false, error: "Failed to upload PDF file" }
    }

    const { data: pdfUrl } = supabase.storage.from("book-pdfs").getPublicUrl(pdfFileName)

    const { data: book, error: bookError } = await supabase
      .from("books")
      .insert([
        {
          title,
          slug,
          description,
          isbn: isbn || null,
          language,
          publication_year,
          author,
          category,
          downloads: 0,
          cover_image_url,
          pdf_url: pdfUrl.publicUrl,
          status: "published",
          summary,
        },
      ])
      .select()

    if (bookError) {
      console.error("Error inserting book record:", bookError)
      return { success: false, error: "Failed to save book information" }
    }

    revalidatePath("/admin/books")
    return { success: true, data: book }
  } catch (error) {
    console.error("Error adding book:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateBook(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const isbn = formData.get("isbn") as string
    const language = formData.get("language") as string
    const publication_year = formData.get("publication_year") ? parseInt(formData.get("publication_year") as string, 10) : null
    const author = formData.get("author") as string
    const category = formData.get("category") as string
    const cover_image = formData.get("cover_image") as File
    const pdf_file = formData.get("pdf_file") as File
    const summary = formData.get("summary") as string

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 60)

    let cover_image_url = formData.get("existing_cover_image_url") as string | null
    if (cover_image?.size > 0) {
      const coverFileName = `${uuidv4()}-${cover_image.name}`
      const coverBuffer = await cover_image.arrayBuffer()
      const { error: coverError } = await supabase.storage
        .from("book-covers")
        .upload(coverFileName, coverBuffer, {
          contentType: cover_image.type,
          cacheControl: "3600",
        })

      if (coverError) {
        console.error("Error uploading cover image:", coverError)
        return { success: false, error: "Failed to upload cover image" }
      }

      const { data: coverUrl } = supabase.storage.from("book-covers").getPublicUrl(coverFileName)
      cover_image_url = coverUrl.publicUrl
    }

    let pdf_url = formData.get("existing_pdf_url") as string
    if (pdf_file?.size > 0) {
      const pdfFileName = `${uuidv4()}-${pdf_file.name}`
      const pdfBuffer = await pdf_file.arrayBuffer()
      const { error: pdfError } = await supabase.storage.from("book-pdfs").upload(pdfFileName, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
      })

      if (pdfError) {
        console.error("Error uploading PDF file:", pdfError)
        return { success: false, error: "Failed to upload PDF file" }
      }

      const { data: pdfUrl } = supabase.storage.from("book-pdfs").getPublicUrl(pdfFileName)
      pdf_url = pdfUrl.publicUrl
    }

    const { data: book, error: bookError } = await supabase
      .from("books")
      .update({
        title,
        slug,
        description,
        isbn: isbn || null,
        language,
        publication_year,
        author,
        category,
        cover_image_url,
        pdf_url,
        status: "published",
        summary,
      })
      .eq("id", id)
      .select()

    if (bookError) {
      console.error("Error updating book record:", bookError)
      return { success: false, error: "Failed to update book information" }
    }

    revalidatePath("/admin/books")
    return { success: true, data: book }
  } catch (error) {
    console.error("Error updating book:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteBook(id: string) {
  try {
    const { error } = await supabase.from("books").delete().eq("id", id)

    if (error) {
      console.error("Error deleting book:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/books")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting book:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}