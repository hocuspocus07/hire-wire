import { UserProfileCard } from "@/components/user-profile"
import { createClient } from "@/utils/supabase/server"

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
  const supabase = await createClient()

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (!user) return <div>User not found.</div>

  return <UserProfileCard user={user} />
}
