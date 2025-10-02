"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { motion } from "framer-motion"
import { Star, Timer, Award, Edit } from "lucide-react"

import { ProfileHeader } from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"

const IntervieweeDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
      setLoading(false)
    })
  }, [])

  const mockInterviews = [
    {
      id: "room-123",
      domain: "Full-Stack Development",
      level: "Mid",
      status: "completed",
      score: 85,
      percentile: 92,
      date: "2024-01-15",
      duration: "45 mins",
    },
    {
      id: "room-124",
      domain: "Frontend Development",
      level: "Senior",
      status: "scheduled",
      score: null,
      percentile: null,
      date: "2024-01-18",
      duration: "60 mins",
    },
  ]
  const completed = mockInterviews.filter((i) => i.status === "completed")
  const upcoming = mockInterviews.filter((i) => i.status === "scheduled")
  const avg = completed.length ? Math.round(completed.reduce((a, c) => a + (c.score || 0), 0) / completed.length) : null
  const best = completed.length ? Math.max(...completed.map((i) => i.percentile || 0)) : null

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Profile skeleton */}
        <div className="p-4 md:p-6 border rounded-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </div>
        {/* Upcoming skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        {/* Recent skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {user ? (
        <ProfileHeader
          name={user.user_metadata?.name || user.email?.split("@")[0] || "User"}
          role={user.user_metadata?.role || "Candidate"}
          email={user.email}
          imageUrl={user.user_metadata?.avatar_url}
          meta={[
            { label: "Total Interviews", value: String(completed.length) },
            { label: "Average Score", value: avg ? `${avg}%` : "-" },
            { label: "Best Percentile", value: best ? `Top ${best}%` : "-" },
            { label: "Upcoming", value: String(upcoming.length) },
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
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Welcome</h2>
          <p className="text-muted-foreground">Please sign in to view your interview dashboard.</p>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      )}

      {/* Upcoming */}
      <Card className="mb-2">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">No upcoming interviews</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((i) => (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="font-medium">{i.domain}</div>
                    <div className="text-sm text-muted-foreground">
                      {i.date} • {i.duration} • {i.level}
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/interviewee/interviews/${i.id}`}>Join</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
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
                      <div className="font-medium">{i.domain}</div>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{i.level}</span>
                      <span className="rounded-md px-2 py-0.5 text-xs border">Completed</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-medium ml-1">{i.score}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Percentile</span>
                        <span className="font-medium ml-1">Top {i.percentile}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Date</span>
                        <span className="ml-1">{i.date}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/interviewee/interviews/${i.id}/report`}>View Report</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
