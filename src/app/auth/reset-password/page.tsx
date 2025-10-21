"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    const verifySession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setValidSession(true)
      } else {
        setMessage("Invalid or expired password reset link.")
      }
    }
    verifySession()
  }, [supabase])

  const handlePasswordReset = async () => {
    if (!password || !confirmPassword) {
      setMessage("Please fill in both fields.")
      return
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    setStatus("loading")
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error(error)
      setMessage("Something went wrong. Try again.")
      setStatus("error")
    } else {
      setStatus("success")
      setMessage("Password updated successfully! Redirecting...")
      setTimeout(() => router.push("/login"), 1500)
    }
  }

  if (!validSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md shadow-md border border-border">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {message || "Verifying your reset link..."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-md border border-border">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold">
            Set New Password
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === "loading"}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={status === "loading"}
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center ${
                status === "error"
                  ? "text-destructive"
                  : status === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            >
              {message}
            </p>
          )}

          <Button
            onClick={handlePasswordReset}
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
