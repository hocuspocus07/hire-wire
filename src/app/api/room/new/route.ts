import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()

  const { created_by, title, data, public: isPublic = true } = body

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", created_by)
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  if (!user || user.role !== "interviewer") {
    return NextResponse.json(
      { error: "Only interviewers can create rooms" },
      { status: 403 }
    )
  }

  const code = randomBytes(3).toString("hex")

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      title,
      created_by,
      code,
      data,
      public: isPublic
    })
    .select()
    .single()

  if (roomError) {
    return NextResponse.json({ error: roomError.message }, { status: 500 })
  }

  return NextResponse.json(room)
}
