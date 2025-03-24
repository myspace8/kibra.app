import { getBooks } from "./actions"
import BooksClient from "./books-client"

export default async function BooksPage() {
  const { success, data: books, error } = await getBooks()

  return <BooksClient books={books ?? null} success={success} error={error ?? null} />
}