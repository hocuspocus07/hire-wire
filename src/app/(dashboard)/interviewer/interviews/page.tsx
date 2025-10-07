"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Trash, Users, Share2, Copy } from "lucide-react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { ParticipantMetricsModal } from "./participants"
import { toast } from "sonner"
import Link from "next/link"
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

const InterviewCardSkeleton = () => (
  <Card className="flex flex-col justify-between">
    <CardHeader>
      <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse"></div>
      <div className="h-5 w-1/2 bg-muted rounded-md animate-pulse mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="h-5 w-1/3 bg-muted rounded-md animate-pulse"></div>
    </CardContent>
    <CardFooter className="bg-muted/30 p-3 flex justify-between items-center">
      <div className="h-10 flex-1 mr-2 bg-muted rounded-md animate-pulse"></div>
      <div className="flex gap-2">
        <div className="h-10 w-10 bg-muted rounded-md animate-pulse"></div>
        <div className="h-10 w-10 bg-muted rounded-md animate-pulse"></div>
      </div>
    </CardFooter>
  </Card>
)

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[] | null
  >(null)
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true)
      try {
        const user = (await supabase.auth.getUser()).data.user
        if (!user) return

        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select("code, title")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        if (roomsError) throw roomsError

        if (rooms.length === 0) {
            setInterviews([]);
            return;
        }

        const roomCodes = rooms.map((r:any) => r.code)
        const { data: summaries, error: summariesError } = await supabase
          .from("interview_summaries")
          .select("room_code, participant_name, final_score")
          .in("room_code", roomCodes)

        if (summariesError) throw summariesError

        const interviewsData: Interview[] = rooms.map((room:any) => ({
          code: room.code,
          title: room.title,
          participants: summaries
            .filter((s:any) => s.room_code === room.code)
            .map((s:any) => ({
              id: s.participant_name,
              name: s.participant_name,
              score: s.final_score,
            })),
        }))

        setInterviews(interviewsData)
      } catch (err) {
        console.error(err)
        toast.error("Failed to fetch interviews.")
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this interview permanently? This action cannot be undone.")) return
    
    try {
      const { error } = await supabase.from("rooms").delete().eq("code", code)
      if (error) throw error
      setInterviews(interviews.filter((i) => i.code !== code))
      toast.success("Interview deleted successfully.")
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete interview.")
    }
  }

  const handleViewMetrics = (
    participants: Participant[],
    roomCode: string
  ) => {
    setSelectedParticipants(participants)
    setSelectedRoomCode(roomCode)
    setModalOpen(true)
  }

  const handleShare = async (code: string, title: string) => {
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/candidate/interviews/${code}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitation to Interview: ${title}`,
          text: `Please join the interview using this link.`,
          url: shareUrl,
        })
        toast.info("Interview link shared.")
      } catch (err) {
        console.error(err)
        toast.error("Could not share the link.")
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success("Interview link copied to clipboard!")
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Interview code copied to clipboard!")
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Your Interviews</h1>
          <Button variant={"outline"}>
            <Link href="/interviewer/interviews/new">Create new</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InterviewCardSkeleton />
            <InterviewCardSkeleton />
            <InterviewCardSkeleton />
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed border-border">
            <h2 className="text-xl font-semibold tracking-tight">
              No interviews created yet
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Your created interviews will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <Card
                key={interview.code}
                className="flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight">
                    {interview.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 pt-2">
                    <p className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {interview.code}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleCopyCode(interview.code)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Code</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {interview.participants.length} Participant
                      {interview.participants.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-3 flex justify-between items-center">
                  <Button
                    className="flex-1 mr-2"
                    onClick={() =>
                      handleViewMetrics(interview.participants, interview.code)
                    }
                  >
                    View Metrics
                  </Button>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleShare(interview.code, interview.title)
                          }
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share Invite Link</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(interview.code)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Interview</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {selectedRoomCode && (
          <ParticipantMetricsModal
            open={modalOpen}
            setOpen={setModalOpen}
            roomCode={selectedRoomCode}
          />
        )}
      </div>
    </TooltipProvider>
  )
}