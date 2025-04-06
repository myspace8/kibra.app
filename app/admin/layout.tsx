"use client"

import type React from "react"
import { useState } from "react"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { BookOpen, Users, FolderOpen, Tag, BarChart3, Settings, Home, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Desktop (fixed), Mobile (toggleable) */}
      <div
        className={cn(
          "bg-white shadow-md transition-all duration-300 ease-in-out",
          "fixed inset-y-0 left-0 z-50 w-64 md:static md:flex md:flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold">kibra_</h1>
          <button
            className="md:hidden p-2 focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Home className="h-5 w-5 text-gray-500" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/books"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors",
                  pathname === "/admin/books" && "bg-gray-200 font-semibold"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span>Books</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/authors"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Users className="h-5 w-5 text-gray-500" />
                <span>Authors</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Tag className="h-5 w-5 text-gray-500" />
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/collections"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <FolderOpen className="h-5 w-5 text-gray-500" />
                <span>Collections</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 focus:outline-none"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            <h1 className="text-xl font-bold md:hidden">kibra_</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-sm text-blue-600 hover:underline">
              View Site
            </Link>
            <UserNav />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}