"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, BookOpen } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import { AddCollectionDialog } from "@/components/admin/add-collection-dialog"
import { EditCollectionDialog } from "@/components/admin/edit-collection-dialog"
import { DeleteCollectionDialog } from "@/components/admin/delete-collection-dialog"
import { ManageBooksDialog } from "@/components/admin/manage-books-dialog"
import { Toaster } from "sonner"

interface Collection {
  id: string
  name: string
  description: string
  cover_image_url: string | null
  slug: string
  category: string
  book_count: number
}

interface CollectionsClientProps {
  collections: Collection[] | null
  success: boolean
  error: string | null
}

export default function CollectionsClient({ collections, success, error }: CollectionsClientProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [manageBooksDialogOpen, setManageBooksDialogOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection)
    setEditDialogOpen(true)
  }

  const handleDelete = (collection: Collection) => {
    setSelectedCollection(collection)
    setDeleteDialogOpen(true)
  }

  const handleManageBooks = (collection: Collection) => {
    setSelectedCollection(collection)
    setManageBooksDialogOpen(true)
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Collections</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Collection
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>{/* No whitespace between TableRow and TableHead */}
                <TableHead className="w-[50px]">Cover</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Books</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {success && collections && collections.length > 0 ? (
                collections.map((collection) => (
                  <TableRow key={collection.id}>{/* No whitespace between TableRow and TableCell */}
                    <TableCell><div className="w-10 h-14 relative rounded overflow-hidden"><img src={collection.cover_image_url || "/placeholder.svg"} alt={collection.name} className="object-cover w-full h-full" /></div></TableCell>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell>{collection.category}</TableCell>
                    <TableCell>{collection.description || "No description"}</TableCell>
                    <TableCell>{collection.book_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" title="Manage Books" onClick={() => handleManageBooks(collection)}>
                          <BookOpen className="h-4 w-4" />
                          <span className="sr-only">Manage Books</span>
                        </Button>
                        <Button variant="outline" size="icon" title="Edit Collection" onClick={() => handleEdit(collection)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700" title="Delete Collection" onClick={() => handleDelete(collection)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center">{error ? `Error: ${error}` : "No collections found"}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddCollectionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {selectedCollection && (
        <>
          <EditCollectionDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} collection={selectedCollection} />
          <DeleteCollectionDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} collection={selectedCollection} />
          <ManageBooksDialog open={manageBooksDialogOpen} onOpenChange={setManageBooksDialogOpen} collection={selectedCollection} />
        </>
      )}
    </div>
  )
}