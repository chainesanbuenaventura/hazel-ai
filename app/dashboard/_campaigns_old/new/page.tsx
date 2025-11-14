"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { createSupabaseClient } from "@/lib/supabase"

export default function NewCampaignPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle brief parameter from URL
  useEffect(() => {
    const brief = searchParams.get('brief')
    if (brief) {
      const decodedBrief = decodeURIComponent(brief)
      setJobDescription(decodedBrief) 
    }
  }, [searchParams])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Read file content if it's a text file
      if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".txt")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setJobDescription(content)
        }
        reader.readAsText(selectedFile)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobDescription.trim()) {
      toast.error("Please provide a job description")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createSupabaseClient()

      // Auto-generate campaign name from current date
      const campaignName = `Campaign ${new Date().toLocaleDateString()}`

      // Create campaign in database
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          name: campaignName,
          job_description: jobDescription,
          status: "processing",
        })
        .select()
        .single()

      if (campaignError) {
        throw campaignError
      }

      // Call webhook
      const webhookData = {
        campaignId: campaign.id,
        campaignName: campaignName,
        jobDescription: jobDescription,
        timestamp: new Date().toISOString(),
      }

      try {
        const webhookResponse = await fetch(
          "https://chainesanb9.app.n8n.cloud/webhook/5c1d8f0b-433f-4e8e-b82f-8effbe47c775",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(webhookData),
          },
        )

        let webhookResult = null
        if (webhookResponse.ok) {
          // Try to parse JSON response
          try {
            const responseText = await webhookResponse.text()
            if (responseText.trim()) {
              webhookResult = JSON.parse(responseText)
            } else {
              console.log("Empty webhook response, treating as success")
              webhookResult = { success: true, message: "Campaign processed successfully" }
            }
          } catch (parseError) {
            console.log("Webhook response is not valid JSON, treating as success")
            webhookResult = { success: true, message: "Campaign processed successfully" }
          }

          // Update campaign with webhook response
          await supabase
            .from("campaigns")
            .update({
              webhook_response: webhookResult,
              status: "completed",
            })
            .eq("id", campaign.id)
        } else {
          console.error("Webhook failed with status:", webhookResponse.status)
          // Still proceed even if webhook fails
          await supabase
            .from("campaigns")
            .update({
              status: "processing",
            })
            .eq("id", campaign.id)
        }

        // Store campaign data in sessionStorage for the results page
        sessionStorage.setItem(
          "campaignData",
          JSON.stringify({
            id: campaign.id,
            name: campaignName,
            jobDescription: jobDescription,
            webhookResponse: webhookResult,
          }),
        )

        toast.success("Campaign created successfully!")
        router.push(`/dashboard/campaigns/${campaign.id}/processing`)
      } catch (webhookError) {
        console.error("Webhook error:", webhookError)
        // Still proceed even if webhook fails
        await supabase
          .from("campaigns")
          .update({
            status: "processing",
          })
          .eq("id", campaign.id)

        // Store campaign data without webhook response
        sessionStorage.setItem(
          "campaignData",
          JSON.stringify({
            id: campaign.id,
            name: campaignName,
            jobDescription: jobDescription,
            webhookResponse: null,
          }),
        )

        toast.success("Campaign created successfully!")
        router.push(`/dashboard/campaigns/${campaign.id}/processing`)
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast.error("Failed to create campaign. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
        <p className="text-gray-600 mt-2">Set up a new recruitment campaign with AI-powered candidate matching</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Provide the job description. Our AI will analyze the requirements and match candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Upload Job Description (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Upload className="w-4 h-4" />
                    {file.name}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste or type the complete job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                required
              />
              <p className="text-sm text-gray-500">
                Include role responsibilities, requirements, qualifications, and any other relevant details.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card> 
    </div>
  )
}
