"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
interface ResponsiveDialogProps {
  title: string
  description?: string
  image?: string
    author?: string
    pdfUrl?: string
  children: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  scrollable?: boolean
}

export function ResponsiveDialog({
  title,
  description,
  image,
    author,
    pdfUrl,
  children,
  open,
  onOpenChange,
  scrollable = false,
}: ResponsiveDialogProps) {
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
            <DrawerTitle>Book Summary</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col p-3 overflow-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-[50px] h-[70px] flex-shrink-0">
              <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover rounded-sm" />
            </div>
            <div>
              <h3 className="font-medium text-base">{title}</h3>
              <p className="text-sm text-gray-500">{author}</p>
            </div>
          </div>

          <div className="text-sm leading-relaxed space-y-2 mb-6">
            {description}   
          </div>
        </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={scrollable ? "max-h-[85vh]" : ""}>
        <DialogHeader>
          <DialogTitle>Book Summary</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-[50px] h-[70px] flex-shrink-0">
              <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover rounded-sm" />
            </div>
            <div>
              <h3 className="font-medium text-base">{title}</h3>
              <p className="text-sm text-gray-500">{author}</p>
            </div>
          </div>

          <div className="text-sm leading-relaxed space-y-2 mb-6">
            {description}   
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

