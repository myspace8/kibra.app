"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, HelpCircle } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

export function UserNav() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("User Account")
  const [userEmail, setUserEmail] = useState("user@example.com")
  const [userInitial, setUserInitial] = useState("U")

  useEffect(() => {
    async function getUserProfile() {
      if (status === "loading") return // Wait until session status is resolved
      if (status === "unauthenticated" || !session?.user) {
        setUserName("Guest")
        setUserEmail("Not logged in")
        setUserInitial("G")
        return
      }

      try {
        const userId = session.user.id || session.user.sub // Use sub as fallback

        // Fetch profile without .single() to handle 0 or multiple rows
        const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)

        if (error) throw error

        if (profiles && profiles.length > 0) {
          // Use the first profile if multiple exist (add logic if needed)
          const profile = profiles[0]
          if (profile.full_name) {
            setUserName(profile.full_name)
            setUserInitial(profile.full_name.charAt(0).toUpperCase())
          }
        } else {
          // No profile found, fall back to session data
          setUserName(session.user.name || "")
          setUserInitial((session.user.name || "User").charAt(0).toUpperCase())
        }

        setUserEmail(session.user.email || "user@example.com")
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setUserName("User Account")
        setUserEmail("user@example.com")
        setUserInitial("U")
      }
    }

    getUserProfile()
  }, [session, status])

  const handleLogOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    window.location.href = "/"
    setIsLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <Settings className="h-7 w-7" />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <Link href={"/feedback"} className="w-full">
            <span>Help & Feedback</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}