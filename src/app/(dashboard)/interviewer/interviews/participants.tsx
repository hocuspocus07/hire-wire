"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { createBrowserClient } from "@supabase/ssr"
import { BarChart3, User, MessageSquare, Clock, Award } from "lucide-react"

interface Participant {
    id: string           // UUID (from users.id)
    name: string
    score: number | null
    role?: string
}

interface Answer {
    id: string
    question_id: string
    content: string
    ai_score: number | null
    ai_feedback: string | null
    submitted_at: string
    question_text?: string
}

interface InterviewSummary {
    id: string
    candidate_id: string
    final_score: number
    summary: string
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
    const [participantAnswers, setParticipantAnswers] = useState<Answer[]>([])
    const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null)
    const [loading, setLoading] = useState(false)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

    useEffect(() => {
        const fetchRoomParticipants = async () => {
            try {
                const { data, error } = await supabase
                    .from("room_participants")
                    .select("user_id, users(name, role)")
                    .eq("room_code", roomCode)
                    .order("joined_at", { ascending: true })

                if (error) throw error

                if (data) {
                    const mappedParticipants: Participant[] = data.map((p: any) => ({
                        id: p.user_id,
                        name: p.users?.name || "Unknown",
                        role: p.users?.role,
                        score: null 
                    }))
                    setParticipants(mappedParticipants)
                }
            } catch (err) {
                console.error("Error fetching room participants:", err)
            }
        }

        if (roomCode) fetchRoomParticipants()
    }, [roomCode])

    useEffect(() => {
        if (selectedParticipant && isUUID(selectedParticipant.id)) {
            fetchParticipantDetails(selectedParticipant.id)
        } else if (selectedParticipant) {
            console.error("Invalid UUID:", selectedParticipant.id)
        }
    }, [selectedParticipant])

    const fetchParticipantDetails = async (participantId: string) => {
        setLoading(true)
        try {
            const { data: answers, error: answersError } = await supabase
                .from("answers")
                .select("*")
                .eq("candidate_id", participantId)
                .order("submitted_at", { ascending: true })

            if (answersError) throw answersError

            const { data: roomData, error: roomError } = await supabase
                .from("rooms")
                .select("data")
                .eq("code", roomCode)
                .single()

            let answersWithQuestions: Answer[] = answers || []
            console.log(roomData);

            if (!roomError && roomData?.data?.questions) {
                answersWithQuestions = answers.map((answer, idx) => {
                    const questionText = roomData.data.questions[idx] || "Unknown Question"
                    return { ...answer, question_text: questionText }
                })
            }

            setParticipantAnswers(answersWithQuestions)

            // Fetch interview summary
            const { data: summary, error: summaryError } = await supabase
                .from("interview_summaries")
                .select("*")
                .eq("candidate_id", participantId)
                .eq("room_code", roomCode)
                .single()

            if (!summaryError && summary) {
                setInterviewSummary(summary)
                setParticipants(prev =>
                    prev.map(p => (p.id === participantId ? { ...p, score: summary.final_score } : p))
                )
            } else {
                setInterviewSummary(null)
            }
        } catch (error) {
            console.error("Error fetching participant details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleParticipantClick = (participant: Participant) => setSelectedParticipant(participant)
    const handleBack = () => {
        setSelectedParticipant(null)
        setParticipantAnswers([])
        setInterviewSummary(null)
    }

    const getScoreColor = (score: number) =>
        score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"
    const getScoreVariant = (score: number) =>
        score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {selectedParticipant ? `${selectedParticipant.name}'s Detailed Metrics` : "Participant Metrics"}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    {!selectedParticipant ? (
                        <div className="space-y-4">
                            {participants.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        No participants yet.
                                    </CardContent>
                                </Card>
                            ) : (
                                participants.map(participant => (
                                    <Card
                                        key={participant.id}
                                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                                        onClick={() => handleParticipantClick(participant)}
                                    >
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{participant.name}</h3>
                                                    {participant.role && <p className="text-sm text-muted-foreground">{participant.role}</p>}
                                                </div>
                                            </div>
                                            {participant.score !== null ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getScoreVariant(participant.score)}>{participant.score}/100</Badge>
                                                    <Award className={`w-4 h-4 ${getScoreColor(participant.score)}`} />
                                                </div>
                                            ) : (
                                                <Badge variant="outline">Not Graded</Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    ) : (
                        selectedParticipant && (
                            <div className="space-y-6">
                                <Button variant="ghost" onClick={handleBack} className="mb-2">
                                    ← Back to Participants
                                </Button>

                                {/* Participant Header */}
                                <Card>
                                    <CardContent className="p-6 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{selectedParticipant.name}</h2>
                                                {selectedParticipant.role && <p className="text-muted-foreground">{selectedParticipant.role}</p>}
                                            </div>
                                        </div>
                                        {interviewSummary?.final_score && (
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">{interviewSummary.final_score}/100</div>
                                                <div className="text-sm text-muted-foreground">Final Score</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Answers Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5" /> Question Answers ({participantAnswers.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {loading ? (
                                            <div className="text-center py-8 text-muted-foreground">Loading answers...</div>
                                        ) : participantAnswers.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">No answers submitted yet.</div>
                                        ) : (
                                            participantAnswers.map((answer, index) => (
                                                <div key={answer.id} className="space-y-4 border rounded-lg p-4">
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Question {index + 1}</h4>
                                                        <p className="text-base leading-relaxed">{answer.question_text || `Question ${answer.question_id}`}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Answer</h4>
                                                        <p className="text-sm leading-relaxed bg-muted/50 rounded p-3">{answer.content}</p>
                                                    </div>
                                                    {answer.ai_score !== null && (
                                                        <div className="space-y-3">
                                                            <Separator />
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-semibold text-sm">AI Evaluation</h4>
                                                                <Badge variant={getScoreVariant(answer.ai_score)}>Score: {answer.ai_score}/100</Badge>
                                                            </div>
                                                            {answer.ai_feedback && (
                                                                <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3">
                                                                    <p className="text-sm leading-relaxed">{answer.ai_feedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" /> Submitted on {new Date(answer.submitted_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                {/* AI Interview Summary (moved to the end) */}
                                {interviewSummary && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="w-5 h-5" /> AI Interview Summary
                                            </CardTitle>
                                            <CardDescription>Overall assessment generated by AI</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm leading-relaxed">{interviewSummary.summary}</p>
                                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                Completed on {new Date(interviewSummary.created_at).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )

                    )}
                </ScrollArea>

                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
