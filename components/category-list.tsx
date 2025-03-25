"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { categories } from "@/lib/categories"

type Category = {
  name: string
  slug: string
  icon?: React.ReactNode
}

const categoryList: Category[] = [
  { name: "Home", slug: "/home" },
  ...Object.entries(categories).map(([key, value]) => ({
    name: value.name,
    slug: `/category/${key}`,
  })),
]

export function CategoryList() {
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const isMobile = useMobile()

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArrow(scrollLeft > 20)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollButtons)
      // Initial check
      checkScrollButtons()

      // Scroll active item into view
      const activeItem = scrollContainer.querySelector('[data-active="true"]')
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollButtons)
      }
    }
  }, [pathname])

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {!isMobile && showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 shadow-sm backdrop-blur-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
      )}

      <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto py-3 px-1 scrollbar-hide">
        {categoryList.map((category) => {
          const isActive =
            category.slug === pathname || (category.slug !== "/home" && pathname?.startsWith(category.slug))

          return (
            <Link key={category.slug} href={category.slug} passHref>
              <motion.div
                data-active={isActive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full cursor-pointer whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                <div className="flex items-center gap-1.5">
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {!isMobile && showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 shadow-sm backdrop-blur-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      )}
    </div>
  )
}

