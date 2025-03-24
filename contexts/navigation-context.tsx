"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

type NavigationContextType = {
  previousPath: string | null
  setPreviousPath: (path: string) => void
}

const NavigationContext = createContext<NavigationContextType>({
  previousPath: null,
  setPreviousPath: () => {},
})

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [previousPath, setPreviousPath] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      setPreviousPath(pathname)
    }
  }, [pathname])

  return <NavigationContext.Provider value={{ previousPath, setPreviousPath }}>{children}</NavigationContext.Provider>
}

export const useNavigation = () => useContext(NavigationContext)

