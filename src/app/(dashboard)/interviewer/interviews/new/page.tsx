"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import {
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateInterviewPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([]) 
  const [newQuestion, setNewQuestion] = useState("")
  const [showQuestions, setShowQuestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
    })
  }, [])

  const handleGenerateQuestions = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title first.")
      return
    }
    setGenerating(true)
    setShowQuestions(false)
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: title, description }),
      })
      const data = await res.json()

      if (res.ok && data.text?.length > 0) {
        try {
          const cleaned = data.text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
          const parsed = JSON.parse(cleaned).map((q: any) => ({
            ...q,
            showAnswer: false,
          }))
          setQuestions(parsed)
          setShowQuestions(true)
          toast.success("AI questions generated successfully!")
        } catch (parseErr) {
          console.error("JSON parsing failed:", parseErr)
          toast.error("Failed to parse AI output. Please try again.")
        }
      } else {
        toast.warning("The AI did not generate any questions.")
        setShowQuestions(true) 
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while generating questions.")
    } finally {
      setGenerating(false)
    }
  }

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions([
      ...questions,
      { question: newQuestion, answer: "No answer provided.", showAnswer: false },
    ])
    setNewQuestion("")
  }

  const handleCreateRoom = async () => {
    if (!title.trim()) {
      toast.error("Room title cannot be empty.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/room/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          created_by: user?.id,
          data: { description, questions },
          public: isPublic,
        }),
      })

      if (res.ok) {
        toast.success("Interview room created successfully!")
        router.push("/interviewer/interviews")
      } else {
        const result = await res.json()
        toast.error(result.error || "Failed to create room.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container max-w-4xl mx-auto py-8 md:py-12 px-4">
      <div className="space-y-2 mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Create a New Interview
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Set up your interview room details. You can add questions manually or
          let our AI generate them for you based on the title.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Room Details</CardTitle>
            <CardDescription>
              Start by giving your interview room a title and an optional
              description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Room Title</Label>
              <Input
                id="title"
                placeholder="e.g., 'Senior React Developer Interview'"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Textarea
                id="desc"
                placeholder="e.g., 'Focus on React hooks, state management, and performance.'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="public-toggle" className="text-base">
                  Make Interview Public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Public rooms will be visible to everyone on the platform.
                </p>
              </div>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                aria-label="Toggle public visibility"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateQuestions}
              disabled={generating || !title.trim()}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {generating ? "Generating..." : "Generate Questions with AI"}
            </Button>
          </CardFooter>
        </Card>

        {/* Skeleton Loader while generating */}
        {generating && (
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        )}

        {!generating && showQuestions && (
          <Card>
            <CardHeader>
              <CardTitle>2. Interview Questions</CardTitle>
              <CardDescription>
                Review the generated questions or add your own.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a new question and press Enter"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                />
                <Button onClick={handleAddQuestion} aria-label="Add question">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No questions yet. Add one manually or use the AI generator.
                  </p>
                ) : (
                  questions.map((q, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 space-y-3 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-medium flex-1 pt-1">
                          {i + 1}. {q.question}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setQuestions((prev) =>
                                prev.map((item, idx) =>
                                  idx === i
                                    ? { ...item, showAnswer: !item.showAnswer }
                                    : item
                                )
                              )
                            }
                          >
                            {q.showAnswer ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setQuestions((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {q.showAnswer && (
                        <div className="prose prose-sm max-w-none text-muted-foreground border-t pt-3">
                          <p>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                onClick={handleCreateRoom}
                disabled={loading || questions.length === 0}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Creating Room..." : "Save and Create Interview Room"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  )
}
