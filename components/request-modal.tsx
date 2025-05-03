"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Book, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

// Form schema (same as RequestPage)
const requestFormSchema = z.object({
  title: z.string().min(2, {
    message: "Book title must be at least 2 characters.",
  }),
  author: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional().refine((val) => !val || /^[0-9+\s()-]+$/.test(val), {
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type RequestFormValues = z.infer<typeof requestFormSchema>

interface RequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTitle: string
}

export function RequestModal({ open, onOpenChange, initialTitle }: RequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [existingRequest, setExistingRequest] = useState(false)

  // Initialize form
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: initialTitle,
      author: "",
      description: "",
      phone: "",
      email: "",
    },
  })

  // Check for existing requests when modal opens
  // useEffect(() => {
  //   const checkExistingRequest = async () => {
  //     if (!initialTitle) return
  //     const { data, error } = await supabase
  //       .from("book_requests")
  //       .select("id")
  //       .eq("title", initialTitle.trim())
  //       .limit(1)
  //     if (error) {
  //       console.error("Error checking existing request:", error)
  //       return
  //     }
  //     setExistingRequest(!!data?.length)
  //   }
  //   if (open) {
  //     checkExistingRequest()
  //   }
  // }, [open, initialTitle])

  // Form submission handler
  async function onSubmit(data: RequestFormValues) {
    setIsSubmitting(true)

    // Log request to Supabase
    const { error } = await supabase.from("book_requests").insert({
      title: data.title,
      author: data.author || null,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email,
    })

    if (error) {
      console.error("Error submitting request:", error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      // setExistingRequest(false)
      form.reset({ title: initialTitle, author: "", description: "", phone: "", email: "" })
      onOpenChange(false)
    }, 10000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 md:p-6 md:rounded-lg w-full h-full md:h-auto md:max-h-[80vh] flex flex-col">
        {/* Sticky Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 md:static md:z-auto bg-white md:bg-transparent rounded-full h-12 w-12"
          onClick={() => onOpenChange(false)}
          aria-label="Close request form"
        >
          <X className="h-6 w-6 text-gray-700" />
        </Button>

        <DialogHeader className="px-6 pt-6 pb-4 md:pb-6">
          <DialogTitle className="text-2xl font-bold">Request a Book</DialogTitle>
          <DialogDescription className="text-gray-500">
            Submit a book request and we’ll try to add it to our library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Request Submitted!</h3>
              <p className="text-gray-500 mb-4">
                We’ll notify you immediately the book is available.
              </p>
            </div>
          ) : 
          // existingRequest ? (
          //   <div className="flex flex-col items-center justify-center py-6 text-center">
          //     <div className="rounded-full bg-yellow-100 p-3 mb-4">
          //       <AlertCircle className="h-8 w-8 text-yellow-600" />
          //     </div>
          //     <h3 className="text-xl font-medium mb-2">Request Already Exists</h3>
          //     <p className="text-gray-500 mb-4">
          //       A request for "{initialTitle}" has already been submitted. We’ll notify you when it’s available.
          //     </p>
          //     <Button onClick={() => onOpenChange(false)}>Close</Button>
          //   </div>
          // ) : 
          (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Title*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want this book? (optional)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number (optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add your WhatsApp number for faster notifications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        We’ll notify you when your book is available.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}