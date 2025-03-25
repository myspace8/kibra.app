import type { Metadata } from "next"
import { getPopularBiographyBooks, getBiographyCollections } from "./actions"
import BiographyClient from "./biography-client"

export const metadata: Metadata = {
  title: "Biography Books - KIBRA",
  description: "Discover the best biography books",
}

export default async function BiographyCategoryPage() {
  const [booksResult, collectionsResult] = await Promise.all([
    getPopularBiographyBooks(),
    getBiographyCollections(),
  ])

  return (
    <BiographyClient
      books={booksResult.data ?? null}
      collections={collectionsResult.data ?? null}
      success={booksResult.success && collectionsResult.success}
      error={(booksResult.error || collectionsResult.error) ?? null}
    />
  )
} 