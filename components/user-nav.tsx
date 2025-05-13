"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, HelpCircle, Lightbulb, BookHeart, BookPlus } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

export function UserNav() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname() // Get the current URL path

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  // Helper function to determine if the link is active
  const isActive = (href: string) => pathname === href

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-9 w-9 border border-gray-200 hover:border-2 transition-colors">
          <AvatarFallback>{session?.user?.name?.[0] || "G"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 rounded-2xl flex flex-col gap-" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name || "Guest User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || "guest@example.com"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/learn">
          <DropdownMenuItem
            className={`rounded-2xl py-2 flex items-center gap-2 ${
              isActive("/learn") ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
            }`}
          >
            <Lightbulb className="h-7 w-7" />
            <span>Learn</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/discover">
          <DropdownMenuItem
            className={`rounded-2xl py-2 flex items-center gap-2 ${
              isActive("/discover") ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
            }`}
          >
            <BookHeart className="h-7 w-7" />
            <span>Discover books</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/request">
          <DropdownMenuItem
            className={`rounded-2xl py-2 flex items-center gap-2 ${
              isActive("/request") ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
            }`}
          >
            <BookPlus className="h-7 w-7" />
            <span>Request books</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem
            className={`rounded-2xl py-2 flex items-center gap-2 ${
              isActive("/settings") ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/feedback">
          <DropdownMenuItem
            className={`rounded-2xl py-2 flex items-center gap-2 ${
              isActive("/feedback") ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help & Feedback</span>
          </DropdownMenuItem>
        </Link>
        {session && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-2xl py-2 cursor-pointer flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}