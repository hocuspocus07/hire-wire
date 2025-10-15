"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  CalendarDays,
  BarChart3,
  Edit,
  Video,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { UserResponse } from "@supabase/supabase-js"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function InterviewerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState<{ label: string; value: string; icon: any }[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Fetch authenticated user
  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(({ data }: UserResponse) => {
      setUser(data?.user ?? null)
      setLoading(false)
    })
  }, [])

  // Fetch extra user info from users table
  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseBrowser()

    const fetchUserProfile = async () => {
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      setUserProfile(data)
    }

    fetchUserProfile()
  }, [user])

  // Interview stats (kept from old version)
  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseBrowser()
    const fetchStats = async () => {
      const { data: rooms } = await supabase.from("rooms").select("code").eq("created_by", user.id)
      const roomCodes = rooms?.map((r: any) => r.code) || []
      if (roomCodes.length === 0) {
        setStats([
          { label: "Total Participants", value: "0", icon: Users },
          { label: "Interviews Today", value: "0", icon: CalendarDays },
          { label: "Avg Score", value: "0%", icon: BarChart3 },
        ])
        return
      }

      const { data: summaries } = await supabase
        .from("interview_summaries")
        .select("final_score, created_at")
        .in("room_code", roomCodes)
        .not("final_score", "is", null)

      const totalParticipants = summaries?.length || 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const interviewsToday = summaries?.filter((s: any) => new Date(s.created_at) >= today).length || 0
      const scores = summaries?.map((s: any) => s.final_score ?? 0) || []
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: any, b: any) => a + b, 0) / scores.length) : 0

      setStats([
        { label: "Total Participants", value: totalParticipants.toString(), icon: Users },
        { label: "Interviews Today", value: interviewsToday.toString(), icon: CalendarDays },
        { label: "Avg Score", value: `${avgScore}%`, icon: BarChart3 },
      ])
    }
    fetchStats()
  }, [user])

  // Recent interviews
  useEffect(() => {
    if (!user) return
    const fetchRecentActivity = async () => {
      const supabase = getSupabaseBrowser()
      const { data: rooms } = await supabase.from("rooms").select("code").eq("created_by", user.id)
      const roomCodes = rooms?.map((r: any) => r.code) || []
      if (roomCodes.length === 0) return
      const { data } = await supabase
        .from("interview_summaries")
        .select("id, participant_name, final_score, created_at")
        .in("room_code", roomCodes)
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentActivity(
        data?.map((s: any) => ({
          id: s.id,
          name: s.participant_name,
          score: s.final_score,
          time: new Date(s.created_at).toLocaleString(),
        })) || []
      )
    }
    fetchRecentActivity()
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Please log in to access your dashboard.</p>
        <Button asChild><Link href="/auth/login">Log In</Link></Button>
      </div>
    )
  }

  const name = userProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0]
  const avatar = userProfile?.avatar_url || user?.user_metadata?.avatar_url
  const email = userProfile?.email || user?.email

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-background to-background border-none shadow-sm">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-6 px-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatar} />
              <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-xl font-semibold">{name}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>

              {/* User Details */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                {userProfile?.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{userProfile.company}</span>
                  </div>
                )}
                {userProfile?.position && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{userProfile.position}</span>
                  </div>
                )}
                {userProfile?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                {userProfile?.socials?.linkedin && (
                  <a
                    href={userProfile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {userProfile?.socials?.github && (
                  <a
                    href={userProfile.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {userProfile?.socials?.twitter && (
                  <a
                    href={userProfile.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>

              {/* Bio */}
              {userProfile?.bio && (
                <p className="text-sm mt-3 text-foreground/80 max-w-md">{userProfile.bio}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button asChild>
              <Link href="/interviewer/interviews/new">
                <Video className="w-4 h-4 mr-1" /> New Interview
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="transition hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent interviews yet.</p>
            ) : (
              recentActivity.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.score !== null ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" /> {item.score}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        <Clock className="w-4 h-4" /> Pending
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
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
