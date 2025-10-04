"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash, Edit, Users } from "lucide-react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { ParticipantMetricsModal } from "./participants"

interface Participant {
  id: string
  name: string
  score: number | null
  role?: string
}

interface Interview {
  code: string       
  title: string
  participants: Participant[]
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[] | null>(null)
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null) // Store room code
  const [modalOpen, setModalOpen] = useState(false)

  const supabase = getSupabaseBrowser()

  const fetchInterviews = async () => {
    setLoading(true)
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return

      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("code, title")
        .eq("created_by", user.id)

      if (roomsError) throw roomsError

      const roomCodes = rooms.map((r: any) => r.code)
      const { data: summaries, error: summariesError } = await supabase
        .from("interview_summaries")
        .select("room_code, participant_name, final_score")
        .in("room_code", roomCodes)

      if (summariesError) throw summariesError

      const interviewsData: Interview[] = rooms.map((room: any) => ({
        code: room.code,
        title: room.title,
        participants: summaries
          .filter((s: any) => s.room_code === room.code)
          .map((s: any) => ({
            id: s.participant_name, 
            name: s.participant_name,
            score: s.final_score
          })),
      }))

      setInterviews(interviewsData)
    } catch (err) {
      console.error(err)
      alert("Failed to fetch interviews.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return
    try {
      const { error } = await supabase.from("rooms").delete().eq("code", code)
      if (error) throw error
      setInterviews(interviews.filter((i) => i.code !== code))
    } catch (err) {
      console.error(err)
      alert("Failed to delete interview.")
    }
  }

  const handleViewMetrics = (participants: Participant[], roomCode: string) => {
    setSelectedParticipants(participants)
    setSelectedRoomCode(roomCode) 
    setModalOpen(true)
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Your Interviews</h1>

      {loading ? (
        <p>Loading interviews...</p>
      ) : interviews.length === 0 ? (
        <p>No interviews created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((interview) => (
            <Card key={interview.code}>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>{interview.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">Code: {interview.code}</p>
                  <p className="text-sm text-muted-foreground">
                    Participants: {interview.participants.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewMetrics(interview.participants, interview.code)}
                  >
                    <Users className="w-4 h-4 mr-1" /> View Metrics
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(interview.code)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {selectedParticipants && selectedRoomCode && (
        <ParticipantMetricsModal
          open={modalOpen}
          setOpen={setModalOpen}
          roomCode={selectedRoomCode} 
        />
      )}
    </div>
  )
}