import type React from "react"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { BookOpen, Users, FolderOpen, Tag, BarChart3, Settings, Home } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">KIBRA Admin</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Home className="h-5 w-5 text-gray-500" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/books"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span>Books</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/authors"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Users className="h-5 w-5 text-gray-500" />
                <span>Authors</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Tag className="h-5 w-5 text-gray-500" />
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/collections"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <FolderOpen className="h-5 w-5 text-gray-500" />
                <span>Collections</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="md:hidden">
            <h1 className="text-xl font-bold">KIBRA Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-sm text-blue-600 hover:underline">
              View Site
            </Link>
            <UserNav />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}

