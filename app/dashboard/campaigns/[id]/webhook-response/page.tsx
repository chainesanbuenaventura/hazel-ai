"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Copy,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { createSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Campaign {
  id: string
  name: string
  job_description: string
  status: string
  webhook_response: string | null
  created_at: string
}

interface ParsedJobData {
  title?: string
  company?: string
  location?: string
  salary?: string
  type?: string
  experience?: string
  skills?: string[]
  requirements?: string[]
  benefits?: string[]
  description?: string
}

export default function WebhookResponsePage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [parsedData, setParsedData] = useState<ParsedJobData | null>(null)
  const [isJsonOpen, setIsJsonOpen] = useState(false)

  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  const fetchCampaign = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.from("campaigns").select("*").eq("id", params.id).single()

      if (error) throw error

      setCampaign(data)

      // Parse webhook response if available
      if (data.webhook_response) {
        try {
          const parsed = JSON.parse(data.webhook_response)
          setParsedData(parsed)
        } catch (e) {
          console.error("Failed to parse webhook response:", e)
        }
      }
    } catch (error) {
      console.error("Error fetching campaign:", error)
      toast.error("Failed to load campaign data")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      draft: "outline",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Campaign Not Found</h3>
              <p className="text-muted-foreground">The requested campaign could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/campaigns/${campaign.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(campaign.status)}
          {getStatusBadge(campaign.status)}
        </div>
      </div>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Webhook Response
            {getStatusIcon(campaign.status)}
          </CardTitle>
          <CardDescription>Processing results for campaign: {campaign.name}</CardDescription>
        </CardHeader>
      </Card>

      {/* Parsed Job Data */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Job Information</CardTitle>
            <CardDescription>Structured data extracted from the webhook response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Title & Company */}
            {(parsedData.title || parsedData.company) && (
              <div className="space-y-2">
                {parsedData.title && <h2 className="text-2xl font-bold">{parsedData.title}</h2>}
                {parsedData.company && (
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {parsedData.company}
                  </p>
                )}
              </div>
            )}

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {parsedData.location && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{parsedData.location}</p>
                  </div>
                </div>
              )}

              {parsedData.salary && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">{parsedData.salary}</p>
                  </div>
                </div>
              )}

              {parsedData.type && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{parsedData.type}</p>
                  </div>
                </div>
              )}

              {parsedData.experience && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-sm text-muted-foreground">{parsedData.experience}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            {parsedData.skills && parsedData.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {parsedData.requirements && parsedData.requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {parsedData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {parsedData.benefits && parsedData.benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {parsedData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {parsedData.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{parsedData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Raw Response */}
      {campaign.webhook_response && (
        <Card>
          <CardHeader>
            <Collapsible open={isJsonOpen} onOpenChange={setIsJsonOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0">
                  <div className="flex items-center gap-2">
                    <CardTitle>Raw Webhook Response</CardTitle>
                    <Badge variant="outline">JSON</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isJsonOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardDescription className="mt-2">Raw JSON response from the webhook processing</CardDescription>
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>
          <Collapsible open={isJsonOpen} onOpenChange={setIsJsonOpen}>
            <CollapsibleContent>
              <CardContent>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 z-10 bg-transparent"
                    onClick={() => copyToClipboard(campaign.webhook_response!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                    <code>{JSON.stringify(JSON.parse(campaign.webhook_response), null, 2)}</code>
                  </pre>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* No Response State */}
      {!campaign.webhook_response && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No webhook response available yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
