import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { CategoryList } from "@/components/category-list"
import { getBooksByCollectionSlug, getTrendingBooks } from "./actions"

export const metadata: Metadata = {
  title: "KIBRA - Home",
  description: "Any book you want, in pdf format",
}

export default async function HomePage() {
  const bestsellersData = await getBooksByCollectionSlug("popular-on-amazon")
  const bestsellers = bestsellersData.books
  const bestsellersSlug = bestsellersData.slug

  const trendingData = await getTrendingBooks(3)
  const trending = trendingData.books

  return (
    <div className="container max-w-md mx-auto px-4 pb-8">
      {/* ... (header unchanged) */}
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
            <h2 className="text-xl font-bold">Best Selling on Amazon</h2>
            <Link href={`/collection/${bestsellersSlug}`} className="text-sm text-muted-foreground flex items-center">
              More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {bestsellers.length > 0 ? (
              bestsellers.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  image={book.cover_image_url || "/placeholder.svg?height=100&width=70"}
                  downloads={book.downloads || 0}
                  pdf_url={book.pdf_url} // Pass pdf_url
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground">No bestsellers available.</p>
            )}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trending</h2>
          </div>
          <div className="space-y-4">
            {trending.length > 0 ? (
              trending.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  image={book.cover_image_url || "/placeholder.svg?height=80&width=80"}
                  downloads={book.downloads || 0}
                  pdf_url={book.pdf_url} // Pass pdf_url
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground">No trending books available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
