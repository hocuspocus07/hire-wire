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
  Building2,
  Briefcase,
  Phone,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export default function InterviewerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState<{ label: string; value: string; icon: any }[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Fetch authenticated user and profile in one go
  useEffect(() => {
    const supabase = getSupabaseBrowser()
    const fetchUserAndProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase.from("users").select("*").eq("id", user.id).single()
        setUserProfile(profileData)
      }
      setLoading(false)
    }
    fetchUserAndProfile()
  }, [])

  // Combined stats and recent activity fetching
  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseBrowser()
    const fetchDashboardData = async () => {
      const { data: rooms } = await supabase.from("rooms").select("code").eq("created_by", user.id)
      const roomCodes = rooms?.map((r: any) => r.code) || []

      if (roomCodes.length === 0) {
        setStats([
          { label: "Total Participants", value: "0", icon: Users },
          { label: "Interviews Today", value: "0", icon: CalendarDays },
          { label: "Avg Score", value: "N/A", icon: BarChart3 },
        ])
        setRecentActivity([])
        return
      }

      const { data: attempts } = await supabase
        .from("interview_attempts")
        .select("id, overall_score, created_at, users(name, avatar_url)")
        .in("room_code", roomCodes)
        .order("created_at", { ascending: false })

      const completed = attempts?.filter((a: any) => a.overall_score !== null) || []

      // Stats
      const totalParticipants = completed.length
      const today = new Date().setHours(0, 0, 0, 0)
      const interviewsToday = completed.filter((s: any) => new Date(s.created_at).getTime() >= today).length
      const scores = completed.map((s: any) => s.overall_score)
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: any, b: any) => a + b, 0) / scores.length) : 0

      setStats([
        { label: "Total Participants", value: totalParticipants.toString(), icon: Users },
        { label: "Interviews Today", value: interviewsToday.toString(), icon: CalendarDays },
        { label: "Avg Score", value: scores.length > 0 ? `${avgScore}%` : "N/A", icon: BarChart3 },
      ])

      // Recent Activity
      setRecentActivity(
        attempts?.slice(0, 5).map((s: any) => ({
          id: s.id,
          name: s.users?.name || "Anonymous",
          avatar: s.users?.avatar_url,
          score: s.overall_score,
          time: new Date(s.created_at).toLocaleString(),
        })) || []
      )
    }
    fetchDashboardData()
  }, [user])


  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full rounded-lg lg:col-span-1" />
            <div className="lg:col-span-2 space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Skeleton className="h-28 w-full rounded-lg" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                </div>
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Please log in to access your dashboard.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    )
  }

  const combinedUser = { ...user, ...userProfile }
  const name = combinedUser.name || combinedUser.email?.split("@")[0]
  const avatar = combinedUser.avatar_url
  const email = combinedUser.email

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
             <Button asChild>
              <Link href="/interviewer/interviews/new">
                <Video className="w-4 h-4 mr-2" /> New Interview
              </Link>
            </Button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                 <Avatar className="w-24 h-24 border mb-4">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="text-2xl">{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{name}</h2>
                  <p className="text-sm text-muted-foreground">{email}</p>
                   {userProfile?.bio && (
                    <p className="text-sm text-foreground/80 mt-3 max-w-xs">{userProfile.bio}</p>
                  )}
              </CardContent>
              <Separator />
              <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
                  {userProfile?.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span>Works at <span className="font-semibold text-foreground">{userProfile.company}</span></span>
                    </div>
                  )}
                  {userProfile?.position && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      <span>{userProfile.position}</span>
                    </div>
                  )}
                   {userProfile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                   <div className="flex items-center justify-center gap-4 pt-2">
                      {userProfile?.socials?.linkedin && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={userProfile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
                          </TooltipTrigger>
                          <TooltipContent><p>LinkedIn</p></TooltipContent>
                        </Tooltip>
                      )}
                      {userProfile?.socials?.github && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <a href={userProfile.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                          </TooltipTrigger>
                          <TooltipContent><p>GitHub</p></TooltipContent>
                        </Tooltip>
                      )}
                      {userProfile?.socials?.twitter && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={userProfile.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                          </TooltipTrigger>
                          <TooltipContent><p>Twitter</p></TooltipContent>
                        </Tooltip>
                      )}
                  </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" onClick={() => setEditOpen(true)} className="w-full">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Stats and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map(({ label, value, icon: Icon }) => (
                <Card key={label} className="transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The latest interview attempts from all your rooms.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">No recent interviews yet.</p>
                    </div>
                  ) : (
                    recentActivity.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={item.avatar} />
                            <AvatarFallback>{item.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.time}</div>
                          </div>
                        </div>
                        {item.score !== null ? (
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                            <CheckCircle className="w-4 h-4" /> {item.score}%
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                            <Clock className="w-4 h-4" /> Pending
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ProfileEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={combinedUser}
          onProfileUpdate={(updatedProfile) => setUserProfile((prev:any) => ({ ...prev, ...updatedProfile }))}
          type="interviewer"
        />
      </div>
    </TooltipProvider>
  )
}