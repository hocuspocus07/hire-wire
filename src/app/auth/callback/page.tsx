"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getSupabaseBrowser } from "@/utils/supabase/browser-client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Finishing sign-in...")

  useEffect(() => {
    const finishAuth = async () => {
      try {
        const supabase = await getSupabaseBrowser()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session fetch error:", error)
          setStatus("Could not complete sign-in. Redirecting to error page...")
          setTimeout(() => router.push("/auth/auth-code-error"), 1500)
          return
        }

        if (!data.session) {
          setStatus("No active session found. Redirecting to login...")
          setTimeout(() => router.push("/login"), 1500)
          return
        }

        // Success
        setStatus("Sign-in successful! Redirecting...")
        setTimeout(() => router.push("/login"), 1000)
      } catch (err) {
        console.error("Unexpected error:", err)
        setStatus("Something went wrong. Redirecting...")
        setTimeout(() => router.push("/auth/auth-code-error"), 1500)
      }
    }

    finishAuth()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 rounded-2xl bg-white shadow-sm border text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-600" />
        <p className="mt-3 text-gray-700">{status}</p>
      </div>
    </div>
  )
}
