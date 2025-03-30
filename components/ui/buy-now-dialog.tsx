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
            <div className="relative w-[50px] h-[70px] flex-shrink-0">
              <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover rounded-sm" />
            </div>
            <div>
              <h3 className="font-medium text-base">{title}</h3>
              <p className="text-sm text-gray-500">{author}</p>
            </div>
            <div>
              <span>We are working on ways to help you buy this book at an affordable price. <Link href="/discover" className="text-blue-500 block"><br/>Stay tuned_</Link></span>
            </div>
        </div>
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
          <div className="prose prose-sm max-w-none">
            <span>You can buy this book now</span>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

