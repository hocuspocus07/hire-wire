"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { motion } from "framer-motion"
import { Star, Award, Timer, Edit, Briefcase, Building2, User, Phone, Github, Linkedin, Twitter } from "lucide-react"
import { ReportModal } from "@/components/report-modal"
import { ProfileHeader } from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import JoinInterviewModal from "@/components/join-interview"
import { Badge } from "@/components/ui/badge"

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
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState<InterviewSummary[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewSummary | null>(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

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

      // Fetch profile data
      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", loggedUser.id)
        .single()
      setProfile(userProfile)

      // Fetch interviews
      const { data, error } = await supabase
        .from("interview_attempts")
        .select("id, candidate_id, room_code, overall_score, overall_feedback, created_at")
        .eq("candidate_id", loggedUser.id)
        .order("created_at", { ascending: false })

      if (error) console.error("Error fetching interviews:", error)

      const mappedSummaries: InterviewSummary[] = (data || []).map((d: any) => ({
        id: d.id,
        candidate_id: d.candidate_id,
        participant_name: userProfile?.name ?? loggedUser.email ?? "Interview",
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
      <div className="flex">
      <ProfileHeader
        name={profile?.name || user.email?.split("@")[0] || "User"}
        role="Candidate"
        email={profile?.email || user.email}
        imageUrl={profile?.avatar_url}
        meta={[
          { label: "Total Interviews", value: String(summaries.length) },
          { label: "Average Score", value: avg ? `${avg}%` : "-" },
          { label: "Best Score", value: best ? `${best}%` : "-" },
          { label: "Completed", value: String(completed.length) },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button onClick={() => setIsJoinOpen(true)}>Join Interview</Button>
            <JoinInterviewModal open={isJoinOpen} setOpen={setIsJoinOpen} />
          </>
        }
      />

      {/* Profile Details */}
      <Card className="w-full ml-2">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {profile?.bio && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>{profile.bio}</p>
            </div>
          )}
          {profile?.company && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p>{profile.company}</p>
            </div>
          )}
          {profile?.position && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <p>{profile.position}</p>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p>{profile.phone}</p>
            </div>
          )}
          {profile?.skills && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-muted-foreground">Skills:</span>
              {Array.isArray(profile.skills)
                ? profile.skills.map((s: string) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))
                : profile.skills.split(",").map((s: string) => (
                    <Badge key={s.trim()} variant="secondary">
                      {s.trim()}
                    </Badge>
                  ))}
            </div>
          )}

          {profile?.socials && (
            <div className="flex items-center gap-4 flex-wrap pt-2">
              {profile.socials.github && (
                <Link
                  href={profile.socials.github}
                  target="_blank"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Github className="h-4 w-4" /> GitHub
                </Link>
              )}
              {profile.socials.linkedin && (
                <Link
                  href={profile.socials.linkedin}
                  target="_blank"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Link>
              )}
              {profile.socials.twitter && (
                <Link
                  href={profile.socials.twitter}
                  target="_blank"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Twitter className="h-4 w-4" /> Twitter
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
</div>
      {/* Completed Interviews */}
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
        user={{ ...user, ...profile }}
        onProfileUpdate={setProfile}
        type="candidate"
      />
    </div>
  )
}

export default IntervieweeDashboard
