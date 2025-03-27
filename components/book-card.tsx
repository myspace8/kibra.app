"use client"

import { useState, useRef, useEffect } from "react"
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
  const [isTitleSingleLine, setIsTitleSingleLine] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const formattedDownloads = downloads >= 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads.toString()

  // Check if title is single-line based on its height
  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = parseFloat(getComputedStyle(titleRef.current).lineHeight) || 20 // Default to 20px if not set
      const actualHeight = titleRef.current.offsetHeight
      // If height is roughly equal to one line-height, it’s single-line
      setIsTitleSingleLine(actualHeight <= lineHeight * 1.2) // Allow some tolerance (1.2x)
    }
  }, [title])

  return (
    <div
      className={cn(
        "relative group overflow-hidden hover:border-primary/20 transition-all duration-300",
        className,
      )}
    >
      <div className="flex gap-3 py-3">
        <div className="relative w-[80px] h-[110px] flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{author}</p>
          <h3 ref={titleRef} className="font-semibold line-clamp-2 text-[#1e1915]">
            {title}
          </h3>
          {isTitleSingleLine && description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{formattedDownloads}</span>
              </div>
            </div>
            <div className="self-end">
              <BookMenu
                bookId={id}
                pdfUrl={pdf_url}
                summary={description}
                image={image}
                title={title}
                author={author}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}