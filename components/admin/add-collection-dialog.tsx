"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { X, Upload, Check } from "lucide-react"
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
import { addCollection } from "@/app/admin/collections/actions"

const categories = [
  "Self-Help",
  "Romance",
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

const collectionFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(1000).optional(),
  category: z.string({ required_error: "Category is required" }), // Add category
  cover_image: z.instanceof(File).optional(),
})

type CollectionFormValues = z.infer<typeof collectionFormSchema>

interface AddCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCollectionDialog({ open, onOpenChange }: AddCollectionDialogProps) {
  const router = useRouter()
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "", // Default to empty, requiring selection
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) handleCoverChange(file)
  }

  const onSubmit = async (data: CollectionFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      if (data.description) formData.append("description", data.description)
      formData.append("category", data.category) // Add category
      if (data.cover_image) formData.append("cover_image", data.cover_image)

      const result = await addCollection(formData)

      if (result.success) {
        toast.success("Collection created successfully!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create collection")
      }
    } catch (error) {
      console.error("Error adding collection:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Collection</DialogTitle>
          <DialogDescription>Create a new collection to organize your books.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter collection name" {...field} />
                  </FormControl>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter collection description" className="resize-none h-24" {...field} />
                  </FormControl>
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
                      "border border-dashed rounded-lg p-4",
                      isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      {coverPreview ? (
                        <div className="relative w-32 h-44 mb-2">
                          <img
                            src={coverPreview}
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
                    Create Collection
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

// "use client"

// import { useState, useRef } from "react"
// import { useRouter } from "next/navigation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { X, Upload, Check } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { toast } from "sonner"
// import { cn } from "@/lib/utils"
// import { addCollection } from "@/app/admin/collections/actions"

// const collectionFormSchema = z.object({
//   name: z
//     .string()
//     .min(2, { message: "Name must be at least 2 characters." })
//     .max(100, { message: "Name must not exceed 100 characters." }),
//   description: z.string().max(1000, { message: "Description must not exceed 1000 characters." }).optional(),
//   cover_image: z.instanceof(File).optional(),
// })

// type CollectionFormValues = z.infer<typeof collectionFormSchema>

// interface AddCollectionDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// export function AddCollectionDialog({ open, onOpenChange }: AddCollectionDialogProps) {
//   const router = useRouter()
//   const [coverPreview, setCoverPreview] = useState<string | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isDragging, setIsDragging] = useState(false)

//   const coverInputRef = useRef<HTMLInputElement>(null)

//   const form = useForm<CollectionFormValues>({
//     resolver: zodResolver(collectionFormSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//     },
//   })

//   const handleCoverChange = (file: File | null) => {
//     if (file) {
//       form.setValue("cover_image", file, { shouldValidate: true })
//       const reader = new FileReader()
//       reader.onload = () => setCoverPreview(reader.result as string)
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     setIsDragging(true)
//   }

//   const handleDragLeave = () => setIsDragging(false)

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     setIsDragging(false)
//     const file = e.dataTransfer.files[0]
//     if (file && file.type.startsWith("image/")) handleCoverChange(file)
//   }

//   const onSubmit = async (data: CollectionFormValues) => {
//     setIsSubmitting(true)
//     try {
//       const formData = new FormData()
//       formData.append("name", data.name)
//       if (data.description) formData.append("description", data.description)
//       if (data.cover_image) formData.append("cover_image", data.cover_image)

//       const result = await addCollection(formData)

//       if (result.success) {
//         toast.success("Collection created successfully!")
//         onOpenChange(false)
//         router.refresh()
//       } else {
//         toast.error(result.error || "Failed to create collection")
//       }
//     } catch (error) {
//       console.error("Error adding collection:", error)
//       toast.error("An unexpected error occurred")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px]">
//         <DialogHeader>
//           <DialogTitle>Add New Collection</DialogTitle>
//           <DialogDescription>Create a new collection to organize your books.</DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter collection name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description (Optional)</FormLabel>
//                   <FormControl>
//                     <Textarea placeholder="Enter collection description" className="resize-none h-24" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="cover_image"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Cover Image (Optional)</FormLabel>
//                   <div
//                     className={cn(
//                       "border border-dashed rounded-lg p-4",
//                       isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
//                     )}
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                   >
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       {coverPreview ? (
//                         <div className="relative w-32 h-44 mb-2">
//                           <img
//                             src={coverPreview}
//                             alt="Cover preview"
//                             className="w-full h-full object-cover rounded-md"
//                           />
//                           <Button
//                             type="button"
//                             variant="destructive"
//                             size="icon"
//                             className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
//                             onClick={() => {
//                               setCoverPreview(null)
//                               form.setValue("cover_image", undefined)
//                             }}
//                           >
//                             <X className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       ) : (
//                         <Upload className="h-10 w-10 text-gray-400" />
//                       )}
//                       <div className="text-center">
//                         <Button
//                           type="button"
//                           variant="link"
//                           className="text-primary hover:underline p-0 h-auto font-normal"
//                           onClick={() => coverInputRef.current?.click()}
//                         >
//                           {coverPreview ? "Change Cover" : "Upload Cover"}
//                         </Button>
//                         <Input
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           ref={coverInputRef}
//                           onChange={(e) => {
//                             const file = e.target.files?.[0]
//                             handleCoverChange(file || null)
//                           }}
//                         />
//                         <FormDescription>JPG, PNG or GIF, Max 2MB</FormDescription>
//                       </div>
//                     </div>
//                   </div>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting} className="gap-2">
//                 {isSubmitting ? (
//                   <>
//                     <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Check className="h-4 w-4" />
//                     Create Collection
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }