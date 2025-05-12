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
import { UserNav } from "../user-nav"

interface HeaderProps {
  className?: string
  onSelectQuizSource?: (sourceId: number) => void
  showActions?: boolean
}

export function LearnPageHeader({ className, onSelectQuizSource, showActions = true }: HeaderProps) {
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false)
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false)
  const [educationalLevel, setEducationalLevel] = useState<string>()

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

          <div className="flex items-center">
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
            <UserNav />
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
