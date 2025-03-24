"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

type Author = {
  id: number
  name: string
  slug: string
  image: string
}

type AuthorsCarouselProps = {
  authors: Author[]
}

export function AuthorsCarousel({ authors }: AuthorsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMobile()

  const checkScrollButtons = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer

    // Calculate active index based on scroll position
    const itemWidth = 90 // Approximate width of each item including gap
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

      return () => {
        carousel.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [])

  const scrollLeft = () => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: 200, behavior: "smooth" })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative">
      {!isMobile && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
        </div>
      )}

      <motion.div
        ref={carouselRef}
        className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {authors.map((author, index) => (
          <motion.div
            key={author.id}
            className="flex-shrink-0 w-[100px]"
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={`/author/${author.slug}`}>
              <div className="flex flex-col items-center py-2 px-4 h-36 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="relative bg-gray-600 p-4 w-[80px] h-[80px] mb-2 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full" />
                  <Image
                    src={author.image || "/placeholder.svg"}
                    alt={author.name}
                    fill
                    className="object-cover z-0 transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-full ring-2 ring-primary/10 ring-offset-2 ring-offset-white" />
                </div>
                <span className="text-sm text-center line-clamp-2 font-medium">{author.name}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {!isMobile && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

