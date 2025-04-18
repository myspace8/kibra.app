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
  title: "Discover Great Books & Download Free PDFs",
  description: "Explore the best personal development and business books in PDF format, ready to download.",
  keywords: ["free pdf books", "personal development books", "business books", "download ebooks"],
}

// Enable ISR with a 5-minute revalidation period (300 seconds)
export const revalidate = 300

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

// Simulated entrepreneur collection data (replace with API later)
const entrepreneurCollections = [
  {
    slug: "book-recommendations-by-elon-musk",
    name: "Elon Musk",
    image: "https://cdn.businessinsider.es/sites/navi.axelspringer.es/public/media/image/2024/01/elon-musk-3265659.jpg?tf=3840x",
  },
  {
    slug: "book-recommendations-by-bill-gates",
    name: "Bill Gates",
    image: "https://a57.foxnews.com/static.foxnews.com/foxnews.com/content/uploads/2021/05/1200/675/Bill-Gates-AP-2.jpg?ve=1&tl=1",
  },
  {
    slug: "book-recommendations-by-oprah-winfrey",
    name: "Oprah Winfrey",
    image: "https://assets.entrepreneur.com/content/3x2/2000/1610649737-GettyImages-1292275412.jpg",
  },
  {
    slug: "book-recommendations-by-jeff-bezos",
    name: "Jeff Bezos",
    image: "https://i.ndtvimg.com/i/2013-08/51375773319_625x300.jpg",
  },
]

// Entrepreneur Recommendations Section
function EntrepreneurRecommendations() {
  return (
    <section className="space-y-4 md:max-w-fit">
      <div className="flex items-center justify-between pr-4">
        <h2 className="text-2xl max-w-[70vw] font-semibold tracking-tight text-gray-900">
          World Best Recommendations
        </h2>
      </div>
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-6 md:grid md:grid-cols-4 md:gap-8">
          {entrepreneurCollections.map((entrepreneur) => (
            <Link
              key={entrepreneur.slug}
              href={`/collection/${entrepreneur.slug}`}
              className="group flex flex-col items-center min-w-fit md:min-w-0"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={entrepreneur.image}
                  alt={entrepreneur.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 text-center">
                {entrepreneur.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Personal Development Section
async function PersonalDevelopmentSection() {
  const { books } = await getBooksByCollectionSlug("personal-development")
  return <BookList books={books} />
}

// Business & Entrepreneurship Section
async function BusinessSection() {
  const { books } = await getBooksByCollectionSlug("business-entrepreneurship")
  return <BookList books={books} />
}

export default async function Discover() {
  return (
    <>
        <SiteHeader />
      <div className="container max-w-md mx-auto px-4 pb-8 mt-2 md:max-w-3xl lg:max-w-5xl">
        <main className="space-y-8">
          <EntrepreneurRecommendations />
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Personal Development
              </h2>
              <Link
                href="/collection/personal-development"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
              >
                More <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <Suspense fallback={<CardsSkeleton />}>
              <PersonalDevelopmentSection />
            </Suspense>
          </section>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Business & Entrepreneurship
              </h2>
              <Link
                href="/collection/business-entrepreneurship"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
              >
                More <ChevronRight className="h-4 w-4 ml-1" />
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