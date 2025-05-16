"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, FileText, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import { SourcesModal } from "@/components/learn/sources-modal"
import { Menuu } from "@/components/learn/menu" // Updated to match enhanced Menuu
import { UserNav } from "../user-nav"
import { useSession } from "next-auth/react"
import { TextSearch } from "lucide-react"
import { LucideTextSearch } from "lucide-react"

// Interfaces
interface UserSettings {
  educationalLevel: "JHS" | "SHS" | "Other"
  favoriteSubject: string
}

interface HeaderProps {
  className?: string
  onSelectQuizSource?: any
  showActions?: boolean
}

export function LearnPageHeader({ className, onSelectQuizSource, showActions = true }: HeaderProps) {
  const { data: session, status } = useSession()
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    educationalLevel: "JHS",
    favoriteSubject: "Mathematics",
  })

  // Load user settings from local storage
  useEffect(() => {
    const settings = localStorage.getItem("userSettings")
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        setUserSettings({
          educationalLevel: parsed.educationalLevel || "JHS",
          favoriteSubject: parsed.favoriteSubject || "Mathematics",
        })
      } catch (err) {
        console.error("Failed to parse userSettings:", err)
      }
    }
  }, [])

  // Handle menu open/close with focus management
  const handleMenuToggle = (open: boolean) => {
    setMenuOpen(open)
    if (!open) {
      // Return focus to menu button when closing
      document.getElementById("menu-button")?.focus()
    }
  }

  return (
    <>
      <header
        className={cn(
          "w-full border-b bg-background sticky top-0 z-20 shadow-sm",
          className
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 m-auto">
          <Link href="/learn" className="flex items-center gap-2" aria-label="Home">
            <Logo />
            <span className="sr-only">Learn Platform</span>
          </Link>

          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <button
                  id="menu-button"
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 h-10 w-10 px-4 py-2"
                  aria-label="Open exam menu"
                  onClick={() => handleMenuToggle(true)}
                >
                  <TextSearch className="h-6 w-6" />
                </button>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Open sources modal"
                  onClick={() => setSourcesModalOpen(true)}
                >
                  <FileText className="h-5 w-5" />
                </Button> */}
              </>
            )}
            <UserNav />
            {/* {status === "unauthenticated" && (
              <Link href="/signup">
                <Button
                  variant="default"
                  className="bg-black hover:bg-black/90 text-white gap-2 rounded-full text-xs h-9 px-3"
                  aria-label="Sign up"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Button>
              </Link>
            )} */}
          </div>
        </div>
      </header>

      {showActions && (
        <>
          <SourcesModal
            open={sourcesModalOpen}
            onOpenChange={setSourcesModalOpen}
            educationalLevel={userSettings.educationalLevel}
          />
          <Menuu
            open={menuOpen}
            onOpenChange={handleMenuToggle}
            onSelectQuizSource={(examId) => {
              if (onSelectQuizSource) {
                onSelectQuizSource(examId)
              }
            }}
            // userSettings={userSettings}
          />
        </>
      )}
    </>
  )
}
