"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { motion } from "framer-motion"
import { Star, Award, Timer, Edit } from "lucide-react"
import { ReportModal } from "@/components/report-modal"
import { ProfileHeader } from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"

interface InterviewSummary {
  id: string
  candidate_id: string | null
  participant_name: string | null
  room_code: string
  final_score: number | null
  created_at: string
  summary: string | null
}

const IntervieweeDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState<InterviewSummary[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewSummary | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    const fetchData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const loggedUser = userData?.user
      setUser(loggedUser)

      if (!loggedUser) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("interview_attempts")
        .select("id, candidate_id, room_code, overall_score, overall_feedback, created_at")
        .eq("candidate_id", loggedUser.id)
        .order("created_at", { ascending: false })
        console.log(data);

      if (error) {
        console.error("Error fetching interview attempts:", error)
        setLoading(false)
        return
      }

      const mappedSummaries: InterviewSummary[] = (data || []).map((d: any) => ({
        id: d.id,
        candidate_id: d.candidate_id,
        participant_name: loggedUser.user_metadata?.name ?? "Interview",
        room_code: d.room_code,
        final_score: d.overall_score,
        created_at: d.created_at,
        summary: d.overall_feedback,
      }))

      setSummaries(mappedSummaries)
      setLoading(false)
    }

    fetchData()
  }, [])

  const completed = summaries.filter((i) => i.final_score !== null)
  console.log(completed);
  const avg =
    completed.length > 0
      ? Math.round(
        completed.reduce((acc, curr) => acc + (curr.final_score ?? 0), 0) / completed.length
      )
      : null
  const best =
    completed.length > 0
      ? Math.max(...completed.map((i) => i.final_score ?? 0))
      : null

  const scores = completed.map((i) => i.final_score ?? 0)
  const calcPercentile = (score: number) => {
    if (scores.length === 0) return 0
    const lowerScores = scores.filter((s) => s < score).length
    return Math.round((lowerScores / scores.length) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        <Button asChild>
          <Link href="/auth/login">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProfileHeader
        name={user.user_metadata?.name || user.email?.split("@")[0] || "User"}
        role="Candidate"
        email={user.email}
        imageUrl={user.user_metadata?.avatar_url}
        meta={[
          { label: "Total Interviews", value: String(summaries.length) },
          { label: "Average Score", value: avg ? `${avg}%` : "-" },
          { label: "Best Score", value: best ? `${best}%` : "-" },
          { label: "Completed", value: String(completed.length) },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button asChild>
              <Link href="/interviewee/interviews/new">Schedule Interview</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Completed Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <p className="text-muted-foreground">No completed interviews yet</p>
          ) : (
            <div className="space-y-3">
              {completed.map((i) => (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="font-medium">{i.participant_name ?? "Interview"}</div>
                      <span className="rounded-md px-2 py-0.5 text-xs border">Completed</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-medium ml-1">{i.final_score ?? 0}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Percentile</span>
                        <span className="font-medium ml-1">
                          Top {calcPercentile(i.final_score ?? 0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Date</span>
                        <span className="ml-1">
                          {new Date(i.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInterview(i)
                      setReportOpen(true)
                    }}
                  >
                    View Report
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        roomCode={selectedInterview?.room_code ?? ""}
        candidateId={user.id}
      />

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        onProfileUpdate={setUser}
        type="candidate"
      />
    </div>
  )
}

export default IntervieweeDashboard
