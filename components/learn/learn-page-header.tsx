"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, FileText, User, Settings, LogOut, BookPlus, BookHeart, Lightbulb, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import { SourcesModal } from "@/components/learn/sources-modal"
import { MenuDrawer } from "@/components/learn/menu-drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"

interface HeaderProps {
  className?: string
  onSelectQuizSource?: (sourceId: number) => void
  showActions?: boolean
}

export function LearnPageHeader({ className, onSelectQuizSource, showActions = true }: HeaderProps) {
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false)
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false)
  const [educationalLevel, setEducationalLevel] = useState<string>()
   // For demo purposes, we'll use static data
  // In a real app, this would come from your authentication system
  const userName = "Guest User"
  const userEmail = "user@umail.com"
  const userInitial = "U"

  useEffect(() => {
    const customizations = localStorage.getItem("userCustomizations")
    if (customizations) {
      const { educationalLevel } = JSON.parse(customizations)
      setEducationalLevel(educationalLevel)
    }
  }, [])

  return (
    <>
      <header className={cn("w-full border-b bg-background sticky top-0 z-10", className)}>
        <div className="container flex h-16 items-center justify-between px-3 md:px-6">
          <Link href="/learn" className="flex items-center gap-2">
            <Logo />
          </Link>

          <div className="flex items-center gap-1">
            {showActions && (
              <>
                <Button variant="ghost" className="rounded-full" size="icon" aria-label="Menu" onClick={() => setMenuDrawerOpen(true)}>
                  <Menu className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Sources" onClick={() => setSourcesModalOpen(true)}>
                  <FileText className="h-6 w-6" />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* <Button variant="ghost" size="icon" className="rounded-full" aria-label="User profile">
                  <User className="h-6 w-6" />
                </Button> */}
              <Avatar className="cursor-pointer h-9 w-9 border border-gray-200 hover:border-primary transition-colors rounded-full flex justify-center items-center">
                <AvatarFallback>                  
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/learn">
                  <DropdownMenuItem className="rounded-2xl">
                  <Lightbulb className="h-7 w-7" />
                  <span>Learn</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/discover">
                  <DropdownMenuItem className="rounded-2xl">
                  <BookHeart className="h-7 w-7" />
                  <span>Discover books</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/request">
                  <DropdownMenuItem className="rounded-2xl">
                  <BookPlus className="h-7 w-7" />
                  <span>Request books</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/learn/settings">
                  <DropdownMenuItem className="rounded-2xl">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                  <DropdownMenuSeparator />
                  <Link href="/feedback">
                    <DropdownMenuItem className="rounded-2xl">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help & Feedback</span>
                    </DropdownMenuItem>
                  </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-2xl">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {showActions && (
        <>
          <SourcesModal 
            open={sourcesModalOpen} 
            onOpenChange={setSourcesModalOpen} 
            educationalLevel={educationalLevel}
          />
          <MenuDrawer
            open={menuDrawerOpen}
            onOpenChange={setMenuDrawerOpen}
            onSelectQuizSource={(sourceId) => {
              if (onSelectQuizSource) {
                onSelectQuizSource(sourceId)
              }
            }}
          />
        </>
      )}
    </>
  )
}
