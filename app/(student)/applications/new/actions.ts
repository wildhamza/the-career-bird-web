"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function submitApplication(grantId: string, formData: {
  proposalFileName?: string
  proposalFileSize?: number
  videoFileName?: string
  videoFileSize?: number
  portfolioFileName?: string
  portfolioFileSize?: number
}) {
  const supabase = await getSupabaseServerClient()
  
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    // Create or get application
    const { data: existingApp } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .eq("grant_id", grantId)
      .maybeSingle()

    let appId = existingApp?.id

    if (!appId) {
      const { data: newApp, error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          grant_id: grantId,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      appId = newApp.id
    }

    // Create file URLs (in production, you'd upload to storage first)
    const proposalUrl = formData.proposalFileName 
      ? `proposals/${appId}/${formData.proposalFileName}` 
      : null
    const videoUrl = formData.videoFileName 
      ? `videos/${appId}/${formData.videoFileName}` 
      : null
    const portfolioUrl = formData.portfolioFileName 
      ? `portfolios/${appId}/${formData.portfolioFileName}` 
      : null

    // Create or update tryout submission
    const { error: tryoutError } = await supabase
      .from("tryout_submissions")
      .upsert({
        application_id: appId,
        user_id: user.id,
        proposal_url: proposalUrl,
        video_url: videoUrl,
        portfolio_url: portfolioUrl,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })

    if (tryoutError) throw tryoutError

    return { success: true, applicationId: appId }
  } catch (error) {
    console.error("Error submitting application:", error)
    throw error
  }
}
