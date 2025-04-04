"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { BookMenu } from "@/components/book-menu"
import { cn } from "@/lib/utils"

type FeaturedBookCardProps = {
  id: string
  title: string
  author: string
  description?: string
  summary: string
  image: string
  downloads: number
  pdf_url?: string
}

export function FeaturedBookCard({
  id,
  title,
  author,
  description,
  summary,
  image,
  downloads,
  pdf_url,
}: FeaturedBookCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  return (
    <div
      className="relative flex-shrink-0 w-[150px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-[150px] h-[200px] rounded-lg overflow-hidden shadow-sm">
        {/* Shimmer Effect */}
        {!isImageLoaded && (
          <div className="absolute inset-0 shimmer bg-gray-200" />
        )}
        <Image
          src={image || "/placeholder.svg?height=200&width=150"}
          alt={title}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            isHovered && "group-hover:scale-110",
            !isImageLoaded && "opacity-0",
          )}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
        />
        {/* BookMenu (Three Dots) */}
        {/* {isHovered && ( */}
          <div className="absolute top-2 right-2">
            <BookMenu
              bookId={id}
              pdfUrl={pdf_url}
              summary={summary}
              title={title}
              author={author}
              image={image}
              className="bg-white/80 backdrop-blur-sm"
            />
          </div>
        {/* // )} */}
      </div>

      {/* Title and Author */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>
      </div>
    </div>
  )
}