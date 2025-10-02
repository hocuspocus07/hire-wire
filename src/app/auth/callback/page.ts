import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect("/login?error=missing_code")
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect("/login?error=verification_failed")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single()

  let redirectUrl = "/interviewee/dashboard"
  if (profile?.role === "interviewer") {
    redirectUrl = "/interviewer/dashboard"
  }

  return NextResponse.redirect(redirectUrl)
}
