"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { getCollectionBooks, getAllBooks, addBooksToCollection, removeBooksFromCollection } from "@/app/admin/collections/actions"

interface Book {
  id: string
  title: string
  cover_image_url: string | null
}

interface ManageBooksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: {
    id: string
    name: string
  }
}

export function ManageBooksDialog({ open, onOpenChange, collection }: ManageBooksDialogProps) {
  const router = useRouter()
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [initialBooks, setInitialBooks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true)
        const [allBooksResult, collectionBooksResult] = await Promise.all([
          getAllBooks(),
          getCollectionBooks(collection.id),
        ])

        if (allBooksResult.success) setAllBooks(allBooksResult.data || [])
        if (collectionBooksResult.success) {
          const collectionBookIds = ((collectionBooksResult.data || []) as Book[][])
            .flat()
            .map((book) => book.id)
          setSelectedBooks(collectionBookIds)
          setInitialBooks(collectionBookIds)
        }

        setIsLoading(false)
      }
      fetchData()
    }
  }, [open, collection.id])

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setSelectedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    )
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const booksToAdd = selectedBooks.filter((id) => !initialBooks.includes(id))
      const booksToRemove = initialBooks.filter((id) => !selectedBooks.includes(id))

      const results = await Promise.all([
        booksToAdd.length > 0 ? addBooksToCollection(collection.id, booksToAdd) : Promise.resolve({ success: true }),
        booksToRemove.length > 0 ? removeBooksFromCollection(collection.id, booksToRemove) : Promise.resolve({ success: true }),
      ])

      const hasError = results.some((result) => !result.success)
      if (!hasError) {
        toast.success("Collection books updated successfully!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error("Failed to update collection books")
      }
    } catch (error) {
      console.error("Error updating collection books:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Books in "{collection.name}"</DialogTitle>
          <DialogDescription>Add or remove books from this collection.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" />
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] overflow-y-auto">
            <div className="space-y-4 p-4">
              {allBooks.length > 0 ? (
                allBooks.map((book) => (
                  <div key={book.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={book.id}
                      checked={selectedBooks.includes(book.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(book.id, checked as boolean)}
                    />
                    <Label htmlFor={book.id} className="flex items-center space-x-2">
                      <img
                        src={book.cover_image_url || "/placeholder.svg"}
                        alt={book.title}
                        className="w-8 h-12 object-cover rounded"
                      />
                      <span>{book.title}</span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No books available to add.</p>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || isLoading} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}