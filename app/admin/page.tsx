import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">KIBRA Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Books</CardTitle>
            <CardDescription>Manage your book catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add, edit, or remove books from your library.</p>
            <Button asChild>
              <Link href="/admin/books">Manage Books</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authors</CardTitle>
            <CardDescription>Manage authors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add, edit, or remove authors from your library.</p>
            <Button asChild>
              <Link href="/admin/authors">Manage Authors</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage book categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add, edit, or remove categories for organizing books.</p>
            <Button asChild>
              <Link href="/admin/categories">Manage Categories</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Manage book collections</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage curated book collections.</p>
            <Button asChild>
              <Link href="/admin/collections">Manage Collections</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View platform analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View download statistics and user engagement metrics.</p>
            <Button asChild>
              <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and manage user accounts and permissions.</p>
            <Button asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

