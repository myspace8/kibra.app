import type { Metadata } from "next"
import { getPopularBusinessBooks, getBusinessCollections } from "./actions"
import BusinessClient from "./business-client"

export const metadata: Metadata = {
  title: "Business Books - KIBRA",
  description: "Discover the best business books",
}

export default async function BusinessCategoryPage() {
  const [booksResult, collectionsResult] = await Promise.all([
    getPopularBusinessBooks(),
    getBusinessCollections(),
  ])

  return (
    <BusinessClient
      books={booksResult.data ?? null}
      collections={collectionsResult.data ?? null}
      success={booksResult.success && collectionsResult.success}
      error={(booksResult.error || collectionsResult.error) ?? null}
    />
  )
} 