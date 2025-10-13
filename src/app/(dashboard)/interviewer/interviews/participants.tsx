"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { createBrowserClient } from "@supabase/ssr"
import { BarChart3, User, MessageSquare, Clock, Award, ChevronLeft, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PiSealQuestionFill } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";

interface Participant {
  id: string
  name: string
  score: number | null
}

interface Answer {
  questionId: number
  questionText: string
  content: string
  score: number | null
  feedback: string | null
  difficulty: string | null
}

interface InterviewAttempt {
  id: string
  candidate_id: string
  room_code: string
  answers: Answer[]
  overall_summary: string
  overall_score: number
  created_at: string
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  roomCode: string
}

export function ParticipantMetricsModal({ open, setOpen, roomCode }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const getScoreColor = (score: number) =>
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"
  const getScoreVariant = (score: number) =>
    score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoadingParticipants(true)
      try {
        const { data, error } = await supabase
          .from("interview_attempts")
          .select("candidate_id, overall_score, users(name)")
          .eq("room_code", roomCode)
          .order("created_at", { ascending: false })

        if (error) throw error

        const unique = new Map()
        data?.forEach((row: any) => {
          if (!unique.has(row.candidate_id)) {
            unique.set(row.candidate_id, {
              id: row.candidate_id,
              name: row.users?.name || "Unknown",
              score: row.overall_score,
            })
          }
        })

        setParticipants(Array.from(unique.values()))
      } catch (err) {
        console.error("Error fetching participants:", err)
      } finally {
        setLoadingParticipants(false)
      }
    }

    if (roomCode) fetchParticipants()
  }, [roomCode])

  useEffect(() => {
    if (selectedParticipant) fetchParticipantAttempt(selectedParticipant.id)
  }, [selectedParticipant])

  const fetchParticipantAttempt = async (participantId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("interview_attempts")
        .select("*")
        .eq("candidate_id", participantId)
        .eq("room_code", roomCode)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setAttempt(data as InterviewAttempt)
    } catch (err) {
      console.error("Error fetching interview attempt:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantClick = (p: Participant) => setSelectedParticipant(p)
  const handleBack = () => {
    setSelectedParticipant(null)
    setAttempt(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-scroll flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <BarChart3 className="w-5 h-5 text-primary" />
            {selectedParticipant
              ? `${selectedParticipant.name}'s Interview Report`
              : "Interview Participants"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6">
            {!selectedParticipant ? (
              <div className="space-y-3">
                {loadingParticipants ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="border-border/60">
                        <CardContent className="flex justify-between items-center p-4">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-20 rounded-md" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : participants.length === 0 ? (
                  <Card className="bg-muted/40 border-dashed border-2">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No participants found</p>
                      <p className="text-sm">No one has attempted this interview yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  participants.map((p) => (
                    <Card
                      key={p.id}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:bg-muted/50"
                      onClick={() => handleParticipantClick(p)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">Candidate</p>
                          </div>
                        </div>
                        {p.score !== null ? (
                          <Badge
                            variant={getScoreVariant(p.score)}
                            className="px-3 py-1 text-sm font-semibold"
                          >
                            {p.score}/100
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not Graded
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Participants
                </Button>

                <Card className="bg-muted/30">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedParticipant.name}</h2>
                        <p className="text-sm text-muted-foreground">Candidate Report</p>
                      </div>
                    </div>
                    {attempt?.overall_score && (
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(attempt.overall_score)}`}>
                          {attempt.overall_score}
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <MessageSquare className="w-5 h-5 text-primary" /> AI Evaluated Answers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loading ? (
                      <>
                        {[...Array(2)].map((_, i) => (
                          <Card key={i} className="p-4 bg-muted/40 space-y-4">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-5 w-3/4" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                          </Card>
                        ))}
                      </>
                    ) : !attempt?.answers?.length ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No answers were submitted for evaluation.
                      </div>
                    ) : (
                      attempt.answers.map((ans, index) => (
                        <Card key={index} className="bg-transparent shadow-none border-border/40">
                          <CardContent className="p-4 space-y-4">
                            <div>
                                <div className="flex items-center">
                                <PiSealQuestionFill className="text-red-700 mr-2" />
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                Question {index + 1}
                              </h4>
                              </div>
                              <p className="font-semibold">{ans.questionText}</p>
                            </div>
                            <div>
                                <div className="flex items-center">
                                <FaRegUser className="text-blue-700 mr-2" />
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                Candidate’s Answer
                              </h4>
                              </div>
                              <p className="text-sm bg-muted/50 rounded-md p-3 leading-relaxed">
                                {ans.content}
                              </p>
                            </div>
                            {ans.score !== null && (
                              <div className="space-y-3 pt-2">
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-teal-500" />
                                    AI Evaluation
                                  </h4>
                                  <Badge variant={getScoreVariant(ans.score)}>
                                    Score: {ans.score}/100
                                  </Badge>
                                </div>
                                {ans.feedback && (
                                  <div className="bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-500/30 rounded-lg p-3">
                                    <p className="text-sm text-teal-900 dark:text-teal-100 leading-relaxed">
                                      {ans.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>

                {attempt?.overall_summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Award className="w-5 h-5 text-primary" /> AI Overall Summary
                      </CardTitle>
                      <CardDescription>
                        A consolidated evaluation summary of the candidate's performance.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {attempt.overall_summary}
                      </p>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Completed on{" "}
                        {new Date(attempt.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-background sticky bottom-0">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-24">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
