"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Minus, Globe, Lock, Building2 } from "lucide-react"
import { FileUpload } from "@/components/learn/file-upload"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SourcesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educationalLevel?: string
}

export function SourcesModal({ open, onOpenChange, educationalLevel }: SourcesModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "text">("text")
  const [questionCount, setQuestionCount] = useState(12)
  const [dokLevel, setDokLevel] = useState("1")
  const [difficultyLevel, setDifficultyLevel] = useState("Easy")
  const [textInput, setTextInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [creatorName, setCreatorName] = useState("")
  // const [institution, setInstitution] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    setIsSmallScreen(!isDesktop)
  }, [isDesktop])

  // Set default creator name on component mount
  useEffect(() => {
    setCreatorName("Current User")
    // setInstitution("")
  }, [])

  // Update textInput when selectedTopic changes
  useEffect(() => {
    if (selectedTopic) {
      // You can map the topic value to a more descriptive text if needed
      const topicDisplayNames: Record<string, string> = {
        listening_speaking: "Listening and Speaking",
        grammar: "Grammar",
        reading: "Reading",
        writing: "Writing",
        literature: "Literature",
        numbers: "Numbers and Operations",
        geometry: "Geometry",
        algebra: "Algebra",
        statistics: "Statistics",
        measurement: "Measurement",
        diversity: "Diversity of Matter",
        cycles: "Cycles",
        systems: "Systems",
        energy: "Energy",
        interactions: "Interactions",
        english: "English Language",
        mathematics: "Mathematics",
        science: "Integrated Science",
        social: "Social Studies",
        physics: "Physics",
        chemistry: "Chemistry",
        biology: "Biology",
        economics: "Economics",
        accounting: "Accounting",
        ict: "ICT",
        finance: "Finance",
        marketing: "Marketing",
        management: "Management",
        computer_science: "Computer Science",
        electrical: "Electrical Engineering",
        mechanical: "Mechanical Engineering",
        civil: "Civil Engineering",
        medicine: "Medicine",
        nursing: "Nursing",
        pharmacy: "Pharmacy",
        public_health: "Public Health",
        history: "History",
        philosophy: "Philosophy",
        languages: "Languages",
        general_knowledge: "General Knowledge",
        current_affairs: "Current Affairs",
        personal_development: "Personal Development",
        career_skills: "Career Skills",
      }
      setTextInput(topicDisplayNames[selectedTopic] || selectedTopic)
    } else {
      setTextInput("") // Clear textarea if no topic is selected
    }
  }, [selectedTopic])

  const handleIncreaseQuestions = () => {
    setQuestionCount((prev) => Math.min(prev + 1, 50))
  }

  const handleDecreaseQuestions = () => {
    setQuestionCount((prev) => Math.max(prev - 1, 1))
  }

  const handleDone = () => {
    console.log({
      type: activeTab,
      questionCount,
      dokLevel,
      difficultyLevel,
      textInput: activeTab === "text" ? textInput : null,
      file: activeTab === "file" ? selectedFile : null,
      isPublic,
      creator: creatorName,
      // institution,
    })
    onOpenChange(false)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const content = (
    <div className="p-2 overflow-auto">
      <Tabs
        defaultValue="file"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "file" | "text")}
        className="mt-4"
      >
        <TabsList className="grid w-32 grid-cols-2 rounded-full">
          <TabsTrigger value="text" className="rounded-3xl">Text</TabsTrigger>
          <TabsTrigger value="file" className="rounded-3xl">File</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4 space-y-6 max-h-[60vh]">
          <FileUpload onFileSelect={handleFileSelect} />
        </TabsContent>

        <TabsContent value="text" className="mt-4 space-y-6 max-h-[60vh]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">What are you interested in?</p>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-[140px] rounded-full">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {educationalLevel === "Junior High School" && (
                    <>
                      <SelectGroup>
                        <SelectLabel>English Language</SelectLabel>
                        <SelectItem value="listening_speaking">Listening and Speaking</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="literature">Literature</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Mathematics</SelectLabel>
                        <SelectItem value="numbers">Numbers and Operations</SelectItem>
                        <SelectItem value="geometry">Geometry</SelectItem>
                        <SelectItem value="algebra">Algebra</SelectItem>
                        <SelectItem value="statistics">Statistics</SelectItem>
                        <SelectItem value="measurement">Measurement</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Integrated Science</SelectLabel>
                        <SelectItem value="diversity">Diversity of Matter</SelectItem>
                        <SelectItem value="cycles">Cycles</SelectItem>
                        <SelectItem value="systems">Systems</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="interactions">Interactions</SelectItem>
                      </SelectGroup>
                    </>
                  )}
                  {educationalLevel === "Senior High School" && (
                    <>
                      <SelectGroup>
                        <SelectLabel>Core Subjects</SelectLabel>
                        <SelectItem value="english">English Language</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Integrated Science</SelectItem>
                        <SelectItem value="social">Social Studies</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Electives</SelectLabel>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="economics">Economics</SelectItem>
                        <SelectItem value="accounting">Accounting</SelectItem>
                        <SelectItem value="ict">ICT</SelectItem>
                      </SelectGroup>
                    </>
                  )}
                  {educationalLevel === "Tertiary (University/College/Technical Institute)" && (
                    <>
                      <SelectGroup>
                        <SelectLabel>Business & Economics</SelectLabel>
                        <SelectItem value="accounting">Accounting</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Engineering & Technology</SelectLabel>
                        <SelectItem value="computer_science">Computer Science</SelectItem>
                        <SelectItem value="electrical">Electrical Engineering</SelectItem>
                        <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Health Sciences</SelectLabel>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="nursing">Nursing</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="public_health">Public Health</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Arts & Humanities</SelectLabel>
                        <SelectItem value="literature">Literature</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="philosophy">Philosophy</SelectItem>
                        <SelectItem value="languages">Languages</SelectItem>
                      </SelectGroup>
                    </>
                  )}
                  {!educationalLevel && (
                    <SelectGroup>
                      <SelectLabel>General Topics</SelectLabel>
                      <SelectItem value="general_knowledge">General Knowledge</SelectItem>
                      <SelectItem value="current_affairs">Current Affairs</SelectItem>
                      <SelectItem value="personal_development">Personal Development</SelectItem>
                      <SelectItem value="career_skills">Career Skills</SelectItem>
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Describe something that you'd like to quiz yourself on or learn more about..."
              className="min-h-[150px] rounded-2xl text-base"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Number of Questions</Label>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleDecreaseQuestions} disabled={questionCount <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-12 text-center font-medium">{questionCount}</div>
            <Button variant="outline" size="icon" onClick={handleIncreaseQuestions} disabled={questionCount >= 50}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>DOK Level</Label>
          <Select value={dokLevel} onValueChange={setDokLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select DOK Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Level 1 - Recall</SelectItem>
              <SelectItem value="2">Level 2 - Application</SelectItem>
              <SelectItem value="3">Level 3 - Strategic Thinking</SelectItem>
              <SelectItem value="4">Level 4 - Extended Thinking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="institution">Institution</Label>
          <div className="flex items-center">
            <Input
              id="institution"
              placeholder="Your school, university, or organization"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base outline-1 -outline outline-white/10 placeholder:text-gray-500 sm:text-sm/6"
            />
          </div>
        </div> */}

        <div className="flex items-center justify-between space-x-2 pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="public-toggle">Visibility</Label>
            <div className="text-sm text-muted-foreground">
              {isPublic ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  <span>Public - Other users can access this quiz</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600 dark:text-amber-400">
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  <span>Private - Only you can access this quiz</span>
                </div>
              )}
            </div>
          </div>
          <Switch id="public-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <input type="hidden" value={creatorName} />
      </div>

      <div className="flex justify-end mt-4">
        <Button disabled onClick={handleDone}>Generate</Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogTitle className="flex flex-col text-xl font-semibold p-2"><span>Generate Personal Quiz / Exam</span> <span className="text-xs text-red-400">This feature is not available - yet <br />Please come back later</span></DialogTitle>
          <div className="flex-1 overflow-auto">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-2 pb-6 max-h-[75vh] rounded-t-3xl">
        <DrawerHeader>
          <DrawerTitle className="flex flex-col text-xl font-semibold p-2"><span>Generate Personal Quiz / Exam</span> <span className="text-xs text-red-400">This feature is not available - yet <br />Please come back later</span></DrawerTitle>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  )
}