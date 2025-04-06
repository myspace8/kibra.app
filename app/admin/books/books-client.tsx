"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Eye, Download } from "lucide-react"
import { AddBookDialog } from "@/components/admin/add-book-dialog"
import { EditBookDialog } from "@/components/admin/edit-book-dialog"
import { DeleteBookDialog } from "@/components/admin/delete-book-dialog"
import { Toaster } from "sonner"

interface Book {
  id: string
  title: string
  description: string
  isbn: string | null
  language: string
  publication_year: number | null
  cover_image_url: string | null
  pdf_url: string
  status: string
  author: string
  category: string
  downloads: number
  summary: string | null
}

interface BooksClientProps {
  books: Book[] | null
  success: boolean
  error: string | null
}

export default function BooksClient({ books, success, error }: BooksClientProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const handleEdit = (book: Book) => {
    setSelectedBook(book)
    setEditDialogOpen(true)
  }

  const handleDelete = (book: Book) => {
    setSelectedBook(book)
    setDeleteDialogOpen(true)
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Book
        </Button>
      </div>

      {/* Mobile Card Layout (below md) */}
      <div className="md:hidden space-y-4">
        {success && books && books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow p-4 w-[90vw]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-16 flex-shrink-0">
                  <img
                    src={book.cover_image_url || "/placeholder.svg"}
                    alt={book.title}
                    className="object-cover w-full h-full rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-gray-600 truncate">{book.author || "Unknown"}</p>
                  <p className="text-xs text-gray-500 truncate">{book.category || "Uncategorized"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {book.status}
                    </span>
                    <span className="text-xs text-gray-600">{book.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" size="icon" title="View PDF" asChild>
                  <a href={book.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </a>
                </Button>
                <Button variant="outline" size="icon" title="Download PDF" asChild>
                  <a href={book.pdf_url} download>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </a>
                </Button>
                <Button variant="outline" size="icon" title="Edit Book" onClick={() => handleEdit(book)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  title="Delete Book"
                  onClick={() => handleDelete(book)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            {error ? `Error: ${error}` : "No books found"}
          </div>
        )}
      </div>

      {/* Desktop Table Layout (md and up) */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Cover</TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="min-w-[150px]">Author</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Downloads</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {success && books && books.length > 0 ? (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="w-10 h-14 relative rounded overflow-hidden">
                      <img
                        src={book.cover_image_url || "/placeholder.svg"}
                        alt={book.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[200px]">{book.title}</TableCell>
                  <TableCell className="truncate max-w-[150px]">{book.author || "Unknown"}</TableCell>
                  <TableCell className="truncate max-w-[120px]">{book.category || "Uncategorized"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs whitespace-nowrap">
                      {book.status}
                    </span>
                  </TableCell>
                  <TableCell>{book.downloads.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" title="View PDF" asChild>
                        <a href={book.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" title="Download PDF" asChild>
                        <a href={book.pdf_url} download>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" title="Edit Book" onClick={() => handleEdit(book)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        title="Delete Book"
                        onClick={() => handleDelete(book)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {error ? `Error: ${error}` : "No books found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddBookDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {selectedBook && (
        <>
          <EditBookDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            book={{ ...selectedBook, summary: selectedBook?.summary || "" }}
          />
          <DeleteBookDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            book={selectedBook}
          />
        </>
      )}
    </div>
  )
}