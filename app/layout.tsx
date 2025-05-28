import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationProvider } from "@/contexts/navigation-context"
import { AuthProvider } from "./providers"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

// Define metadata if needed
export const metadata = {
  title: "Test your skills on WAEC-Based Questions",
  description: "Your App Description",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <NavigationProvider>
            <AuthProvider>
              {children}
                <Toaster />
            </AuthProvider>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
