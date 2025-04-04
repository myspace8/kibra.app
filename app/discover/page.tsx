import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { BookCard } from "@/components/book-card"
import { SiteHeader } from "@/components/site-header"
import { getBooksByCollectionSlug } from "./actions"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Discover & Download",
  description: "Any book you want, in pdf format",
}

export default async function Discover() {
  const personalDevelopment = await getBooksByCollectionSlug("personal-development")
  const businessAndEntrepreneurship = await getBooksByCollectionSlug("business-entrepreneurship")
  const businessAndEntrepreneurshipBooks = businessAndEntrepreneurship.books
  const persoanalDevelopmentBooks = personalDevelopment.books


  return (
    <>
    <div className="container max-w-md mx-auto pl-4 pb-8">
      <SiteHeader />
      <main className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="text-xl font-bold">Personal Development</h2>
            <Link href={`/collection/personal-development`} className="text-sm text-muted-foreground flex items-center">
              More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div>
          <div className="space-y-4">
  {persoanalDevelopmentBooks.length > 0 ? (
    <div className="divide-y divide-gray-200">
      {persoanalDevelopmentBooks.map((book) => (
        <div
          key={book.id}
          className="first:pt-0 last:pb-0" // Adjust padding to align with borders
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
    <p className="text-center text-muted-foreground">No data available.</p>
  )}
</div>
</div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="text-xl font-bold">Business & Entrepreneurship</h2>
            <Link href={`/collection/business-entrepreneurship`} className="text-sm text-muted-foreground flex items-center">
              More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {businessAndEntrepreneurshipBooks.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {businessAndEntrepreneurshipBooks.map((book) => (
                  <div
                    key={book.id}
                    className="first:pt-0 last:pb-0" // Adjust padding to align with borders
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
              <p className="text-center text-muted-foreground">No data available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
            <Footer />

</>
  )
}
