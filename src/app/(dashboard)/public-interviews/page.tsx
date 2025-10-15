"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Users, CalendarDays, Copy, LogIn } from "lucide-react"
import { toast } from "sonner"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"

interface PublicInterview {
  code: string
  title: string
  participants: any[]
  created_at: string
}

const InterviewCardSkeleton = () => (
  <Card className="flex flex-col justify-between animate-pulse">
    <CardHeader>
      <div className="h-6 w-3/4 bg-muted rounded-md"></div>
      <div className="h-5 w-1/2 bg-muted rounded-md mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="h-5 w-1/3 bg-muted rounded-md"></div>
    </CardContent>
    <CardFooter className="bg-muted/30 p-3 flex justify-between items-center">
      <div className="h-10 flex-1 mr-2 bg-muted rounded-md"></div>
      <div className="flex gap-2">
        <div className="h-10 w-10 bg-muted rounded-md"></div>
      </div>
    </CardFooter>
  </Card>
)

export default function PublicInterviewsPage() {
  const [interviews, setInterviews] = useState<PublicInterview[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const fetchPublicInterviews = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("code, title, participants, created_at")
          .eq("public", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setInterviews(data || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to fetch public interviews.")
      } finally {
        setLoading(false)
      }
    }

    fetchPublicInterviews()
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Interview code copied!")
  }

  const handleJoinInterview = (code: string) => {
    window.location.href = `/candidate/interviews/${code}`
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Public Interviews</h1>
          <p className="text-muted-foreground text-sm">
            Join any public interview directly.
          </p>
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
              No public interviews available
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Check back later to join open sessions.
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
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {interview.participants?.length || 0} Participant
                        {interview.participants?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
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
                  </div>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(interview.created_at).toLocaleDateString()}
                </CardContent>

                <CardFooter className="bg-muted/30 p-3 flex justify-end">
                  <Button onClick={() => handleJoinInterview(interview.code)} className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Join
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
