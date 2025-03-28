"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import Logo from "./Logo"

export function SiteHeader() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 bg-white z-50 py-4 pr-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">
          <Link href={"/"}>
          <Logo />
          </Link>
        </h1>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-[60vw] md:w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search book or author"
              className="pl-8 h-9 w-full rounded-full bg-gray-100 border-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <UserNav />
        </div>
      </div>
    </header>
  )
}