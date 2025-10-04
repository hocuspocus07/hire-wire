"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: string
  text: string
}

interface Participant {
  id: string
  name: string
  score: number | null
}

interface InterviewRoomData {
  id: string
  title: string
  created_by: string
  ownerName?: string
  questions: Question[]
  participants: Participant[]
}

interface RoomDataFromDB {
  id: string
  title: string
  created_by: string
  data?: {
    questions?: Question[]
    participants?: Participant[]
  }
}

interface AnswerData {
  question_id: string
  question: string  
  content: string
}

export default function InterviewRoom() {
  const params = useParams()
  const roomId = params.roomId as string;
  console.log(roomId)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const [roomData, setRoomData] = useState<InterviewRoomData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answer, setAnswer] = useState("")
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userAnswers, setUserAnswers] = useState<AnswerData[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          id,
          title,
          created_by,
          data
        `)
        .eq("code", roomId)
        .single()

      if (error) {
        console.log(error)
        setLoading(false)
        return
      }

      if (data) {
        const roomDataFromDB = data as RoomDataFromDB
        const ownerId = roomDataFromDB.created_by
        const { data: ownerData, error: ownerError } = await supabase
          .from("users")
          .select("name")
          .eq("id", ownerId)
          .single()

        const ownerName = ownerData?.name || "Unknown"
        const questions: Question[] = (roomDataFromDB.data?.questions || []).map((q, i) => ({
          id: i.toString(), 
          text: typeof q === 'string' ? q : q.text || '',
        }))
        const participants: Participant[] = roomDataFromDB.data?.participants || []

        setRoomData({
          id: roomDataFromDB.id,
          title: roomDataFromDB.title,
          created_by: ownerId,
          questions,
          participants,
          ownerName
        })
      }
      setLoading(false)
    }

    fetchRoom()
  }, [roomId, supabase])

  const currentQuestion = roomData?.questions?.[currentQuestionIndex]

  const handleStartInterview = () => setIsInterviewStarted(true)

  const handleNextQuestion = () => {
    if (!roomData?.questions) return
    if (currentQuestionIndex < roomData.questions.length - 1) {
      const next = currentQuestionIndex + 1
      setCurrentQuestionIndex(next)
      setAnswer("")
    } else {
      setIsCompleted(true)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return

    const newAnswer: AnswerData = {
      question_id: currentQuestion.id,
      question: currentQuestion.text, 
      content: answer.trim()
    }

    setUserAnswers(prev => [...prev, newAnswer])
    handleNextQuestion()
  }

  const handleSubmitAllAnswers = async () => {
    if (!currentUser || userAnswers.length === 0) {
      console.error("No user or answers to submit")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/ai/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: currentUser.id,
          answers: userAnswers,
          roomId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit answers')
      }

      const result = await response.json()
      console.log('AI Evaluation Result:', result)
      
      alert(`Interview completed! Your average score: ${result.average}/100\n\nYou can view detailed feedback in your dashboard.`)
      
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('Error submitting answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container mx-auto p-6">Loading room...</div>
  if (!roomData) return <div className="container mx-auto p-6">Room not found</div>

  if (!isInterviewStarted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{roomData.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">Room #{roomId}</Badge>
              <div className="text-sm text-muted-foreground flex-col flex">
                <p>Owner: {roomData.ownerName || "Unknown"} </p>
                <p>Total Questions: {roomData.questions?.length || 0}</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleStartInterview}>
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Interview Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Your Answers ({userAnswers.length}/{roomData.questions.length}):</h3>
              {userAnswers.map((answer, index) => (
                <div key={index} className="border rounded p-3 mb-2">
                  <p className="font-medium">Q: {answer.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">A: {answer.content}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleSubmitAllAnswers}
                disabled={!currentUser || userAnswers.length === 0 || submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit All Answers for AI Evaluation"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentQuestionIndex(0)
                  setIsCompleted(false)
                }}
                disabled={submitting}
              >
                Review Answers
              </Button>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Participants & Scores</h2>
              {!roomData.participants?.length && (
                <p className="text-muted-foreground">No participants yet.</p>
              )}
              {roomData.participants?.map((p) => (
                <div key={p.id} className="flex justify-between border rounded p-2">
                  <span>{p.name}</span>
                  <span>{p.score ?? "Not graded"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active interview 
  if (!currentQuestion) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <p>No questions available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">{roomData.title}</h1>
        <Badge variant="outline">Room #{roomId}</Badge>
      </div>

      <Progress
        value={((currentQuestionIndex + 1) / (roomData.questions?.length || 1)) * 100}
      />

      {currentQuestion ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Question {currentQuestionIndex + 1}/{roomData.questions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="text-lg"
              >
                {currentQuestion.text}
              </motion.p>
            </AnimatePresence>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-6 text-muted-foreground">
          Loading question...
        </div>
      )}

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
            <span className="text-xs text-muted-foreground">
              {answer.length} characters • 
              Answers collected: {userAnswers.length}/{roomData.questions.length}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNextQuestion}>
                Skip
              </Button>
              <Button onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                Submit & Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}