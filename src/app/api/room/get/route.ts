import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(req: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
