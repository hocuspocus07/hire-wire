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
  questionText: string
  difficulty: string
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
  code: string
}

interface RoomDataFromDB {
  id: string;
  title: string;
  created_by: string;
  data?: {
    description?: string;
    questions?: Array<{
      id: string;
      question: string;
      difficulty: string;
      correctAnswer?: string;
    }>;
    participants?: Participant[];
  };
}

interface AnswerData {
  questionId: string
  questionText: string
  difficulty: string
  content: string
}

export default function InterviewRoom() {
  const params = useParams()
  const roomCode = params.roomId as string;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const [roomData, setRoomData] = useState<InterviewRoomData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
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
        .select(`id, title, created_by, data`)
        .eq("code", roomCode)
        .single()
console.log(data);
      if (error) {
        console.error("Error fetching room:", error)
        setLoading(false)
        return
      }

      if (data) {
        const roomDataFromDB = data as RoomDataFromDB
        const ownerId = roomDataFromDB.created_by
        
        const { data: ownerData } = await supabase
          .from("users")
          .select("name")
          .eq("id", ownerId)
          .single()

        const ownerName = ownerData?.name || "Unknown"
        
        const questions: Question[] = (roomDataFromDB.data?.questions || []).map((q, index) => ({
          id: q.id ?? index.toString(),
          questionText: q.question,
          difficulty: q.difficulty,
        }));

        const participants: Participant[] = roomDataFromDB.data?.participants || []

        setRoomData({
          id: roomDataFromDB.id,
          title: roomDataFromDB.title,
          created_by: ownerId,
          questions,
          participants,
          ownerName,
          code: roomCode
        })
      }
      setLoading(false)
    }

    fetchRoom()
  }, [roomCode, supabase])

  const currentQuestion = roomData?.questions?.[currentQuestionIndex]

  const handleStartInterview = () => setIsInterviewStarted(true)

  const handleNextQuestion = () => {
    if (!roomData?.questions) return
    if (currentQuestionIndex < roomData.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
      setAnswer("")
    } else {
      setIsCompleted(true)
    }
  }

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !answer.trim()) return

    const newAnswer: AnswerData = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      difficulty: currentQuestion.difficulty,
      content: answer.trim()
    }

    setUserAnswers(prev => [...prev, newAnswer])
    handleNextQuestion()
  }

  const handleSubmitAllAnswers = async () => {
    if (!currentUser || userAnswers.length === 0 || !roomData) {
      console.error("User not logged in, no answers to submit, or room data missing.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/ai/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: currentUser.id,
          roomCode: roomData.code,
          answers: userAnswers, 
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('AI Evaluation Result:', result)
      alert(`Interview completed! Your average score is: ${result.averageScore}/100\nDetailed feedback is available in your dashboard.`)

    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('There was an error submitting your answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container mx-auto p-6 text-center">Loading Room...</div>
  if (!roomData) return <div className="container mx-auto p-6 text-center">Room not found.</div>

  if (!isInterviewStarted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{roomData.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">Room #{roomCode}</Badge>
              <div className="text-sm text-muted-foreground text-right">
                <p>Owner: {roomData.ownerName}</p>
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
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {userAnswers.map((ans, index) => (
                  <div key={index} className="border rounded p-3">
                    <p className="font-medium">Q: {ans.questionText}</p>
                    <p className="text-sm text-muted-foreground mt-1">A: {ans.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSubmitAllAnswers} disabled={submitting} className="flex-1">
                {submitting ? "Submitting..." : "Submit for AI Evaluation"}
              </Button>
              <Button variant="outline" onClick={() => { setIsCompleted(false); setCurrentQuestionIndex(0); }} disabled={submitting}>
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">{roomData.title}</h1>
        <Badge variant="secondary">Question {currentQuestionIndex + 1} of {roomData.questions.length}</Badge>
      </div>

      <Progress value={((currentQuestionIndex + 1) / roomData.questions.length) * 100} />

      {currentQuestion ? (
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-start">
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
            <Badge variant="outline" className="capitalize">{currentQuestion.difficulty}</Badge>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-medium"
              >
                {currentQuestion.questionText}
              </motion.p>
            </AnimatePresence>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-6 text-muted-foreground">Loading question...</div>
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
            className="w-full h-48 rounded-md border bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {answer.trim().length} characters
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleNextQuestion}>Skip</Button>
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
