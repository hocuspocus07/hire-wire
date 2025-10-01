"use client"

import { ProfileHeader } from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, CalendarDays, BarChart3, ListChecks } from "lucide-react"
import { motion } from "framer-motion"

const interviewer = {
  name: "Alex Thompson",
  role: "Interviewer • Engineering",
  email: "alex@company.com",
  imageUrl: "/interviewer-avatar.jpg",
  meta: [
    { label: "Interviews Today", value: "3" },
    { label: "Total Candidates", value: "47" },
    { label: "Pending Reviews", value: "2" },
    { label: "Avg Score", value: "72%" },
  ],
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

export default function InterviewerDashboard() {
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
    </div>
  )
}
