"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, CheckCircle, Clock, ArrowRight, Globe, Lock, StickyNote, User, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { quizSources } from "@/data/quiz-sources"
import { sampleNotes } from "@/data/notes-data"
import type { QuizSource } from "@/data/quiz-sources"

interface MenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectQuizSource?: (sourceId: number) => void
}

// Create additional sample sources with public/private status, creator info, and institution
const additionalSources: QuizSource[] = [
  {
    id: 3,
    name: "Science: Basic Chemistry",
    questions: [],
    completed: false,
    category: "Science",
    questionCount: 20,
    isPublic: true,
    creator: "Dr. Martinez",
    institution: "Stanford University",
  },
  {
    id: 4,
    name: "History: World War II",
    questions: [],
    completed: false,
    category: "History",
    questionCount: 18,
    isPublic: false,
    creator: "Prof. Anderson",
    institution: "Georgetown University",
  },
  {
    id: 5,
    name: "Geography: European Countries",
    questions: [],
    completed: true,
    category: "Geography",
    questionCount: 10,
    isPublic: true,
    creator: "Ms. Thompson",
    institution: "National Geographic Education",
  },
  {
    id: 6,
    name: "Computer Science: Programming Basics",
    questions: [],
    completed: false,
    category: "Computer Science",
    questionCount: 25,
    isPublic: true,
    creator: "Mr. Garcia",
    institution: "MIT OpenCourseWare",
  },
  {
    id: 7,
    name: "Physics: Laws of Motion",
    questions: [],
    completed: false,
    category: "Science",
    questionCount: 15,
    isPublic: true,
    creator: "Dr. Patel",
    institution: "California Institute of Technology",
  },
  {
    id: 8,
    name: "Literature: Shakespeare's Works",
    questions: [],
    completed: false,
    category: "Literature",
    questionCount: 20,
    isPublic: false,
    creator: "Prof. Wilson",
    institution: "Oxford University Press",
  },
]

// Combine real quiz sources with additional sample sources
const allSources = [...quizSources, ...additionalSources]

// Separate sources into private and public based on the isPublic property
const privateSources = allSources.filter((source) => !source.isPublic)
const publicSources = allSources.filter((source) => source.isPublic)

export function MenuDrawer({ open, onOpenChange, onSelectQuizSource }: MenuDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"private" | "public" | "notes">("private")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Enhanced filter function to search across multiple fields
  const filterSources = (sources: QuizSource[]) => {
    if (!searchQuery.trim()) return sources

    const query = searchQuery.toLowerCase()
    return sources.filter(
      (source) =>
        // Search in name (includes subject)
        source.name.toLowerCase().includes(query) ||
        // Search in category
        source.category
          .toLowerCase()
          .includes(query) ||
        // Search in creator name
        source.creator
          .toLowerCase()
          .includes(query) ||
        // Search in institution
        source.institution
          .toLowerCase()
          .includes(query),
    )
  }

  // Filter sources based on search query
  const filteredPrivateSources = filterSources(privateSources)
  const filteredPublicSources = filterSources(publicSources)

  const filteredNotes = sampleNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Group sources by category
  const groupSourcesByCategory = (sources: typeof allSources) => {
    return sources.reduce(
      (acc, source) => {
        if (!acc[source.category]) {
          acc[source.category] = []
        }
        acc[source.category].push(source)
        return acc
      },
      {} as Record<string, typeof allSources>,
    )
  }

  const groupedPrivateSources = groupSourcesByCategory(filteredPrivateSources)
  const groupedPublicSources = groupSourcesByCategory(filteredPublicSources)

  const handleSourceClick = (sourceId: number) => {
    if (onSelectQuizSource) {
      onSelectQuizSource(sourceId)
    }
    onOpenChange(false)
  }

  const handleNoteClick = (noteId: number) => {
    // This would navigate to the note detail page
    console.log(`Selected note: ${noteId}`)
    alert(`This would open note #${noteId} in a detailed view.`)
    onOpenChange(false)
  }

  const renderSourcesList = (sources: Record<string, typeof allSources>, isPublicTab: boolean) => {
    return (
      <div className="space-y-6 pr-3">
        {Object.entries(sources).map(([category, categorySources]) => (
          <div key={category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h4>
            <div className="space-y-2">
              {categorySources.map((source) => (
                <button
                  key={source.id}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                    source.completed
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700",
                  )}
                  onClick={() => handleSourceClick(source.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                        source.completed
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                      )}
                    >
                      {source.completed ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-medium">{source.name}</h3>
                        {source.isPublic && <Globe className="h-3 w-3 text-blue-500 dark:text-blue-400" />}
                        {!source.isPublic && <Lock className="h-3 w-3 text-amber-500 dark:text-amber-400" />}
                      </div>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 mr-0.5" />
                          <span>{source.creator}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 mr-0.5" />
                          <span>{source.institution}</span>
                        </div>
                        <div className="mt-0.5">
                          <span>{source.questionCount} questions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderNotesList = () => {
    return (
      <div className="space-y-3 pr-3">
        {filteredNotes.map((note) => (
          <button
            key={note.id}
            className="flex w-full items-start justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
            onClick={() => handleNoteClick(note.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                <StickyNote className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{note.title}</h3>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  {note.quizTitle && (
                    <>
                      <span>{note.quizTitle}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.isAIGenerated && (
                    <>
                      <span>•</span>
                      <span className="flex items-center text-purple-600 dark:text-purple-400">AI Generated</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    )
  }

  const content = (
    <div className="p-2">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search subjects, creators, institutions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base outline-1 -outline outline-white/10 placeholder:text-gray-500 sm:text-sm/6 pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "private" | "public" | "notes")}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="private" className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>Private</span>
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>Public</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1.5">
            <StickyNote className="h-3.5 w-3.5" />
            <span>Notes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="private" className="m-0">
          <div className="mb-2">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Your Private Sources</h3>
          </div>

          <ScrollArea className={isDesktop ? "h-[45vh]" : "h-[40vh]"}>
            {Object.keys(groupedPrivateSources).length > 0 ? (
              renderSourcesList(groupedPrivateSources, false)
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No private sources found matching your search.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="public" className="m-0">
          <div className="mb-2">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Public Sources</h3>
          </div>

          <ScrollArea className={isDesktop ? "h-[400px]" : "h-[40vh]"}>
            {Object.keys(groupedPublicSources).length > 0 ? (
              renderSourcesList(groupedPublicSources, true)
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No public sources found matching your search.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="m-0">
          <div className="mb-2">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Your Study Notes</h3>
          </div>

          <ScrollArea className={isDesktop ? "h-[400px]" : "h-[40vh]"}>
            {filteredNotes.length > 0 ? (
              renderNotesList()
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No notes found matching your search.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogTitle className="text-xl font-semibold p-2">Menu</DialogTitle>
          <div className="flex-1 overflow-hidden">{content}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-2 pb-6 max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">Menu</DrawerTitle>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  )
}
