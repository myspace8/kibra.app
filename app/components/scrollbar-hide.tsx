"use client"

import type { ReactNode } from "react"

interface ScrollbarHideProps {
  children: ReactNode
  className?: string
}

export function ScrollbarHide({ children, className }: ScrollbarHideProps) {
  return <div className={`scrollbar-hide ${className || ""}`}>{children}</div>
}

