"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, BookOpenText, MoreHorizontal, Wallet, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SummaryDialog } from "@/components/ui/summary-dialog"
import { cn } from "@/lib/utils"
import { BuyNowDialog } from "@/components/ui/buy-now-dialog"

type BookMenuProps = {
  bookId: string
  pdfUrl?: string
  summary?: string
  title: string
  author: string
  image?: string
  className?: string
}

export function BookMenu({ bookId, pdfUrl, summary, title, author, image, className }: BookMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false)

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 },
    }),
    hover: { x: 8, transition: { duration: 0.15 } },
  }

  return (
    <>
      {/* Trigger Button */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full transition-all duration-300",
              isOpen ? "bg-gradient-to-br from-primary/20 to-primary/10" : "hover:bg-gray-100",
              "text-gray-600 hover:text-primary",
              className,
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Book options</span>
          </Button>
        </DropdownMenuTrigger>

        {/* Menu Content */}
        <AnimatePresence>
          {isOpen && (
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-xl bg-white/95 backdrop-blur-sm shadow-xl border border-gray-100 p-2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Download Button */}
                <DropdownMenuItem className="p-0 focus:bg-transparent">
                  <motion.div
                    custom={0}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="w-full"
                  >
                    {pdfUrl ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        download
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Download className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-gray-800">Download</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Free PDF</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground cursor-not-allowed">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <Download className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium">Download Unavailable</span>
                      </div>
                    )}
                  </motion.div>
                </DropdownMenuItem>

                {/* Buy Now Item */}
                <DropdownMenuItem className="p-0 focus:bg-transparent">
                  <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="w-full"
                  >
                    <button
                      onClick={() => setIsBuyNowOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-colors"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <WalletCards className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-gray-800">Buy Now</span>
                    </button>
                  </motion.div>
                </DropdownMenuItem>

                {/* Read Summary Item */}
                <DropdownMenuItem className="p-0 focus:bg-transparent">
                  <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="w-full"
                  >
                    <button
                      onClick={() => setIsSummaryOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-colors"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BookOpenText className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-gray-800">Read Summary</span>
                    </button>
                  </motion.div>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </DropdownMenu>

      {/* Buy Now Dialog */}
      <BuyNowDialog
        open={isBuyNowOpen}
        onOpenChange={setIsBuyNowOpen}
        author={author}
        pdfUrl={pdfUrl}
        image={image}
        title={title}
        scrollable={true}
        summary={""}  
        >
          <div>
            <span className="text-red-600 text-xs">...fluff... this shouldn't be here. Sorry <br />FOR DEVELOPERS: uncomment the content below and it won't affect anything.</span>
          </div>
          {/* <div>
              <span>We are working on ways to help you buy this book at an affordable price. <Link href="/discover" className="text-blue-500 block"><br/>Stay tuned_</Link></span>
            </div> */}
        {/* <div className="mt-6 flex justify-end"> */}
          {/* <Button
            variant="outline"
            onClick={() => setIsBuyNowOpen(false)}
            className="rounded-full border-gray-200 hover:bg-gray-50"
          >
            Close
          </Button> */}
        {/* </div> */}
      </BuyNowDialog>

      {/* Summary Dialog */}
      <SummaryDialog
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        author={author}
        image={image}
        title={title}
        scrollable={true}
        summary={summary || "No summary available for this book yet."}  
        >
         <div>
            <span className="text-red-600 text-xs">...fluff... this shouldn't be here. Sorry <br />FOR DEVELOPERS: uncomment the content below and it won't affect anything.</span>
          </div>
      </SummaryDialog>
    </>
  )
}