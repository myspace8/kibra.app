import { Suspense } from "react"
import { getBooks } from "./actions"
import BooksClient from "./books-client"
import { TableSkeleton } from "@/components/admin/table-skeleton"

// ISR with 5-minute revalidation
export const revalidate = 300

export default async function BooksPage() {
  const { success, data: books, error } = await getBooks()

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Books</h1>
        {/* Add button moved to BooksClient for client-side handling */}
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <BooksClient books={books ?? null} success={success} error={error ?? null} />
      </Suspense>
    </div>
  )
}