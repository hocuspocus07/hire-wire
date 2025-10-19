"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Finishing sign-in...")

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code")
        if (!code) throw new Error("No code found in URL")

        const res = await fetch(`/auth/callback?code=${code}`)
        if (res.redirected) {
          window.location.href = res.url
          return
        }

        setStatus("Could not complete sign-in. Redirecting to error page...")
        router.push("/auth/auth-code-error")
      } catch (err) {
        console.error(err)
        setStatus("Something went wrong. Redirecting...")
        setTimeout(() => router.push("/auth/auth-code-error"), 1500)
      }
    }

    handleAuth()
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
