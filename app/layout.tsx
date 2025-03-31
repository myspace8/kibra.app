import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationProvider } from "@/contexts/navigation-context"
import { AuthProvider } from "./providers"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

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
            </AuthProvider>
            {/* <Footer /> */}
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
