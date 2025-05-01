"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Book, CheckCircle, Clock, Download, Search, ThumbsUp } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import Footer from "@/components/footer"

// Form schema
const requestFormSchema = z.object({
    title: z.string().min(2, {
        message: "Book title must be at least 2 characters.",
    }),
    author: z.string().optional(),
    description: z.string().optional(), // Made optional
    phone: z
        .string()
        .min(10, { message: "Phone number must be at least 10 digits." })
        .regex(/^[0-9+\s()-]+$/, { message: "Please enter a valid phone number." }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

type RequestFormValues = z.infer<typeof requestFormSchema>

// Sample data for popular and recent requests
const sampleRequests: Request[] = [
    {
        id: "1",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        description: "Timeless lessons on wealth, greed, and happiness",
        requestCount: 24,
        status: "approved",
        image: "/placeholder.svg?height=80&width=60",
    },
    {
        id: "3",
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        description: "How we think and make decisions",
        requestCount: 15,
        status: "approved",
        image: "/placeholder.svg?height=80&width=60",
    },
]

export default function RequestPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Initialize form
    const form = useForm<RequestFormValues>({
        resolver: zodResolver(requestFormSchema),
        defaultValues: {
            title: "",
            author: "",
            description: "",
            phone: "",
            email: "",
        },
    })

    // Form submission handler
    function onSubmit(data: RequestFormValues) {
        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            console.log(data)
            setIsSubmitting(false)
            setIsSubmitted(true)
            form.reset()

            // Reset success message after 5 seconds
            setTimeout(() => {
                setIsSubmitted(false)
            }, 5000)
        }, 1500)
    }

    // Filter requests based on search query
    const filteredRequests = sampleRequests.filter(
        (request) =>
            request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.author.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <>
            <SiteHeader />
            <div className="container max-w-md mx-auto px-4 pb-8 mt-2 md:max-w-3xl lg:max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Request a Book</h1>
                    <p className="text-gray-500">
                        Can't find the book you're looking for? Request it here and we'll try to add it to our library.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
                    {/* Request Form */}
                    <Card>
                        {/* <CardHeader className="px-4">
                            <CardTitle>Submit a Book Request</CardTitle>
                            <CardDescription>
                                Fill out the form below with details about the book you'd like to see in our library.
                            </CardDescription>
                        </CardHeader> */}
                        <CardContent className="p-4">
                            {isSubmitted ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <div className="rounded-full bg-green-100 p-3 mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">Request Submitted!</h3>
                                    <p className="text-gray-500 mb-4">
                                        Thank you for your request. We'll notify you via WhatsApp and email when the book becomes available.
                                    </p>
                                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                                        Submit Another Request
                                    </Button>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Book Title*</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter the book title" {...field} />
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
                                                        <Input placeholder="Enter the author's name" {...field} />
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
                                                        <Textarea
                                                            placeholder="Tell us why you're interested in this book and how it would benefit you"
                                                            className="min-h-[100px]"
                                                            {...field}
                                                        />
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
                                                    <FormLabel>WhatsApp Number*</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" placeholder="Enter your WhatsApp number" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        We'll primarily notify you via WhatsApp when this book becomes available.
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
                                                        <Input type="email" placeholder="Enter your email as a backup" {...field} />
                                                    </FormControl>
                                                    <FormDescription>We'll also send email notifications as a backup.</FormDescription>
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
                        </CardContent>
                    </Card>

                    {/* Popular and Recent Requests */}
                    <div className="space-y-6">
                        {/* <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search existing requests..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div> */}

                        <Tabs defaultValue="popular">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="popular">Popular Requests</TabsTrigger>
                                <TabsTrigger value="recent">Recent Requests</TabsTrigger>
                            </TabsList>
                            <TabsContent value="popular" className="mt-4 space-y-4">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests
                                        .sort((a, b) => b.requestCount - a.requestCount)
                                        .map((request) => <RequestCard key={request.id} request={request} />)
                                ) : (
                                    <p className="text-center py-8 text-gray-500">No matching requests found</p>
                                )}
                            </TabsContent>
                            <TabsContent value="recent" className="mt-4 space-y-4">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((request) => <RequestCard key={request.id} request={request} />)
                                ) : (
                                    <p className="text-center py-8 text-gray-500">No matching requests found</p>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="font-medium mb-2 flex items-center">
                                <Book className="h-4 w-4 mr-2" />
                                Don't see what you're looking for?
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                                Submit a new request using the form and we'll try to add it to our library.
                            </p>
                            <div className="text-xs text-gray-400">
                                Our team reviews all requests and prioritizes books based on demand.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

// Request Card Component
interface Request {
    id: string
    title: string
    author: string
    description: string
    requestCount: number
    status: "approved" | "pending"
    image: string
}

function RequestCard({ request }: { request: Request }) {
    const [upvoted, setUpvoted] = useState(false)
    const [count, setCount] = useState(request.requestCount)

    const handleUpvote = () => {
        if (!upvoted) {
            setCount(count + 1)
            setUpvoted(true)
        } else {
            setCount(count - 1)
            setUpvoted(false)
        }
    }

    return (
        <Card className="overflow-hidden">
            <div className="flex p-3">
                {/* <div className="relative w-[60px] h-[80px] flex-shrink-0">
                    <Image
                        src={request.image || "/placeholder.svg"}
                        alt={request.title}
                        fill
                        className="object-cover rounded-sm"
                    />
                </div> */}

                <div className="flex-1 min-w-0 ml-3">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <div className="flex items-center justify-between w-full gap-2">
                                <p className="text-sm text-gray-500">{request.author}</p>
                                <StatusBadge status={request.status} />
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2">{request.title}</h3>
                            {/* <p className="text-xs text-gray-500 line-clamp-1 mt-1">{request.description}</p> */}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1 px-2 h-8 ${upvoted ? "text-primary" : "text-gray-500"}`}
                            onClick={handleUpvote}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-xs">{count}</span>
                        </Button>

                        {request.status === "approved" && (
                            <Button variant="outline" size="sm" className="h-8">
                                <Download className="h-4 w-4 mr-1" />
                                <span className="text-xs">Download</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

// Status Badge Component
function StatusBadge({ status }: { status: "approved" | "pending" }) {
    if (status === "approved") {
        return (
            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 text-[10px] h-5">
                <CheckCircle className="h-3 w-3 mr-1" />
                Available
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 text-[10px] h-5">
            <Clock className="h-3 w-3 mr-1" />
            Pending
        </Badge>
    )
}
