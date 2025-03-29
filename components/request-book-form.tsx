"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

type RequestBookFormProps = {
  query: string
}

export function RequestBookForm({ query: initialQuery }: RequestBookFormProps) {
  const [query, setQuery] = useState(initialQuery) // Editable query
  const [contact, setContact] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await supabase
      .from("book_requests")
      .insert({ query: query.trim(), contact: contact.trim() })

    setIsSubmitting(false)
    if (error) {
      console.error("Error submitting request:", error)
      alert("Something went wrong. Please try again.")
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800">Request Submitted!</h3>
        <p className="text-sm text-green-700 mt-2">
          We’ll notify you at {contact} if we find your requested books. Thanks for your patience!
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800">No Results Found</h3>
      <p className="text-sm text-gray-600 mt-2">
        Can’t find "{initialQuery}"? Edit the request below and add more books you’d like us to find!
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="query" className="text-sm font-medium text-gray-700">
            Books You’re Looking For
          </Label>
          <Input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Atomic Habits, The Hating Game"
            required
            className="mt-1 rounded-lg border-gray-200 focus:border-primary/50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Edit or add more book titles, separated by commas.
          </p>
        </div>
        <div>
          <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
            WhatsApp or Email
          </Label>
          <Input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g., +1234567890 or you@example.com"
            required
            className="mt-1 rounded-lg border-gray-200 focus:border-primary/50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your WhatsApp number (with country code) or email address.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !contact.trim() || !query.trim()}
          className="w-full rounded-lg bg-primary hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Submitting...
            </span>
          ) : (
            "Request Books"
          )}
        </Button>
      </form>
    </div>
  )
}