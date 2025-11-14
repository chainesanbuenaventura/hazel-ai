"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, MapPin, Clock, Home, Euro, Code, Target, Users, Briefcase } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase"

interface CampaignData {
  id: string
  name: string
  jobDescription: string
  webhookResponse: any
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        // First try to get from sessionStorage
        const sessionData = sessionStorage.getItem("campaignData")
        if (sessionData) {
          const data = JSON.parse(sessionData)
          setCampaignData(data)
          setIsLoading(false)
          return
        }

        // If not in session, fetch from database
        const supabase = createSupabaseClient()
        const { data, error } = await supabase.from("campaigns").select("*").eq("id", campaignId).single()

        if (error) {
          throw error
        }

        setCampaignData({
          id: data.id,
          name: data.name,
          jobDescription: data.job_description,
          webhookResponse: data.webhook_response,
        })
      } catch (error) {
        console.error("Error loading campaign data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaignData()
  }, [campaignId])

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const formatSalary = (salaryData: any): string => {
    if (!salaryData || typeof salaryData !== "object") {
      return "not specified"
    }

    const { min, max, currency } = salaryData
    const currencySymbol = currency === "EUR" ? "€" : currency || "€"

    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`
    } else if (min) {
      return `${currencySymbol}${min.toLocaleString()}`
    } else if (max) {
      return `${currencySymbol}${max.toLocaleString()}`
    }

    return "not specified"
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">not specified</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500 italic">not specified</span>
      }
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </Badge>
          ))}
        </div>
      )
    }

    if (typeof value === "object") {
      return <span className="text-sm">{JSON.stringify(value, null, 2)}</span>
    }

    return <span className="text-base">{String(value)}</span>
  }

  const extractJobData = (webhookResponse: any) => {
    if (!webhookResponse) return null

    // Handle the new JSON format: array with message.content structure
    if (Array.isArray(webhookResponse) && webhookResponse[0]?.message?.content) {
      return webhookResponse[0].message.content
    }

    // Handle direct object format (fallback)
    return webhookResponse
  }

  const getSkillsCount = (jobData: any): number => {
    if (!jobData) return 0

    // Check for skills in enrichment.skills array
    const skills = jobData.enrichment?.skills || []
    return Array.isArray(skills) ? skills.length : 0
  }

  const getRequirementsCount = (jobData: any): number => {
    if (!jobData) return 0

    const requirements = jobData.core?.requirements || []
    return Array.isArray(requirements) ? requirements.length : 0
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!campaignData) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h1>
          <Button onClick={() => router.push("/dashboard/campaigns")}>Back to Campaigns</Button>
        </div>
      </div>
    )
  }

  const jobData = extractJobData(campaignData.webhookResponse)
  const skillsCount = getSkillsCount(jobData)
  const requirementsCount = getRequirementsCount(jobData)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Processing Complete Header */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-4xl font-bold text-green-800">Processing Complete</h1>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 mb-2">{skillsCount}</div>
            <div className="text-xl text-gray-600">Skills Identified</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 mb-2">{requirementsCount}</div>
            <div className="text-xl text-gray-600">Requirements Extracted</div>
          </div>
        </div>

        <Button
          size="lg"
          className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg"
          onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
        >
          <Target className="w-5 h-5 mr-2" />
          Start Candidate Matching
        </Button>
      </div>

      {/* Extracted Job Information */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Extracted Job Information</h2>

        {jobData ? (
          <>
            {/* Job Title and Company */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">
                {jobData.core?.job_title || "Job Title not specified"}
              </h1>
              <h2 className="text-3xl font-semibold text-gray-700">
                {jobData.core?.company_name || "Company not specified"}
              </h2>

              {/* Info Bubbles */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge variant="outline" className="px-4 py-2 text-base">
                  <MapPin className="w-4 h-4 mr-2" />
                  {jobData.core?.location || "not specified"}
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base">
                  <Clock className="w-4 h-4 mr-2" />
                  {jobData.core?.contract_type || "not specified"}
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base">
                  <Home className="w-4 h-4 mr-2" />
                  {jobData.enrichment?.work_mode || "not specified"}
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base">
                  <Euro className="w-4 h-4 mr-2" />
                  {formatSalary(jobData.core?.salary_range)}
                </Badge>
              </div>
            </div>

            {/* Skills */}
            {jobData.enrichment?.skills && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Code className="h-6 w-6 text-purple-600" />
                    Skills
                  </CardTitle>
                  <p className="text-gray-600">Technical and professional skills</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {jobData.enrichment.skills.map((skill: any, index: number) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-base"
                      >
                        {typeof skill === "object" ? skill.name : skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {jobData.core?.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {jobData.core.responsibilities.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {jobData.core?.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-red-600" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {jobData.core.requirements.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-3 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Nice to Have (Bonus Skills) */}
            {jobData.enrichment?.skills && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Code className="h-6 w-6 text-green-600" />
                    Nice to Have
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {/* Show last 3 skills as "nice to have" based on the pattern in your data */}
                    {jobData.enrichment.skills.slice(-3).map((skill: any, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 text-base">
                        {typeof skill === "object" ? skill.name : skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits & Perks */}
            {jobData.enrichment?.benefits_perks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-yellow-600" />
                    Benefits & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {jobData.enrichment.benefits_perks.map((item: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-4 py-2 text-base"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Core Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  Core Information
                </CardTitle>
                <p className="text-gray-600">Essential job details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Job title:</span>
                    <div className="text-base">{jobData.core?.job_title || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Company name:</span>
                    <div className="text-base">{jobData.core?.company_name || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Location:</span>
                    <div className="text-base">{jobData.core?.location || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Contract type:</span>
                    <div className="text-base">{jobData.core?.contract_type || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Seniority level:</span>
                    <div className="text-base">{jobData.core?.seniority_level || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Salary range:</span>
                    <div className="text-base">{formatSalary(jobData.core?.salary_range)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-lg text-gray-700">Application link:</span>
                    <div className="text-base">{jobData.core?.application_link || "not specified"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Additional Details</CardTitle>
                <p className="text-gray-600">Enhanced job information</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Work mode:</span>
                    <div className="text-base">{jobData.enrichment?.work_mode || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Team department:</span>
                    <div className="text-base">{jobData.enrichment?.team_department || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Date posted:</span>
                    <div className="text-base">{jobData.enrichment?.date_posted || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Closing date:</span>
                    <div className="text-base">{jobData.enrichment?.closing_date || "not specified"}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Seniority tags:</span>
                    <div className="text-base">{renderValue(jobData.enrichment?.seniority_tags)}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Education requirements:</span>
                    <div className="text-base">{renderValue(jobData.enrichment?.education_requirements)}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Language requirements:</span>
                    <div className="text-base">
                      {jobData.enrichment?.languages
                        ?.map((lang: any) => (typeof lang === "object" ? lang.name : lang))
                        .join(", ") || "not specified"}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-700">Travel requirements:</span>
                    <div className="text-base">{renderValue(jobData.enrichment?.travel_requirements)}</div>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-lg text-gray-700">Company description:</span>
                  <div className="text-base mt-2">{jobData.enrichment?.company_description || "not specified"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Information */}
            {jobData.advanced && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Advanced Information</CardTitle>
                  <p className="text-gray-600">Detailed job specifications</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Application steps:</span>
                      <div className="text-base">{renderValue(jobData.advanced.application_steps)}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Job function:</span>
                      <div className="text-base">{jobData.advanced.job_function || "not specified"}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Industry sector:</span>
                      <div className="text-base">{jobData.advanced.industry_sector || "not specified"}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Remote time zone:</span>
                      <div className="text-base">{jobData.advanced.remote_time_zone || "not specified"}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Equity bonus info:</span>
                      <div className="text-base">{jobData.advanced.equity_bonus_info || "not specified"}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Recruiter contact:</span>
                      <div className="text-base">{jobData.advanced.recruiter_contact || "not specified"}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-gray-700">Estimated team size:</span>
                      <div className="text-base">{jobData.advanced.estimated_team_size || "not specified"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Description */}
            {jobData.core?.job_description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg leading-relaxed whitespace-pre-wrap">{jobData.core.job_description}</div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-xl text-gray-600">No webhook response data available</p>
              <p className="text-gray-500 mt-2">The campaign was created but no processing data was returned.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
