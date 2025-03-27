"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Download, BookOpen, TrendingUp, Star } from "lucide-react"
import { BookMenu } from "@/components/book-menu"
import { cn } from "@/lib/utils"

type BookCardProps = {
  id: string
  title: string
  author: string
  description?: string
  image: string
  downloads?: number
  pdf_url?: string
  variant?: "default" | "compact" | "featured" | "popular"
  className?: string
  rank?: number
}

export function BookCard({
  id,
  title,
  author,
  description,
  image,
  downloads = 0,
  pdf_url,
  className,
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formattedDownloads = downloads >= 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads.toString()

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

        <div className="self-end">
          <BookMenu bookId={id} pdfUrl={pdf_url} summary={description} image={image} title={title} author={author} /> {/* Pass description as summary */}
        </div>
      </div>
    </motion.div>
  )
}