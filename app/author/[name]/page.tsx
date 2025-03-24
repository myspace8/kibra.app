import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { CategoryList } from "@/components/category-list"

type Props = {
  params: { name: string }
}

export function generateMetadata({ params }: Props): Metadata {
  // Format the author name (e.g., "robert-green" to "Robert Green")
  const authorName = params.name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `Books by ${authorName} - KIBRA`,
  }
}

export default function AuthorPage({ params }: Props) {
  // Format the author name (e.g., "robert-green" to "Robert Green")
  const authorName = params.name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Dummy data for books by this author
  const authorBooks = [
    {
      id: 1,
      title: "The 48 Laws of Power",
      description:
        "Amoral, cunning, ruthless, and instructive, this multi-million-copy New York Times bestseller is the definitive manual for anyone interested in gaining power.",
      downloads: 450000,
      image: "/placeholder.svg?height=100&width=70",
    },
    {
      id: 2,
      title: "Mastery",
      description:
        "From the bestselling author of The 48 Laws of Power and The Laws of Human Nature, a vital work revealing that the secret to mastery is already within you.",
      downloads: 325000,
      image: "/placeholder.svg?height=100&width=70",
    },
    {
      id: 3,
      title: "The Art of Seduction",
      description:
        "From the author of the multi-million copy bestseller The 48 Laws of Power and The Laws of Human Nature, a mesmerizing handbook on seduction: the most subtle and effective form of power.",
      downloads: 287000,
      image: "/placeholder.svg?height=100&width=70",
    },
    {
      id: 4,
      title: "The 33 Strategies of War",
      description:
        "Spanning world civilizations, synthesizing dozens of political, philosophical, and religious texts and thousands of years of violent conflict.",
      downloads: 198000,
      image: "/placeholder.svg?height=100&width=70",
    },
    {
      id: 5,
      title: "The Laws of Human Nature",
      description:
        "From the #1 New York Times-bestselling author of The 48 Laws of Power comes the definitive new book on decoding the behavior of the people around you.",
      downloads: 512000,
      image: "/placeholder.svg?height=100&width=70",
    },
  ]

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

      <div className="flex items-center gap-2 my-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
          <Link href="/home">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold">{authorName}</h2>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden mb-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full" />
          <Image src="/placeholder.svg?height=120&width=120" alt={authorName} fill className="object-cover" />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary/10 ring-offset-2 ring-offset-white" />
        </div>
        <h3 className="text-lg font-medium">{authorName}</h3>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
          {authorName} is a renowned author known for insightful books on power, strategy, and human behavior.
        </p>
      </div>

      <h3 className="text-lg font-medium mb-4">Books by {authorName.split(" ")[0]}</h3>

      <main className="space-y-6">
        {authorBooks.map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={authorName}
            description={book.description}
            image={book.image}
            downloads={book.downloads}
          />
        ))}

        <div className="text-center mt-8 text-sm text-muted-foreground">No more data</div>
      </main>
    </div>
  )
}

