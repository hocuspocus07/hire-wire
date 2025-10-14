"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

export function Hero() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<"candidate" | "interviewer" | null>(null)
  const [inviteCode, setInviteCode] = useState("")
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // If you store role in user_metadata or profile table
        const userRole =
          currentUser.user_metadata?.role ||
          (await supabase
            .from("users")
            .select("role")
            .eq("id", currentUser.id)
            .single()
            .then((res) => res.data?.role))
        setRole(userRole || null)
      }
    }

    fetchUser()
  }, [])

  const handlePrimaryAction = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (role === "interviewer") {
      router.push("/interviewer/create")
    } else if (role === "candidate") {
      if (!inviteCode.trim()) {
        toast.error("Please enter a valid room code.")
        return
      }
      router.push(`/candidate/interviews/${inviteCode.trim()}`)
    } else {
      toast.error("Unable to determine your role.")
    }
  }

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto max-w-6xl px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1 text-xs tracking-widest text-muted-foreground uppercase bg-muted/50 px-3 py-1 rounded-full border"
          >
            <Sparkles className="w-3 h-3" />
            HireWire • Smart Interviews
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-balance text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI interviews
            </span>{" "}
            with shareable rooms
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-pretty text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            Create a room as an Interviewer, share a link with candidates, and preview the verified Questions tab and live
            Scoreboard.
          </motion.p>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {role === "candidate" ? (
              <div className="flex w-full sm:w-auto items-center gap-2">
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full sm:w-80 h-12 text-base"
                  placeholder="Enter room code"
                  aria-label="Room code"
                />
                <Button
                  variant="secondary"
                  className="gap-2 h-12 px-6"
                  onClick={handlePrimaryAction}
                >
                  Join Room
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold"
                onClick={handlePrimaryAction}
              >
                {user ? "Create Interview Room" : "Get Started"}
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
