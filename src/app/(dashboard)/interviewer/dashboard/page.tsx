"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, CalendarDays, BarChart3, ListChecks, Edit } from "lucide-react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { UserResponse } from "@supabase/supabase-js"
import { ProfileHeader } from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"

export default function InterviewerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
  const supabase = getSupabaseBrowser()
  supabase.auth.getUser().then(({ data }: UserResponse) => {
    setUser(data?.user ?? null)
    setLoading(false)
  })
}, [])

  const interviewer = {
    name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Interviewer",
    role: "Interviewer • Engineering",
    email: user?.email,
    imageUrl: user?.user_metadata?.avatar_url,
    meta: [
      { label: "Interviews Today", value: "3" },
      { label: "Total Candidates", value: "47" },
      { label: "Pending Reviews", value: "2" },
      { label: "Avg Score", value: "72%" },
    ],
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to view the interviewer dashboard.</p>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Total Candidates", value: "47", icon: Users },
    { label: "Interviews Today", value: "3", icon: CalendarDays },
    { label: "Avg Score", value: "72%", icon: BarChart3 },
    { label: "Pending Reviews", value: "2", icon: ListChecks },
  ]

  const recentActivity = [
    { id: "1", candidateName: "John Doe", role: "Frontend", status: "completed", score: 88, time: "2h ago" },
    { id: "2", candidateName: "Jane Smith", role: "Full-Stack", status: "live", score: null, time: "Now" },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProfileHeader
        name={interviewer.name}
        role={interviewer.role}
        email={interviewer.email}
        imageUrl={interviewer.imageUrl}
        meta={interviewer.meta}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/interviewer/interviews">Manage Interviews</Link>
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit Profile
            </Button>
            <Button asChild>
              <Link href="/interviewer/interviews/new">Create Interview Room</Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{a.candidateName}</div>
                    <div className="text-xs text-muted-foreground">• {a.role}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{a.time}</div>
                </div>
                <div className="text-sm">
                  {a.status === "live" ? (
                    <span className="rounded-md border px-2 py-1">Live</span>
                  ) : (
                    <span className="rounded-md bg-secondary px-2 py-1">Completed</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        onProfileUpdate={setUser}
        type="interviewer"
      />
    </div>
  )
}
