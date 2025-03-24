"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookMenu } from "@/components/book-menu"
import { useMobile } from "@/hooks/use-mobile"

type Book = {
  id: number
  title: string
  author?: string
  rank: number
  downloads?: number
}

type TopBooksCarouselProps = {
  books: Book[]
}

export function TopBooksCarousel({ books }: TopBooksCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMobile()
  const [visibleItems, setVisibleItems] = useState(3)

  const checkScrollButtons = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer

    // Calculate active index based on scroll position
    const itemWidth = carouselRef.current.clientWidth / visibleItems
    const newIndex = Math.round(scrollLeft / itemWidth)
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener("scroll", checkScrollButtons)
      // Initial check
      checkScrollButtons()

      // Check on window resize
      window.addEventListener("resize", checkScrollButtons)

      // Calculate visible items based on screen width
      const updateVisibleItems = () => {
        const width = window.innerWidth
        if (width < 640) {
          setVisibleItems(2)
        } else {
          setVisibleItems(3)
        }
      }

      updateVisibleItems()
      window.addEventListener("resize", updateVisibleItems)

      return () => {
        carousel.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
        window.removeEventListener("resize", updateVisibleItems)
      }
    }
  }, [])

  const scrollLeft = () => {
    if (!carouselRef.current) return
    // Scroll by visible items
    const itemWidth = carouselRef.current.clientWidth / visibleItems
    carouselRef.current.scrollBy({ left: -itemWidth * visibleItems, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!carouselRef.current) return
    // Scroll by visible items
    const itemWidth = carouselRef.current.clientWidth / visibleItems
    carouselRef.current.scrollBy({ left: itemWidth * visibleItems, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {!isMobile && canScrollLeft && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            className="rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
        </motion.div>
      )}

      <div
        ref={carouselRef}
        className="grid grid-flow-col auto-cols-[calc(100%/var(--visible-items))] gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x snap-mandatory"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "--visible-items": visibleItems,
          } as React.CSSProperties
        }
      >
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            className="snap-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-3 h-full">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={`/placeholder.svg?height=64&width=48&text=${book.rank}`}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white bg-black/50 w-full h-full flex items-center justify-center">
                      {book.rank}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">{book.title}</h3>
                </div>

                <BookMenu className="self-start" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!isMobile && canScrollRight && (
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            className="rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </motion.div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

