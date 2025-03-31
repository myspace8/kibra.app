import Link from "next/link"
import { Search, Book, HelpCircle, MessageSquare, HelpCircleIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-8">
      <div className="container max-w-md mx-auto px-4">
        {/* Links Section */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <div className="flex flex-col items-start">
            <Link href="/search" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
              <span className="text-sm">Search</span>
            </Link>
          </div>
          <div className="flex flex-col items-start">
            <Link href="/discover" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
              <Book className="h-4 w-4" />
              <span className="text-sm">Discover</span>
            </Link>
          </div>
          <div className="flex flex-col items-star w-max">
            <Link href="/feedback" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors w-max">
              <HelpCircleIcon className="h-4 w-4" />
              <span className="text-sm">Help & Feedback</span>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} KIBRA All rights reserved.
        </div>
      </div>
    </footer>
  )
}