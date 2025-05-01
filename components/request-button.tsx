"use client"

import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RequestButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/request">
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg border-primary/20 bg-primary text-white hover:bg-primary/90 z-50"
            >
              <PlusCircle className="h-7 w-7" />
              <span className="sr-only">Request a book</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Request a book</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
