import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { CategoryList } from "@/components/category-list"
import { categories } from "@/lib/categories"

const category = categories.biography

export const metadata: Metadata = {
  title: `${category.title} Books - KIBRA`,
  description: category.description,
}

export default function BiographyCategoryPage() {
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
        {/* Featured Books Section - Optimized for mobile */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Featured {category.title} Books</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {category.featuredBooks.map((book) => (
              <div key={book.id} className="flex-shrink-0 w-[70%] sm:w-[calc(100%/3-16px)] snap-start">
                <BookCard
                  id={book.id.toString()}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  image={book.image}
                  downloads={book.downloads}
                  variant="featured"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Collections */}
        {category.collections.map((collection, index) => (
          <section key={index}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{collection.title}</h3>
              <Link
                href={`/collection/biography-${collection.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-muted-foreground flex items-center"
              >
                More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {collection.books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id.toString()}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  image={book.image}
                  downloads={book.downloads}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
} 