"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { CategoryList } from "@/components/category-list"

export function SiteHeader() {
  return (
    <header className="sticky top-0 bg-white z-10 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">KIBRA</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-[200px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-8 h-9 w-full rounded-full bg-gray-100 border-none"
            />
          </div>
          <UserNav />
        </div>
      </div>

      <div className="mt-4">
        <CategoryList />
      </div>
    </header>
  )
} 