import type { Metadata } from "next"
import { getPopularBiographyBooks } from "./actions"
import BiographyClient from "./biography-client"

export const metadata: Metadata = {
  title: "Biography Books - KIBRA",
  description: "Discover the best biography books",
}

export default async function BiographyCategoryPage() {
  const { success, data: books, error } = await getPopularBiographyBooks()

  return <BiographyClient books={books ?? null} success={success} error={error ?? null} />
} 