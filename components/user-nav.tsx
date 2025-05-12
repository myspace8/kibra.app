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
import { LogOut, User, Settings, HelpCircle, BookMarked, Heart, PlusCircle, BookPlus, Lightbulb, BookHeart } from "lucide-react"
import Link from "next/link"

export function UserNav() {
  // For demo purposes, we'll use static data
  // In a real app, this would come from your authentication system
  const userName = "Guest User"
  const userEmail = "user@umail.com"
  const userInitial = "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-9 w-9 border border-gray-200 hover:border-primary transition-colors">
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup> */}
          <Link href="/learn">
                  <DropdownMenuItem className="rounded-2xl py-2">
                  <Lightbulb className="h-7 w-7" />
                  <span>Learn</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/discover">
                  <DropdownMenuItem className="rounded-2xl py-2">
                  <BookHeart className="h-7 w-7" />
                  <span>Discover books</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/request">
                  <DropdownMenuItem className="rounded-2xl py-2">
                  <BookPlus className="h-7 w-7" />
                  <span>Request books</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="rounded-2xl py-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                  <DropdownMenuSeparator />
                  <Link href="/feedback">
                    <DropdownMenuItem className="rounded-2xl py-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>Help & Feedback</span>
                    </DropdownMenuItem>
                  </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-2xl py-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}