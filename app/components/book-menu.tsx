"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Download, Share, LinkIcon, Sparkles, BookmarkPlus, BookOpen, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type BookMenuProps = {
  bookId: string
  pdfUrl?: string // Add pdfUrl prop
  className?: string
}

export function BookMenu({ bookId, pdfUrl, className }: BookMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      icon: <Download className="h-4 w-4" />,
      label: "Download",
      content: pdfUrl ? (
        <Button variant="ghost" size="sm" asChild className="w-full justify-start">
          <a href={pdfUrl} download>
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      ) : (
        <span className="text-muted-foreground">Download Unavailable</span>
      ),
    },
    { icon: <BookOpen className="h-4 w-4" />, label: "Read Now", action: () => console.log("Read Now") },
    { icon: <BookmarkPlus className="h-4 w-4" />, label: "Add to Collection", action: () => console.log("Add to Collection") },
    { icon: <Share className="h-4 w-4" />, label: "Share", action: () => console.log("Share") },
    { icon: <LinkIcon className="h-4 w-4" />, label: "Copy Link", action: () => console.log("Copy Link") },
    { icon: <Heart className="h-4 w-4" />, label: "Add to Favorites", action: () => console.log("Add to Favorites") },
    { icon: <Sparkles className="h-4 w-4" />, label: "Suggest Similar", action: () => console.log("Suggest Similar") },
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full transition-all duration-200",
            isOpen ? "bg-primary/10" : "hover:bg-gray-100",
            className,
          )}
        >
          <motion.div animate={isOpen ? { rotate: 90 } : { rotate: 0 }} transition={{ duration: 0.2 }}>
            <MoreVertical className="h-4 w-4" />
          </motion.div>
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent
            align="end"
            className="w-[220px] p-1 rounded-xl shadow-lg border border-gray-200"
            asChild
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-3 py-2">
                Book Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {menuItems.map((item, index) => (
                <DropdownMenuItem
                  key={item.label}
                  onClick={item.action}
                  className="px-3 py-2 cursor-pointer"
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary">{item.icon}</div>
                      {item.content || <span>{item.label}</span>}
                    </div>
                  </motion.div>
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  )
}