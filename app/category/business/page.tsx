import type { Metadata } from "next"
import { getPopularBusinessBooks } from "./actions"
import BusinessClient from "./business-client"

export const metadata: Metadata = {
  title: "Business Books - KIBRA",
  description: "Discover the best business books",
}

export default async function BusinessCategoryPage() {
  const { success, data: books, error } = await getPopularBusinessBooks()

  return <BusinessClient books={books ?? null} success={success} error={error ?? null} />
} 