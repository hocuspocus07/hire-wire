"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: string
  text: string
  type: "easy" | "medium" | "hard"
  timeLimit: number
}

const mockQuestions: Question[] = [
  { id: "1", text: "Explain the Virtual DOM in React and how it improves performance.", type: "easy", timeLimit: 20 },
  { id: "2", text: "What are React hooks and what are the rules for using them?", type: "easy", timeLimit: 20 },
  { id: "3", text: "Implement a custom hook for handling form state with validation.", type: "medium", timeLimit: 60 },
]

export default function InterviewRoom() {
  const params = useParams()
  const roomId = params.roomId as string

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(mockQuestions[0].timeLimit)
  const [answer, setAnswer] = useState("")
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = mockQuestions[currentQuestionIndex]

  useEffect(() => {
    if (!isInterviewStarted || isCompleted) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleNextQuestion()
          return currentQuestion.timeLimit
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isInterviewStarted, isCompleted, currentQuestionIndex])

  const handleStartInterview = () => setIsInterviewStarted(true)

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      const next = currentQuestionIndex + 1
      setCurrentQuestionIndex(next)
      setTimeLeft(mockQuestions[next].timeLimit)
      setAnswer("")
    } else {
      setIsCompleted(true)
    }
  }

  const handleSubmitAnswer = () => {
    handleNextQuestion()
  }

  // Welcome state
  if (!isInterviewStarted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Interview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border p-4">
              <div className="text-sm text-muted-foreground">Room</div>
              <div className="font-medium">#{roomId}</div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Interview Details</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Domain: Full-Stack Development</li>
                <li>• Level: Mid-Level</li>
                <li>• Total Questions: {mockQuestions.length}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Each question has a time limit</li>
                <li>• Interview auto-progresses when time ends</li>
                <li>• You cannot go back to previous questions</li>
              </ul>
            </div>

            <Button onClick={handleStartInterview} className="w-full">
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Interview Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for your time. Your responses have been recorded for evaluation.
            </p>
            <Button className="w-full">View Summary</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active interview
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Technical Interview</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {mockQuestions.length}
          </p>
        </div>
        <Badge variant="outline">Room #{roomId}</Badge>
      </div>

      {/* Overall progress */}
      <Progress value={((currentQuestionIndex + 1) / mockQuestions.length) * 100} />

      {/* Timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Time Remaining</span>
            <span className="font-mono">{timeLeft}s</span>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Question</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-base md:text-lg"
            >
              {currentQuestion.text}
            </motion.p>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Answer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-48 rounded-md border bg-background text-foreground p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{answer.length} characters</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNextQuestion}>
                Skip
              </Button>
              <Button onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
