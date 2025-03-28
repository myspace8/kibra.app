import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { getCollectionBySlug } from "./actions"
import { CategoryList } from "@/components/category-list"
import { SiteHeader } from "@/components/site-header"

type Props = {
  params: { slug: string }
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
    <div className="container max-w-md mx-auto px-4 pb-8">
      <SiteHeader />

      <div className="flex items-center gap-2 my-4">
        <h2 className="text-xl font-bold">{collection.name}</h2>
      </div>
      <main className="space-y-6">
        {(collection.books ?? []).length > 0 ? (
          <div className="divide-y divide-gray-200">
            {(collection.books ?? []).map((book) => (
              <div
                key={book.id}
                className="first:pt-0 last:pb-0"
              >
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
        <div className="text-center mt-8 text-sm text-muted-foreground">No more data</div>
      </main>
    </div>
  )
}