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
        <h1 className="text-2xl font-bold">Manage Books</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Book
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author || "Unknown"}</TableCell>
                    <TableCell>{book.category || "Uncategorized"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
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
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Book"
                          onClick={() => handleEdit(book)}
                        >
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
      </div>

      <AddBookDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {selectedBook && (
        <>
          <EditBookDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            book={selectedBook}
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