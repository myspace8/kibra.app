import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { getCollectionBySlug, getAllCollectionSlugs } from "./actions"
import { CategoryList } from "@/components/category-list"
import { SiteHeader } from "@/components/site-header"
import { CardsSkeleton } from "@/components/cards-skeleton"
import Footer from "@/components/footer"
import { Suspense } from "react"

type Props = {
  params: { slug: string }
}

// ISR with 5-minute revalidation
export const revalidate = 300

// Pre-generate all collection slugs at build time
export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)

  if (!collection) {
    return {
      title: "Collection Not Found - KIBRA",
    }
  }
  
  return {
    title: `${collection.name} - KIBRA`,
    description: collection.description || `Explore books in the ${collection.name} collection`,
  }
}

// Component to render the book list
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
        <p className="text-center text-muted-foreground">No books in this collection yet.</p>
      )}
    </div>
  )
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)

  if (!collection) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
        <p className="mb-4">The collection you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/discover">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
        <SiteHeader />
      <div className="container max-w-md mx-auto px-4 pb-8">
        <div className="flex items-center gap-2 my-4">
          <h2 className="text-xl font-bold">{collection.name}</h2>
        </div>
        <main className="space-y-6 min-h-[60vh]">
          <Suspense fallback={<CardsSkeleton />}>
            <BookList books={collection.books ?? []} />
          </Suspense>
          <div className="text-center mt-8 text-sm text-muted-foreground">No more data</div>
        </main>
      </div>
      <Footer />
    </>
  )
}