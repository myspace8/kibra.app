"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export function UserNav() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
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
          <AvatarImage src="/placeholder.svg?height=32&width=32&text=U" alt={userName} />
          <AvatarFallback>{userInitial}</AvatarFallback>
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
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Feedback</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut} disabled={isLoading} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useSession } from "next-auth/react"
// import { supabase } from "@/lib/supabase"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { LogOut, User, Settings, HelpCircle } from "lucide-react"
// import { signOut } from "next-auth/react"

// export function UserNav() {
//   const { data: session, status } = useSession() // Get session data from next-auth
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()
//   const [userName, setUserName] = useState("User Account")
//   const [userEmail, setUserEmail] = useState("user@example.com")
//   const [userInitial, setUserInitial] = useState("U")

//   useEffect(() => {
//     async function getUserProfile() {
//       if (status === "loading") return // Wait until session status is resolved
//       if (status === "unauthenticated" || !session?.user) {
//         setUserName("Guest")
//         setUserEmail("Not logged in")
//         setUserInitial("G")
//         return
//       }

//       console.log(session);
      

//       try {
//         const userId = session.user.id // Assuming user.id is available from next-auth session
//         console.log(userId);
        
//         const { data: profile, error } = await supabase
//           .from("profiles")
//           .select("*")
//           .eq("id", userId)
//           .single()

//         if (error) throw error

//         if (profile && profile.full_name) {
//           setUserName(profile.full_name)
//           setUserInitial(profile.full_name.charAt(0).toUpperCase())
//         } else if (session.user.name) {
//           // Fallback to session user name if profile not found
//           setUserName(session.user.name)
//           setUserInitial(session.user.name.charAt(0).toUpperCase())
//         }

//         if (session.user.email) {
//           setUserEmail(session.user.email)
//         }
//       } catch (error) {
//         console.error("Error fetching user profile:", error)
//         setUserName("User Account")
//         setUserEmail("user@example.com")
//         setUserInitial("U")
//       }
//     }

//     getUserProfile()
//   }, [session, status]) // Re-run effect when session or status changes

//   const handleLogOut = async () => {
//     setIsLoading(true)
//     await signOut({ redirect: false }) // Avoid immediate redirect
//     window.location.href = "/" // Manually redirect to home or login
//     setIsLoading(false)
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Avatar className="h-8 w-8 cursor-pointer">
//           <AvatarImage src="/placeholder.svg?height=32&width=32&text=U" alt={userName} />
//           <AvatarFallback>{userInitial}</AvatarFallback>
//         </Avatar>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-56" align="end" forceMount>
//         <DropdownMenuLabel className="font-normal">
//           <div className="flex flex-col space-y-1">
//             <p className="text-sm font-medium leading-none">{userName}</p>
//             <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup>
//           <DropdownMenuItem>
//             <User className="mr-2 h-4 w-4" />
//             <span>Profile</span>
//           </DropdownMenuItem>
//           <DropdownMenuItem>
//             <Settings className="mr-2 h-4 w-4" />
//             <span>Settings</span>
//           </DropdownMenuItem>
//           <DropdownMenuItem>
//             <HelpCircle className="mr-2 h-4 w-4" />
//             <span>Help & Feedback</span>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={handleLogOut} disabled={isLoading} className="text-red-600 focus:text-red-600">
//           <LogOut className="mr-2 h-4 w-4" />
//           <span>{isLoading ? "Logging out..." : "Log out"}</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }