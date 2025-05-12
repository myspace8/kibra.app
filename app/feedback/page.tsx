"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, HelpCircle, MessageSquare, Send, ChevronDown, Star } from "lucide-react"
import { DiscoverPageHeader } from "@/components/discover-page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"

export default function HelpAndFeedbackPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [feedback, setFeedback] = useState({ name: "", message: "", rating: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  // FAQ Data with JSX
  const faqs = [
    {
      question: "How do I search for books?",
      answer: (
        <>
          Visit the <Link href="/search" className="text-blue-500 hover:underline">Search Page</Link> and type a title or author in the search bar.
        </>
      ),
    },
    {
      question: "What if a book isn’t available?",
      answer: (
        <>
          On the <Link href="/search" className="text-blue-500 hover:underline">Search Page</Link>, if no results are found, use the request form to let us know what you’re looking for!
        </>
      ),
    },
    {
      question: "How can I download a book?",
      answer: "Click the menu (three dots) on a book card and select 'Download' if available.",
    },
  ]

  // Handle Feedback Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await supabase
      .from("feedback")
      .insert({
        name: feedback.name.trim(),
        message: feedback.message.trim(),
        rating: feedback.rating || null,
      })

    setIsSubmitting(false)
    if (error) {
      console.error("Error submitting feedback:", error)
      alert("Something went wrong. Please try again.")
    } else {
      setSubmitted(true)
      setFeedback({ name: "", message: "", rating: 0 })
    }
  }

  // Star Rating Handler
  const handleRating = (rating: number) => {
    setFeedback((prev) => ({ ...prev, rating }))
  }

  return (
      <>
      <DiscoverPageHeader />
    <div className="container max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center gap-2 my-6">
        <h1 className="text-2xl font-bold text-gray-800">Help & Feedback</h1>
      </div>

      {/* Help Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-primary" /> Help
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full flex justify-between items-center p-4 text-left text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-500 transition-transform duration-300",
                    expandedFAQ === index && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-4 pb-4 text-sm text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" /> Feedback
        </h2>
        {submitted ? (
          <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
            <h3 className="text-lg font-semibold text-green-800">Thanks for Your Feedback!</h3>
            <p className="text-sm text-green-700 mt-2">
              We appreciate your input and will get back to you if needed.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitted(false)}
              className="mt-4 rounded-full"
            >
              Send Another
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-4"
          >
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Your Name (Optional)
              </Label>
              <Input
                id="name"
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                placeholder="e.g., John Doe"
                className="mt-1 rounded-lg border-gray-200 focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Rate Your Experience</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors duration-200",
                        (hoveredRating || feedback.rating) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Your Feedback
              </Label>
              <Textarea
                id="message"
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                placeholder="Tell us what you think or suggest a feature..."
                required
                className="mt-1 rounded-lg border-gray-200 focus:border-primary/50 min-h-[100px]"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !feedback.message.trim()}
              className="w-full rounded-lg bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Feedback
                </>
              )}
            </Button>
          </form>
        )}
      </section>
    </div>
    <Footer />
</>
  )
}