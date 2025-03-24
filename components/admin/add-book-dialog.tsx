"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { X, Upload, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { addBook } from "@/app/admin/books/actions"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

const categories = [
  "Self-Help",
  "Business",
  "History",
  "Finance",
  "Psychology",
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Biography",
]

const bookFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters." })
    .max(100, { message: "Title must not exceed 100 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(1000, { message: "Description must not exceed 1000 characters." }),
  isbn: z.string().optional(),
  language: z
    .string()
    .min(2, { message: "Language must be at least 2 characters." })
    .default("English"),
  publication_year: z.number().min(1900).max(currentYear).optional(),
  author: z
    .string()
    .min(2, { message: "Author must be at least 2 characters." })
    .max(100, { message: "Author must not exceed 100 characters." }),
  category: z.string({ required_error: "Category is required." }),
  cover_image: z.instanceof(File).optional(),
  pdf_file: z.instanceof(File, { message: "PDF file is required." }),
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const router = useRouter()
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState<"cover" | "pdf" | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isbn: "",
      language: "English",
      publication_year: undefined,
      author: "",
      category: "",
    },
  })

  const handleCoverChange = (file: File | null) => {
    if (file) {
      form.setValue("cover_image", file, { shouldValidate: true })
      const reader = new FileReader()
      reader.onload = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePdfChange = (file: File | null) => {
    if (file) {
      form.setValue("pdf_file", file, { shouldValidate: true })
      setPdfPreview(file.name)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: "cover" | "pdf") => {
    e.preventDefault()
    setIsDragging(type)
  }

  const handleDragLeave = () => setIsDragging(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: "cover" | "pdf") => {
    e.preventDefault()
    setIsDragging(null)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (type === "cover" && file.type.startsWith("image/")) handleCoverChange(file)
      else if (type === "pdf" && file.type === "application/pdf") handlePdfChange(file)
    }
  }

  const onSubmit = async (data: BookFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("isbn", data.isbn || "")
      formData.append("language", data.language)
      if (data.publication_year) formData.append("publication_year", data.publication_year.toString())
      formData.append("author", data.author)
      formData.append("category", data.category)
      if (data.cover_image) formData.append("cover_image", data.cover_image)
      formData.append("pdf_file", data.pdf_file)

      const result = await addBook(formData)

      if (result.success) {
        toast.success("Book added successfully!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add book")
      }
    } catch (error) {
      console.error("Error adding book:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>Fill in the details below to add a new book to your library.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter book description" className="resize-none h-32" {...field} />
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
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ISBN" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Input placeholder="Language" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="publication_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publication Year (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : parseInt(value, 10))
                      }
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image (Optional)</FormLabel>
                    <div
                      className={cn(
                        "border border-dashed rounded-lg p-4 w-full",
                        isDragging === "cover" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      )}
                      onDragOver={(e) => handleDragOver(e, "cover")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "cover")}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        {coverPreview ? (
                          <div className="relative w-32 h-44 mb-2">
                            <img
                              src={coverPreview || "/placeholder.svg"}
                              alt="Cover preview"
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => {
                                setCoverPreview(null)
                                form.setValue("cover_image", undefined)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Upload className="h-10 w-10 text-gray-400" />
                        )}
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="link"
                            className="text-primary hover:underline p-0 h-auto font-normal"
                            onClick={() => coverInputRef.current?.click()}
                          >
                            {coverPreview ? "Change Cover" : "Upload Cover"}
                          </Button>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={coverInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              handleCoverChange(file || null)
                            }}
                          />
                          <FormDescription>JPG, PNG or GIF, Max 2MB</FormDescription>
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pdf_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF File</FormLabel>
                    <div
                      className={cn(
                        "border border-dashed rounded-lg p-4",
                        isDragging === "pdf" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      )}
                      onDragOver={(e) => handleDragOver(e, "pdf")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "pdf")}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        {pdfPreview ? (
                          <div className="flex items-center gap-2 w-full bg-gray-50 p-3 rounded-md">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div className="flex-1 truncate">{pdfPreview}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setPdfPreview(null)
                                form.setValue("pdf_file", undefined)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-10 w-10 text-gray-400" />
                            <div className="text-center">
                              <Button
                                type="button"
                                variant="link"
                                className="text-primary hover:underline p-0 h-auto font-normal"
                                onClick={() => pdfInputRef.current?.click()}
                              >
                                Upload PDF
                              </Button>
                              <Input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                ref={pdfInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  handlePdfChange(file || null)
                                }}
                              />
                              <FormDescription>PDF files only, Max 50MB</FormDescription>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Add Book
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}