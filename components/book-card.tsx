"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Download, BookOpen } from "lucide-react"
import { BookMenu } from "@/components/book-menu"
import { cn } from "@/lib/utils"

type BookCardProps = {
  id: string
  title: string
  author: string
  description?: string
  image: string
  downloads?: number
  pdf_url?: string // Add pdf_url
  variant?: "default" | "compact" | "featured"
  className?: string
}

export function BookCard({
  id,
  title,
  author,
  description,
  image,
  downloads = 0,
  pdf_url, // Add pdf_url
  variant = "default",
  className,
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formattedDownloads = downloads >= 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads.toString()

  if (variant === "compact") {
    return (
      <motion.div
        className={cn(
          "relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
          className,
        )}
        whileHover={{ y: -5, scale: 1.02 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 p-3">
          <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{author}</p>
            <h3 className="font-medium text-sm truncate">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="h-3 w-3" />
                <span>{formattedDownloads}</span>
              </div>
            </div>
          </div>
          <BookMenu bookId={id} pdfUrl={pdf_url} /> {/* Pass pdf_url */}
        </div>
      </motion.div>
    )
  }

  if (variant === "featured") {
    return (
      <motion.div
        className={cn(
          "relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300",
          className,
        )}
        whileHover={{ y: -8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90" />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-sm text-gray-300 mb-1">{author}</p>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-200 line-clamp-2 mb-3">{description}</p>}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Download className="h-4 w-4" />
                <span>{formattedDownloads}</span>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <BookMenu bookId={id} pdfUrl={pdf_url} /> {/* Pass pdf_url */}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn(
        "relative group rounded-lg overflow-hidden border border-gray-200 hover:border-primary/20 transition-all duration-300",
        className,
      )}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3 p-3">
        <div className="relative w-[70px] h-[100px] flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center"
              >
                <Link href={`/book/${id}`}>
                  <BookOpen className="h-6 w-6 text-white hover:text-primary transition-colors" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{author}</p>
          <h3 className="font-medium line-clamp-2">{title}</h3>

          {description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>}

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{formattedDownloads}</span>
            </div>
          </div>
        </div>

        <div className="self-start">
          <BookMenu bookId={id} pdfUrl={pdf_url} /> {/* Pass pdf_url */}
        </div>
      </div>
    </motion.div>
  )
}