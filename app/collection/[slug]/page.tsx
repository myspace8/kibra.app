import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { getCollectionBySlug } from "./actions"
import { CategoryList } from "@/components/category-list"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
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
  const slug = params.slug
  const collection = await getCollectionBySlug(slug)

  if (!collection) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
        <p className="mb-4">The collection you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/home">Go Home</Link>
        </Button>
      </div>
    )
  }

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
      <div className="flex items-center gap-2 my-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
          <Link href="/home">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold">{collection.name}</h2>
      </div>
      <main className="space-y-6">
        {(collection.books ?? []).length > 0 ? (
          (collection.books ?? []).map((book) => (
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
          <p className="text-center text-muted-foreground">No books in this collection yet.</p>
        )}
        <div className="text-center mt-8 text-sm text-muted-foreground">No more data</div>
      </main>
    </div>
  )
}
