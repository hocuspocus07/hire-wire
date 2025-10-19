"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react"

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

interface AnswerData {
  questionId: string
  questionText: string
  difficulty: string
  content: string
}

export default function InterviewRoom() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomId as string
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const [roomData, setRoomData] = useState<InterviewRoomData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userAnswers, setUserAnswers] = useState<AnswerData[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name")
          .eq("id", user.id)
          .single()
        setCurrentUserProfile(profile)
      }
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("rooms")
        .select(`id, title, created_by, data, participants`)
        .eq("code", roomCode)
        .single()

      if (error) {
        console.error("Error fetching room:", error)
        setLoading(false)
        return
      }

      if (data) {
        const { data: ownerData } = await supabase
          .from("users")
          .select("name")
          .eq("id", data.created_by)
          .single()

        setRoomData({
          id: data.id,
          title: data.title,
          created_by: data.created_by,
          questions: (data.data?.questions || []).map((q: any, i: number) => ({
            id: q.id ?? i.toString(),
            questionText: q.question,
            difficulty: q.difficulty,
          })),
          participants: data.participants || [],
          ownerName: ownerData?.name || "Unknown",
          code: roomCode,
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
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setAnswer("")
    } else {
      setIsReviewing(true)
    }
  }

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !answer.trim()) return

    const newAnswer: AnswerData = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      difficulty: currentQuestion.difficulty,
      content: answer.trim(),
    }

    setUserAnswers((prev) => [...prev, newAnswer])
    handleNextQuestion()
  }

  const handleSubmitAllAnswers = async () => {
    if (!currentUser || !currentUserProfile || userAnswers.length === 0 || !roomData) {
      console.error("User, profile, answers, or room data is missing.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/ai/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const newParticipant = {
        id: currentUser.id,
        name: currentUserProfile.name || currentUser.email,
      }
      const isAlreadyParticipant = (roomData.participants || []).some(
        (p: Participant) => p.id === currentUser.id
      )
      if (!isAlreadyParticipant) {
        const updatedParticipants = [...(roomData.participants || []), newParticipant]
        await supabase
          .from("rooms")
          .update({ participants: updatedParticipants })
          .eq("id", roomData.id)
      }

      const score = result.average
      const feedback = encodeURIComponent(result.summary)
      router.push(`/candidate/interviews/${roomCode}/results?score=${score}&feedback=${feedback}`)

    } catch (error) {
      console.error("Error submitting answers:", error)
      alert("There was an error submitting your answers. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!roomData) {
    return <div className="container mx-auto p-6 text-center">Room not found.</div>
  }

  if (!isInterviewStarted) {
    return (
        <div className="container mx-auto p-6 max-w-2xl flex items-center min-h-[calc(100vh-8rem)]">
         <Card className="w-full shadow-lg">
           <CardHeader className="items-center text-center">
             <ClipboardList className="h-12 w-12 text-primary" />
             <CardTitle className="text-2xl pt-2">{roomData.title}</CardTitle>
             <p className="text-sm text-muted-foreground">
               Created by {roomData.ownerName}
             </p>
           </CardHeader>
           <CardContent className="space-y-4 text-center">
             <div className="text-muted-foreground text-sm space-y-1">
               <p>You are about to start an interview.</p>
               <p>
                 There are{" "}
                 <span className="font-bold text-primary">
                   {roomData.questions?.length || 0}
                 </span>{" "}
                 questions to answer.
               </p>
               <p>Good luck!</p>
             </div>
             <Button
               className="w-full"
               size="lg"
               onClick={handleStartInterview}
             >
               Start Interview
             </Button>
           </CardContent>
         </Card>
       </div>
    )
  }

  if (isReviewing) {
    return (
       <div className="container mx-auto p-6 max-w-3xl">
         <Card className="w-full">
           <CardHeader className="text-center">
             <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
             <CardTitle className="text-2xl pt-2">
               Ready to Submit?
             </CardTitle>
             <p className="text-muted-foreground">
               You've answered all the questions. Review your answers below
               before submitting for AI evaluation.
             </p>
           </CardHeader>
           <CardContent className="space-y-6">
             <div>
               <h3 className="font-semibold mb-2">
                 Your Answers ({userAnswers.length}/{roomData.questions.length}):
               </h3>
               <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-md">
                 {userAnswers.map((ans, index) => (
                   <div key={index} className="border bg-background rounded p-3 text-sm">
                     <p className="font-semibold text-primary">
                       Q: {ans.questionText}
                     </p>
                     <p className="text-muted-foreground mt-1">A: {ans.content}</p>
                   </div>
                 ))}
               </div>
             </div>
             <div className="flex flex-col sm:flex-row gap-4">
               <Button
                 onClick={handleSubmitAllAnswers}
                 disabled={submitting}
                 className="flex-1"
                 size="lg"
               >
                 {submitting ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                     Submitting...
                   </>
                 ) : (
                   "Submit for AI Evaluation"
                 )}
               </Button>
               <Button
                 variant="outline"
                 onClick={() => setIsReviewing(false)}
                 disabled={submitting}
               >
                 Go Back & Edit
               </Button>
             </div>
           </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-muted-foreground">
            {roomData.title}
          </h1>
          <Badge variant="secondary">
            Question {currentQuestionIndex + 1} of {roomData.questions.length}
          </Badge>
        </div>
        <Progress
          value={
            ((currentQuestionIndex + 1) / roomData.questions.length) * 100
          }
          className="h-3"
        />
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader className="pb-4 flex flex-row justify-between items-start">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <Badge variant="outline" className="capitalize">
              {currentQuestion.difficulty}
            </Badge>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-xl md:text-2xl font-medium leading-relaxed"
              >
                {currentQuestion.questionText}
              </motion.p>
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your detailed answer here..."
            className="w-full min-h-[200px] rounded-md border bg-transparent p-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {answer.trim().length} characters
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleNextQuestion}>
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