"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { BookMenu } from "@/components/book-menu"
import { cn } from "@/lib/utils"

type BookCardProps = {
  id: string
  title: string
  author: string
  description?: string
  summary: string
  image: string
  downloads: number
  pdf_url?: string
  variant?: "default" | "compact" | "featured" | "popular"
  className?: string
  rank?: number
  index?: number // For staggered animation in lists
}

export function BookCard({
  id,
  title,
  author,
  description,
  summary,
  image,
  downloads,
  pdf_url,
  className,
  index = 0,
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTitleSingleLine, setIsTitleSingleLine] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const formattedDownloads = downloads >= 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads.toString()

  // Check if title is single-line
  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = parseFloat(getComputedStyle(titleRef.current).lineHeight) || 20
      const actualHeight = titleRef.current.offsetHeight
      setIsTitleSingleLine(actualHeight <= lineHeight * 1.2)
    }
  }, [title])

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1, // Stagger based on index
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative group overflow-hidden bg-white rounded-lg transition-all duration-300",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3 py-3 pr-4">
        {/* Image with Shimmer */}
        <div className="relative w-[80px] h-[110px] flex-shrink-0 overflow-hidden rounded-md">
          {!isImageLoaded && (
            <div className="absolute inset-0 shimmer bg-gray-200" />
          )}
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              isHovered && "group-hover:scale-110",
              !isImageLoaded && "opacity-0",
            )}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)} // Fallback if image fails
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground animate-fade-in">{author}</p>
          <h3
            ref={titleRef}
            className="font-semibold line-clamp-2 text-[#1e1915] animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {title}
          </h3>
          {isTitleSingleLine && description && (
            <p
              className="text-xs text-muted-foreground line-clamp-1 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {description}
            </p>
          )}

          <div className="flex justify-between items-center mt-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
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
                summary={summary}
                image={image}
                title={title}
                author={author}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}