"use client"

import Link from "next/link"
import { FolderOpen } from "lucide-react"
import { BookCard } from "@/components/book-card"
import { DiscoverPageHeader } from "@/components/discover-page-header"
import Image from "next/image"
import { motion } from "framer-motion"

interface Book {
  id: string
  title: string
  author: string
  description: string
  cover_image_url: string
  downloads: number
  pdf_url: string
}

interface Collection {
  id: string
  name: string
  description: string
  cover_image_url: string
  slug: string
  category: string
}

interface BiographyClientProps {
  books: Book[] | null
  collections: Collection[] | null
  success: boolean
  error: string | null
}

export default function BiographyClient({ books, collections, success, error }: BiographyClientProps) {
  return (
    <div className="container max-w-md mx-auto px-4 pb-8">
      <DiscoverPageHeader />

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

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Biography Collections</h2>
          </div>
          {success && collections && collections.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {collections.map((collection) => (
                <Link key={collection.id} href={`/collection/${collection.slug}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group relative aspect-[3/2] rounded-xl overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={collection.cover_image_url || "/placeholder.svg"}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="h-4 w-4 text-white" />
                        <h3 className="font-semibold text-white">{collection.name}</h3>
                      </div>
                      <p className="text-sm text-white/80 line-clamp-2">{collection.description}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {error || "No collections available."}
            </p>
          )}
        </section>
      </main>
    </div>
  )
} 