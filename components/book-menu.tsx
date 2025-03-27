"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Share, Heart, MoreHorizontal, BookOpenText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { cn } from "@/lib/utils"

type BookMenuProps = {
  bookId: string
  pdfUrl?: string
  summary?: string // Add summary prop
  title: string
  author: string
  image?: string
  className?: string
}

export function BookMenu({ bookId, pdfUrl, summary, title, author, image, className }: BookMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  const menuItems = [
    {
      icon: <Download className="h-4 w-4" />,
      label: "Download",
      content: pdfUrl ? (
        <a href={pdfUrl} download>
          Download
        </a>
      ) : (
        <span className="text-muted-foreground">Download Unavailable</span>
      ),
    },
    // { icon: <Share className="h-4 w-4" />, label: "Share", action: () => console.log("Share") },
    // { icon: <Heart className="h-4 w-4" />, label: "Mark as Favorite", action: () => console.log("Mark as Favorite") },
    {
      icon: <BookOpenText className="h-4 w-4" />,
      label: "Read Summary",
      action: () => setIsSummaryOpen(true), // Open dialog
    },
  ]

  return (
    <>
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
            <MoreHorizontal className="h-4 w-4" />
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

      {/* Responsive Dialog for Summary */}
      <ResponsiveDialog
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        title={title}
        author={author}
        image={image}
        description={summary || "No summary available for this book yet."}
        scrollable={true} // Enable scrolling if summary is long
      >
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setIsSummaryOpen(false)}>
            Close
          </Button>
        </div>
      </ResponsiveDialog>
    </>
  )
}