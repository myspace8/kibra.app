import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import SearchContent from "./search-content"
import Footer from "@/components/footer"

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const initialQuery = searchParams.q || ""

  return (
  <>
    <div className="container max-w-md mx-auto px-4 pb-8">
      <Suspense fallback={<SearchFallback initialQuery={initialQuery} />}>
        <SearchContent initialQuery={initialQuery} />

      </Suspense>
    </div>
    <Footer />
  </>
)
}

// Fallback component for Suspense during prerendering
function SearchFallback({ initialQuery }: { initialQuery: string }) {
  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">
        {initialQuery ? `Results for "${initialQuery}"` : "Search Books"}
      </h2>
      <div className="relative">
        <input
          type="text"
          defaultValue={initialQuery}
          placeholder="Search by title or author..."
          className="w-full pr-10 rounded-lg border border-gray-200 focus:border-primary/50 py-2 px-3"
          disabled
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center">
          <span className="h-4 w-4 text-gray-500">🔍</span>
        </div>
      </div>
      <p className="text-center text-muted-foreground mt-6">
        {initialQuery ? "Loading results..." : "Enter a search term to find books."}
      </p>
    </div>
  )
}
