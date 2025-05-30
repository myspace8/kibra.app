"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
interface BuyNowPropDialogProps {
  title: string
  summary: string
  image?: string
    author?: string
    pdfUrl?: string
  children: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  scrollable?: boolean
}

export function BuyNowDialog({
  title,
  summary,
  image,
    author,
    pdfUrl,
  children,
  open,
  onOpenChange,
  scrollable = false,
}: BuyNowPropDialogProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Buy Now</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col p-3 overflow-auto">
          <div className="flex flex-col items-start gap-3 mb-4">
            <div className="flex gap-3 py-3 pr-4">
              <div className="relative w-[50px] h-[70px] flex-shrink-0">
                <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover rounded-sm" />
              </div>
              <div>
                <h3 className="font-medium text-base line-clamp-2">{title}</h3>
                <p className="text-sm text-gray-500">{author}</p>
              </div>
            </div>
            <div className="text- p-6 bg-blue-50 rounded-lg border border-blue-200 mt-4">
              <h3 className="text-lg font-semibold text-blue-800">Not Available - yet</h3>
              <p className="text-sm text-blue-700 mt-2">
              We're working on a simple, affordable way for you to buy this book. For now, you can download the PDF for free and read it on your device.
              </p>
              <span className="block text-sm text-blue-700 mt-2">Stay tuned_</span>
            </div>
          </div>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              download
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-colors"
            >
              <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Download className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-gray-800">Download</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Free PDF</span>
            </a>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground cursor-not-allowed">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Download className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Download Unavailable</span>
            </div>
          )}
        </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={scrollable ? "max-h-[85vh] overflow-auto" : ""}>
        <DialogHeader>
          <DialogTitle>Buy Now</DialogTitle>
        </DialogHeader>
          <div className="flex flex-col overflow-auto">
          <div className="flex flex-col items-start gap-3 mb-4">
            <div className="flex gap-3 py-3 pr-4">
              <div className="relative w-[50px] h-[70px] flex-shrink-0">
                <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover rounded-sm" />
              </div>
              <div>
                <h3 className="font-medium text-base line-clamp-2">{title}</h3>
                <p className="text-sm text-gray-500">{author}</p>
              </div>
            </div>
            <div className="text- p-6 bg-blue-50 rounded-lg border border-blue-200 mt-4">
              <h3 className="text-lg font-semibold text-blue-800">Not Available - yet</h3>
              <p className="text-sm text-blue-700 mt-2">
              We're working on a simple, affordable way for you to buy this book. For now, you can download the PDF for free and read it on your device.
              </p>
              <span className="block text-sm text-blue-700 mt-2">Stay tuned_</span>
            </div>
          </div>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              download
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-colors"
            >
              <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Download className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-gray-800">Download</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Free PDF</span>
            </a>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground cursor-not-allowed">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Download className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Download Unavailable</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

