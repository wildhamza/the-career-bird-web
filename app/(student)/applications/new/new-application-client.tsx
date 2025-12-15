"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2Icon, UploadIcon, AlertCircleIcon } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { submitApplication } from "./actions"

interface NewApplicationClientProps {
  grant: any
  application: any
  existingTryout: any
  grantId: string
}

export function NewApplicationClient({ grant, application, existingTryout, grantId }: NewApplicationClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    proposalFile: existingTryout?.proposal_url ? ({} as File) : null,
    videoFile: existingTryout?.video_url ? ({} as File) : null,
    portfolioFile: existingTryout?.portfolio_url ? ({} as File) : null,
  })

  const handleFileChange = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file })
  }

  const handleSubmit = async () => {
    if (!grantId || !formData.proposalFile || !formData.videoFile) {
      return
    }

    setLoading(true)
    try {
      // Call server action to submit application
      const result = await submitApplication(grantId, {
        proposalFileName: formData.proposalFile.name,
        proposalFileSize: formData.proposalFile.size,
        videoFileName: formData.videoFile.name,
        videoFileSize: formData.videoFile.size,
        portfolioFileName: formData.portfolioFile?.name,
        portfolioFileSize: formData.portfolioFile?.size,
      })

      // Redirect to success page with application ID
      router.push(`/applications/success?applicationId=${result.applicationId}`)
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("Failed to submit application. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const daysUntilDeadline = grant.deadline
    ? Math.ceil((new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/applications" className="hover:text-foreground">
              Applications
            </Link>
            <span>/</span>
            <Link href={`/scholarships/${grantId}`} className="hover:text-foreground truncate max-w-[150px] sm:max-w-none">
              {grant.title}
            </Link>
            <span>/</span>
            <span className="text-foreground">Application</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <FadeIn>
            <div className="mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Application Submission
                </h1>
                {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                  <Badge className={`${daysUntilDeadline <= 7 ? "bg-orange-600" : "bg-blue-600"} text-white`}>
                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                    Due in {daysUntilDeadline} day{daysUntilDeadline !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <p className="text-base sm:text-lg text-muted-foreground">
                Showcase your potential by submitting the required materials for review.
              </p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Project Proposal */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Project Proposal</h3>
                      <p className="text-sm text-muted-foreground">Upload your research proposal in PDF format.</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      REQUIRED
                    </Badge>
                  </div>

                  {formData.proposalFile ? (
                    <div className="flex items-center gap-3 p-4 border-2 rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
                      <div className="h-10 w-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {formData.proposalFile.name || "proposal.pdf"}
                        </p>
                        {formData.proposalFile.size && (
                          <p className="text-xs text-muted-foreground">
                            {(formData.proposalFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange("proposalFile", null)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange("proposalFile", e.target.files?.[0] || null)}
                      />
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 mb-3">
                          <UploadIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF only (max. 10MB)</p>
                      </div>
                    </label>
                  )}
                </CardContent>
              </Card>

              {/* Introductory Video */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Introductory Video</h3>
                      <p className="text-sm text-muted-foreground">
                        A 2-minute video introducing yourself and your research interests.
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      REQUIRED
                    </Badge>
                  </div>

                  {formData.videoFile ? (
                    <div className="flex items-center gap-3 p-4 border-2 rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
                      <div className="h-10 w-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{formData.videoFile.name || "video.mp4"}</p>
                        {formData.videoFile.size && (
                          <p className="text-xs text-muted-foreground">
                            {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange("videoFile", null)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileChange("videoFile", e.target.files?.[0] || null)}
                      />
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 mb-3">
                          <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">MP4, MOV (max. 50MB)</p>
                      </div>
                    </label>
                  )}
                </CardContent>
              </Card>

              {/* Code Sample or Portfolio */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Code Sample or Portfolio</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a ZIP file containing relevant work samples.
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                      OPTIONAL
                    </Badge>
                  </div>

                  {formData.portfolioFile ? (
                    <div className="flex items-center gap-3 p-4 border-2 rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
                      <div className="h-10 w-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{formData.portfolioFile.name}</p>
                        {formData.portfolioFile.size && (
                          <p className="text-xs text-muted-foreground">
                            {(formData.portfolioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange("portfolioFile", null)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept=".zip,.rar"
                        className="hidden"
                        onChange={(e) => handleFileChange("portfolioFile", e.target.files?.[0] || null)}
                      />
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950 mb-3">
                          <UploadIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">ZIP, RAR (max. 50MB)</p>
                      </div>
                    </label>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6">
                <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto border-2" size="lg">
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.proposalFile || !formData.videoFile}
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg text-sm border-2">
                <svg
                  className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-muted-foreground">Your submission is encrypted and secure.</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Application Status</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Application Started</p>
                        {application?.submitted_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600">Upload Materials</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Guidelines */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Submission Guidelines
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        <strong>Language:</strong> All documents must be submitted in English unless specified otherwise.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        <strong>File Size:</strong> Maximum file size is 10MB per upload.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
