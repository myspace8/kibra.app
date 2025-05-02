"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Search, X, MoreHorizontal, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookCard } from "@/components/book-card"
import { RequestModal } from "@/components/request-modal"
import { searchBooks } from "./actions"
import Logo from "@/components/Logo"
import { UserNav } from "@/components/user-nav"
import { supabase } from "@/lib/supabase"

export default function SearchContent({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [books, setBooks] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const router = useRouter()

  // Load recent searches from local storage on mount
  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches")
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches))
    }
  }, [])

  // Perform search and log query when query changes
  useEffect(() => {
    const fetchBooks = async () => {
      if (!query) {
        setBooks([])
        return
      }
      setIsLoading(true)

      // Log the search query to Supabase
      const { error: logError } = await supabase
        .from("search_queries")
        .insert({ query: query.trim() })
      if (logError) {
        console.error("Error logging search query:", logError)
      }

      // Fetch books
      const results = await searchBooks(query)
      setBooks(results)
      setIsLoading(false)

      // Update recent searches
      setRecentSearches((prev) => {
        const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 5)
        localStorage.setItem("recentSearches", JSON.stringify(updated))
        return updated
      })
    }
    fetchBooks()
  }, [query])

  // Handle form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newQuery = formData.get("search") as string
    setQuery(newQuery.trim())
    router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`, { scroll: false })
  }

  // Clear a recent search
  const clearSearch = (search: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((q) => q !== search)
      localStorage.setItem("recentSearches", JSON.stringify(updated))
      return updated
    })
  }

  // Clear all recent searches
  const clearAllSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  // Open modal with title
  const openRequestModal = (title: string) => {
    setModalTitle(title)
    setModalOpen(true)
  }

  const visibleSearches = showMore ? recentSearches : recentSearches.slice(0, 3)

  return (
    <>
      {/* Search Header */}
      <header className="sticky top-0 bg-white z-50 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">
            <a href="/discover">
              <Logo />
            </a>
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => router.push("/search")}
              aria-label="Open search"
            >
              <Search className="h-7 w-7" />
            </Button>
            <UserNav />
          </div>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Input
            name="search"
            placeholder="Search by title or author..."
            defaultValue={initialQuery}
            className="pr-10 rounded-lg border-gray-200 focus:border-primary/50"
          />
          <Button
            type="submit"
            variant="ghost"
            size="default"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-min"
          >
            Search
          </Button>
        </form>
      </header>

      {/* Main Content */}
      <main className="space-y-6 mt-6 min-h-[70vh]">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
              <Button
                variant="link"
                size="sm"
                onClick={clearAllSearches}
                className="text-xs text-gray-500 hover:text-red-500 p-0"
              >
                Clear All
              </Button>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {visibleSearches.map((search) => (
                <div
                  key={search}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  <button
                    onClick={() => setQuery(search)}
                    className="truncate max-w-[120px]"
                  >
                    {search}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearSearch(search)}
                    className="h-5 w-5 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {search}</span>
                  </Button>
                  {!(query === search && books.length > 0) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openRequestModal(search)}
                      className="h-5 w-5 text-gray-500 hover:text-primary"
                    >
                      <Book className="h-3 w-3" />
                      <span className="sr-only">Request {search}</span>
                    </Button>
                  )}
                </div>
              ))}
              {recentSearches.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full border-gray-200 text-gray-700 hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  {showMore ? "Less" : "More"}
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Search Results */}
        {query ? (
          isLoading ? (
            <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              Searching...
            </div>
          ) : books.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {books.map((book, index) => (
                <div key={book.id} className="first:pt-0 last:pb-0">
                  <BookCard
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    description={book.description}
                    summary={book.summary}
                    image={book.cover_image_url || "/placeholder.svg?height=100&width=70"}
                    downloads={book.downloads || 0}
                    pdf_url={book.pdf_url}
                    index={index}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center flex flex-col items-center gap-4 py-8">
              <h3 className="text-lg font-semibold text-gray-800">
                No Results for "{query}"
              </h3>
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={() => openRequestModal(query)}
              >
                <Book className="h-4 w-4" />
                Request This Book
              </Button>
              <p className="text-sm text-gray-500 max-w-md">
                Request, and we’ll notify you immediately "{query}" is available in our library.
              </p>
            </div>
          )
        ) : !recentSearches.length ? (
          <p className="text-center text-muted-foreground">Enter a search term above to find books.</p>
        ) : null}
      </main>

      {/* Request Modal */}
      <RequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialTitle={modalTitle}
      />
    </>
  )
}