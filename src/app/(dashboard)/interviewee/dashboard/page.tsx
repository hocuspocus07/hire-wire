"use client"

import { ProfileHeader }from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, Timer, Award } from "lucide-react"

const user = {
  name: "Jordan Patel",
  role: "Candidate",
  email: "jordan.patel@example.com",
  imageUrl: "/candidate-avatar.jpg",
}

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

export default function IntervieweeDashboard() {
  const completed = mockInterviews.filter((i) => i.status === "completed")
  const upcoming = mockInterviews.filter((i) => i.status === "scheduled")

  const avg =
    completed.length > 0
      ? Math.round(completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length)
      : null

  const best = completed.length > 0 ? Math.max(...completed.map((i) => i.percentile || 0)) : null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProfileHeader
        name={user.name}
        role={user.role}
        email={user.email}
        imageUrl={user.imageUrl}
        meta={[
          { label: "Total Interviews", value: String(completed.length) },
          { label: "Average Score", value: avg ? `${avg}%` : "-" },
          { label: "Best Percentile", value: best ? `Top ${best}%` : "-" },
          { label: "Upcoming", value: String(upcoming.length) },
        ]}
        actions={
          <Button asChild>
            <Link href="/interviewee/interviews/new">Schedule Interview</Link>
          </Button>
        }
      />

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
                <div key={i.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">{i.domain}</div>
                    <div className="text-sm text-muted-foreground">
                      {i.date} • {i.duration} • {i.level}
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/interviewee/interviews/${i.id}`}>Join</Link>
                  </Button>
                </div>
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
                <div key={i.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
