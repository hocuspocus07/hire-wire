"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ForgotPasswordModal() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      toast.warning("Please enter your email.")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseBrowser()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error(error)
        toast.error("Something went wrong. Try again.")
      } else {
        toast.success("Password reset link sent! Check your email.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we’ll send you a password reset link.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleResetPassword} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
