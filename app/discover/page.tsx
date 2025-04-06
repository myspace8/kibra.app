import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { BookCard } from "@/components/book-card"
import { SiteHeader } from "@/components/site-header"
import { CardsSkeleton } from "@/components/cards-skeleton"
import { getBooksByCollectionSlug } from "./actions"
import Footer from "@/components/footer"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Discover & Download",
  description: "Any book you want, in pdf format",
}

// Force dynamic rendering for streaming
export const dynamic = "force-dynamic"

// Component to render a list of books
async function BookList({ books }: { books: any[] }) {
  return (
    <div className="space-y-4">
      {books.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {books.map((book) => (
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
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No data available.</p>
      )}
    </div>
  )
}

// Personal Development Section with streaming fetch
async function PersonalDevelopmentSection() {
  const { books } = await getBooksByCollectionSlug("personal-development")
  return (
    <>
      <BookList books={books} />
    </>
  )
}

// Business & Entrepreneurship Section with streaming fetch
async function BusinessSection() {
  const { books } = await getBooksByCollectionSlug("business-entrepreneurship")
  return (
    <>
      <BookList books={books} />
    </>
  )
}

export default async function Discover() {
  return (
    <>
      <div className="container max-w-md mx-auto pl-4 pb-8">
        <SiteHeader />
        <main className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 pr-4">
              <h2 className="text-xl font-bold">Personal Development</h2>
              <Link href="/collection/personal-development" className="text-sm text-muted-foreground flex items-center">
                More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<CardsSkeleton />}>
              <PersonalDevelopmentSection />
            </Suspense>
          </section>
          <section>
            <div className="flex items-center justify-between mb-4 pr-4">
              <h2 className="text-xl font-bold">Business & Entrepreneurship</h2>
              <Link href="/collection/business-entrepreneurship" className="text-sm text-muted-foreground flex items-center">
                More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<CardsSkeleton />}>
              <BusinessSection />
            </Suspense>
          </section>
        </main>
      </div>
      <Footer />
    </>
  )
}