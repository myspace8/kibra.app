import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

// Mock data for authors
const authors = [
  {
    id: 1,
    name: "James Clear",
    books: 3,
    totalDownloads: 3500,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Robert Greene",
    books: 5,
    totalDownloads: 4200,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Yuval Noah Harari",
    books: 4,
    totalDownloads: 3800,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Morgan Housel",
    books: 2,
    totalDownloads: 2100,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Daniel Kahneman",
    books: 3,
    totalDownloads: 2800,
    image: "/placeholder.svg?height=40&width=40",
  },
]

export default function AuthorsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Authors</h1>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Author
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Books</TableHead>
              <TableHead>Total Downloads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableRow key={author.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src={author.image || "/placeholder.svg"} alt={author.name} fill className="object-cover" />
                    </div>
                    <span className="font-medium">{author.name}</span>
                  </div>
                </TableCell>
                <TableCell>{author.books}</TableCell>
                <TableCell>{author.totalDownloads}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

