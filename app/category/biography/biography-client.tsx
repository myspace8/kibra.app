"use client"

import Link from "next/link"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { CategoryList } from "@/components/category-list"

interface Book {
  id: string
  title: string
  author: string
  description: string
  cover_image_url: string
  downloads: number
  pdf_url: string
}

interface BiographyClientProps {
  books: Book[] | null
  success: boolean
  error: string | null
}

export default function BiographyClient({ books, success, error }: BiographyClientProps) {
  return (
    <div className="container max-w-md mx-auto px-4 pb-8">
      <header className="sticky top-0 bg-white z-10 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">KIBRA</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 h-9 w-full rounded-full bg-gray-100 border-none"
              />
            </div>
            <UserNav />
          </div>
        </div>

        <div className="mt-4">
          <CategoryList />
        </div>
      </header>

      <main className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular Biographies</h2>
          </div>
          {success && books && books.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {books.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-[280px] snap-start">
                  <BookCard
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    description={book.description}
                    image={book.cover_image_url || "/placeholder.svg?height=100&width=70"}
                    downloads={book.downloads || 0}
                    pdf_url={book.pdf_url}
                    variant="popular"
                    className="h-[180px]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {error || "No biography books available."}
            </p>
          )}
        </section>
      </main>
    </div>
  )
} 