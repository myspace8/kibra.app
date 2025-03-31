import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import Logo from "./Logo"

export function SiteHeader() {
  return (
    <header className="sticky top-0 bg-white z-50 py-4 pr-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">
          <Link href={"/"}>
          <Logo />
          </Link>
        </h1>
        <div className="flex items-center gap-2">
          <Link href={"/search"} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer">
          <Search className="h-7 w-7" />
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  )
}