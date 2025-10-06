"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Download, Brain, MessageSquare } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomCode: string
  candidateId: string
}

interface Answer {
  id: string
  question_id: string | null
  candidate_id: string | null
  content: string | null
  ai_score: number | null
  ai_feedback: string | null
  question_index: number | null
}

interface RoomQuestion {
  id: string
  question: string
  correct_answer?: string | null
}

interface InterviewSummary {
  final_score: number | null
  created_at: string
}

export function ReportModal({ open, onOpenChange, roomCode, candidateId }: Props) {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<RoomQuestion[]>([])
  const [summary, setSummary] = useState<InterviewSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  useEffect(() => {
    if (!open) return

    const fetchReport = async () => {
      setLoading(true)

      const [answersRes, roomRes, summaryRes] = await Promise.all([
        supabase.from("answers").select("*").eq("candidate_id", candidateId),
        supabase.from("rooms").select("data").eq("code", roomCode).single(),
        supabase
          .from("interview_summaries")
          .select("final_score, created_at")
          .eq("room_code", roomCode)
          .eq("candidate_id", candidateId)
          .single(),
      ])

      const { data: ansData } = answersRes
      const { data: roomData } = roomRes
      const { data: summaryData } = summaryRes

      if (ansData) {
        const sorted = ansData.sort((a, b) => (a.question_index ?? 0) - (b.question_index ?? 0))
        setAnswers(sorted)
      }

      if (roomData && roomData.data && Array.isArray(roomData.data.questions)) {
        const formattedQuestions: RoomQuestion[] = roomData.data.questions.map((q: any, index: number) => ({
          id: index.toString(), 
          question: q.question.question,
          correct_answer: q.question.answer,
        }))
        setQuestions(formattedQuestions)
      }

      if (summaryData) setSummary(summaryData)

      setLoading(false)
    }

    fetchReport()
  }, [open, roomCode, candidateId, supabase])

  const handleDownload = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Interview Report", 14, 20)
    doc.setFontSize(12)
    if (summary) {
      doc.text(`Final Score: ${summary.final_score ?? "-"}%`, 14, 30)
      doc.text(`Date: ${new Date(summary.created_at).toLocaleDateString()}`, 14, 37)
    }

    const tableRows = answers.map((a) => {
      const q = questions.find((q) => parseInt(q.id) === a.question_index)
      return [
        (a.question_index ?? 0) + 1,
        q?.question ?? "Unknown question",
        a.content ?? "—",
        q?.correct_answer ?? "—",
        a.ai_score?.toString() ?? "—",
        a.ai_feedback ?? "—",
      ]
    })

    autoTable(doc, {
      head: [["#", "Question", "Your Answer", "Correct Answer", "Score", "AI Feedback"]],
      body: tableRows,
      startY: 90,
      styles: { cellWidth: "wrap", fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] },
    })

    doc.save(`interview-report-${roomCode}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Interview Report
            <Button size="sm" onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center py-6 text-muted-foreground">Loading report...</p>
        ) : (
          <div className="space-y-6">
            {summary && (
              <Card>
                <CardHeader>
                    <strong>Final Score:</strong>
                </CardHeader>
                <CardContent>
                  {summary.final_score ?? "-"}%
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {answers.map((a, idx) => {
                const q = questions.find((q) => parseInt(q.id) === a.question_index)
                return (
                  <Card key={a.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex gap-2 items-center">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Question {(a.question_index ?? 0) + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>
                        <strong>Question:</strong> {q?.question ?? "Unknown question"}
                      </p>
                      <p>
                        <strong>Your Answer:</strong>{" "}
                        <span className="text-muted-foreground">{a.content ?? "—"}</span>
                      </p>
                      <p>
                        <strong>Correct Answer:</strong>{" "}
                        <span className="text-green-600">{q?.correct_answer ?? "—"}</span>
                      </p>
                      <p>
                        <strong>AI Score:</strong>{" "}
                        <span className="text-blue-600">{a.ai_score ?? 0}%</span>
                      </p>
                      <p>
                        <strong>AI Feedback:</strong>{" "}
                        <span className="text-muted-foreground">{a.ai_feedback ?? "No feedback"}</span>
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
