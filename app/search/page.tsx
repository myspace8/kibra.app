import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/book-card"
import { SiteHeader } from "@/components/site-header"
import { searchBooks } from "./actions"

type Props = {
  searchParams: { q?: string } 
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = searchParams.q || "" // Access q directly, no await needed
  return {
    title: query ? `Search "${query}" - KIBRA` : "Search - KIBRA",
    description: "Search for books by title or author",
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "" // Access q directly, no await needed
  const books = query ? await searchBooks(query) : []

  return (
    <div className="container max-w-md mx-auto pl-4 pb-8">
      <SiteHeader />
      <div className="flex items-center gap-2 my-4">
        <h2 className="text-xl font-bold">
          {query ? `Search Results for "${query}"` : "Search"}
        </h2>
      </div>
      <main className="space-y-6">
        {query && books.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {books.map((book) => (
              <div
                key={book.id}
                className="first:pt-0 last:pb-0" // Adjust padding to align with borders
              >
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  summary={book.summary}
                  image={book.cover_image_url || "/placeholder.svg?height=100&width=70"}
                  downloads={book.downloads || 0}
                  pdf_url={book.pdf_url}
                />
              </div> // Close the div for each book
            ))} // Close the map function
          </div> // Close the wrapping div
        ) : query ? (
          <p className="text-center text-muted-foreground">No books found for "{query}".</p>
        ) : (
          <p className="text-center text-muted-foreground">Enter a search term above to find books.</p>
        )}
      </main>
    </div>
  )
}