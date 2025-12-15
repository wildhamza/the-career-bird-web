import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileBuilderForm } from "@/components/profile-builder-form"
import { StudentNav } from "@/components/layout/student-nav"

export default async function ProfileEditPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Fetch universities on server side to avoid client-side security errors
  const { data: universities, error: universitiesError } = await supabase
    .from("universities")
    .select("id, name, country, city")
    .order("name", { ascending: true })
    .limit(500)

  if (universitiesError) {
    console.error("Error fetching universities:", universitiesError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 dark:from-blue-950/10 dark:via-background dark:to-indigo-950/10">
      <StudentNav />
      <ProfileBuilderForm profile={profile} universities={universities || []} />
    </div>
  )
}
