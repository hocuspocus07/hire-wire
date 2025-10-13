"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Download, MessageSquare } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomCode: string
  candidateId: string
}

interface EvaluatedAnswer {
  questionId: string
  questionText: string
  difficulty: string
  content: string
  score: number | null
  feedback: string | null
}

interface InterviewAttempt {
  id: string
  submitted_at: string
  answers: EvaluatedAnswer[]
  overall_score: number | null
  overall_feedback: string | null
}

interface RoomQuestion {
    id: string;
    questionText: string;
}

declare global {
    interface Window {
        jspdf: any;
    }
}

export function ReportModal({ open, onOpenChange, roomCode, candidateId }: Props) {
  const [attempts, setAttempts] = useState<InterviewAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<InterviewAttempt | null>(null);
  const [questions, setQuestions] = useState<RoomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
  useEffect(() => {
    if (typeof window !== "undefined" && window.jspdf && window.jspdf.jsPDF) {
        setPdfLibsLoaded(true);
    } else {
      console.warn("jsPDF library not found on window object. PDF export will be disabled. Please include the library using a <script> tag in your HTML.");
    }
  }, []);
  useEffect(() => {
    if (!open || !roomCode || !candidateId) {
        setAttempts([]);
        setSelectedAttempt(null);
        return;
    }

    const fetchReportData = async () => {
      setLoading(true);

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id, data")
        .eq("code", roomCode)
        .single();

      if (roomError || !room) {
        console.error("Error fetching room:", roomError);
        setLoading(false);
        return;
      }
      
      const roomId = room.id;
      
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("interview_attempts")
        .select("*")
        .eq("room_code", roomCode)
        .eq("candidate_id", candidateId)
        .order("submitted_at", { ascending: false }); 
        console.log(attemptsData);
      
      if (attemptsError) {
        console.error("Error fetching interview attempts:", attemptsError);
        setAttempts([]);
      } else {
        setAttempts(attemptsData as InterviewAttempt[]);
      }

      if (room.data && Array.isArray(room.data.questions)) {
        const formattedQs: RoomQuestion[] = room.data.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
        }));
        setQuestions(formattedQs);
      }

      setLoading(false);
    };

    fetchReportData();
  }, [open, roomCode, candidateId]);

  const handleDownload = () => {
    if (!selectedAttempt || !pdfLibsLoaded) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (typeof doc.autoTable !== 'function') {
        console.error("jsPDF.autoTable plugin not found. PDF generation failed.");
        return;
    }
    
    doc.setFontSize(16);
    doc.text("Interview Report", 14, 20);
    doc.setFontSize(12);
    
    doc.text(`Final Score: ${selectedAttempt.overall_score ?? "N/A"}%`, 14, 30);
    doc.text(`Date: ${new Date(selectedAttempt.submitted_at).toLocaleDateString()}`, 14, 37);
    
    const summaryLines = doc.splitTextToSize(selectedAttempt.overall_feedback || "No summary provided.", 180);
    doc.text("Overall Feedback:", 14, 47);
    doc.text(summaryLines, 14, 54);

    const tableRows = selectedAttempt.answers.map((ans, index) => {
      const q = questions.find((q) => q.id === ans.questionId);
      return [
        index + 1,
        ans.questionText,
        ans.content ?? "—",
        ans.score?.toString() ?? "—",
        ans.feedback ?? "—",
      ];
    });
    
    const summaryHeight = (summaryLines.length * 7) + 10; 

    (doc as any).autoTable({
      head: [["#", "Question", "Your Answer", "Score", "AI Feedback"]],
      body: tableRows,
      startY: 47 + summaryHeight,
      styles: { cellWidth: "wrap", fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save(`interview-report-${roomCode}-${candidateId.substring(0, 6)}.pdf`);
  };

  const handleBackToList = () => {
    setSelectedAttempt(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {selectedAttempt ? 'Interview Report' : 'Select an Interview Attempt'}
            {selectedAttempt && (
              <Button size="sm" onClick={handleDownload} disabled={loading || !pdfLibsLoaded} title={!pdfLibsLoaded ? "PDF libraries not loaded" : "Download PDF"}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center py-10 text-muted-foreground">Loading reports...</p>
        ) : !selectedAttempt ? (
          <div className="space-y-3 py-4">
             {attempts.length === 0 ? (
                 <p className="text-center text-muted-foreground">No interview attempts found for this candidate in this room.</p>
             ) : (
                attempts.map(attempt => (
                    <Card key={attempt.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setSelectedAttempt(attempt)}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Attempt on {new Date(attempt.submitted_at).toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Click to view details</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">{attempt.overall_score ?? "N/A"}%</p>
                                <p className="text-xs text-muted-foreground">Overall Score</p>
                            </div>
                        </CardContent>
                    </Card>
                ))
             )}
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <Button variant="outline" size="sm" onClick={handleBackToList}>
              &larr; Back to All Attempts
            </Button>
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Final Score:</strong> {selectedAttempt.overall_score ?? "Not scored"}%</p>
                <p><strong>Submitted On:</strong> {new Date(selectedAttempt.submitted_at).toLocaleString()}</p>
                <p><strong>Overall Feedback:</strong> <span className="text-muted-foreground">{selectedAttempt.overall_feedback}</span></p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detailed Answers</h3>
              {selectedAttempt.answers.map((answer, idx) => {
                const q = questions.find((q) => q.id === answer.questionId);
                return (
                  <Card key={answer.questionId || idx}>
                    <CardHeader>
                      <CardTitle className="text-base flex gap-2 items-center">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Question {idx + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Question:</strong> {answer.questionText}</p>
                      <p><strong>Your Answer:</strong> <span className="text-muted-foreground">{answer.content ?? "—"}</span></p>
                      <p><strong>AI Score:</strong> <span className="font-bold text-blue-600">{answer.score ?? "—"}%</span></p>
                      <p><strong>AI Feedback:</strong> <span className="text-muted-foreground">{answer.feedback ?? "—"}</span></p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}