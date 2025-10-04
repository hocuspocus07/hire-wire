"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export default function CreateInterviewPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [showQuestions, setShowQuestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()
const [user, setUser] = useState<any>(null)

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
  if (!title.trim()) return alert("Please enter a title first.")
  setGenerating(true)
  try {
    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: title, description }),
    })
    const data = await res.json()

    if (res.ok && data.text?.length > 0) {
      const parsedQuestions = data.text
        .split(/\n\d+\.\s+/) // split by newlines followed by number + dot
        .map((q:string, i:number) => (i === 0 ? q.replace(/^1\.\s*/, "") : q)) // clean first question
        .map((q:string) => q.trim())
        .filter((q:string) => q.length > 0)

      setQuestions(parsedQuestions)
      setShowQuestions(true)
    } else {
      alert("No questions generated.")
    }
  } catch (err) {
    console.error(err)
    alert("Failed to generate questions.")
  } finally {
    setGenerating(false)
  }
}

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions([...questions, newQuestion])
    setNewQuestion("")
  }

  const handleCreateRoom = async () => {
    if (!title.trim()) return alert("Room title cannot be empty")
    setLoading(true)
    try {
      const res = await fetch("/api/room/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          created_by: user?.id,
          data: { description, questions },
        }),
      })

      const result = await res.json()
      if (res.ok) {
        alert("Room created successfully!")
        router.push("/interviewer/interviews")
      } else {
        alert(result.error || "Failed to create room")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Interview Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Room Title</Label>
            <Input
              id="title"
              placeholder="Enter interview room title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Enter short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Generate Questions Button */}
          {!showQuestions && title.trim() && (
            <Button
              variant="outline"
              onClick={handleGenerateQuestions}
              disabled={generating}
            >
              {generating ? "Generating..." : "Create Questions"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Questions Section */}
      {showQuestions && (
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Question Input */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter a question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
              />
              <Button onClick={handleAddQuestion}>Add</Button>
            </div>

            <Separator />

            {/* Display Questions */}
            <div className="space-y-2">
              {questions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No questions generated yet.
                </p>
              ) : (
                questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                  >
                    <span>{q}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setQuestions(questions.filter((_, idx) => idx !== i))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Final Submit */}
            <Button onClick={handleCreateRoom} disabled={loading}>
              {loading ? "Creating..." : "Save Interview Room"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
