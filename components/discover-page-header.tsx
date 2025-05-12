"use client"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import Logo from "./logo"

export function DiscoverPageHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md mb-6 border-b border-gray-200 shadow-sm">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="shrink-0">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/discover"
                className={`transition-colors hover:text-primary ${
                  pathname === "/discover" ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                Discover
              </Link>
              <Link
                href="/request"
                className={`transition-colors hover:text-primary ${
                  pathname === "/request" ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                Request
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors p-2"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}