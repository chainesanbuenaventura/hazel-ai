"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { CheckCircle, Users, Building2, MapPin, DollarSign, Briefcase, Euro } from "lucide-react"

interface Campaign {
  campaign_id: string
  created_at: string | null
  updated_at: string | null
  job: {
    title: string
    company: string
    location: string
    contract: string
    seniority: string | null
    salary_min: number | null
    salary_max: number | null
    salary_currency: string
    description: string
    work_mode: string
    department: string | null
    company_desc: string
    skills: Array<{ name: string; mastery: string | null }>
    benefits: string[]
    requirements: string[]
  }
}

interface JDTabProps {
  campaign: Campaign | null
}

export function JDTab({ campaign = null }: JDTabProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.job.title || "")
      setDescription(campaign.job.description || "")
    }
  }, [campaign])

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading job description...</p>
        </div>
      </div>
    )
  }

  const formatSalary = () => {
    if (campaign.job.salary_min && campaign.job.salary_max) {
      const currency = campaign.job.salary_currency || "USD"
      return `${campaign.job.salary_min.toLocaleString()}-${campaign.job.salary_max.toLocaleString()} ${currency}`
    }
    return "Not specified"
  }

  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return "Not specified"
    return String(value || '')
  }

  const salaryRange = formatSalary()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Job Description</h2>
        <p className="text-muted-foreground">Complete job details and requirements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>Job Description Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {/* Job Header */}
            <div className="space-y-3 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-gray-900">{safeRender(campaign.job.title)}</h3>
                  <p className="text-lg text-muted-foreground">{safeRender(campaign.job.company)}</p>
                </div>
                {campaign.job.seniority && (
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {campaign.job.seniority}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  📍 {safeRender(campaign.job.location)}
                </Badge>
                {campaign.job.salary_min && campaign.job.salary_max && (
                  <Badge variant="outline" className="border shadow-sm" style={{ backgroundColor: '#f5fbf0', color: '#7a8b5a', borderColor: '#e8f5d9' }}>
                    💰 {salaryRange}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  🏢 {safeRender(campaign.job.work_mode)}
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  📋 {safeRender(campaign.job.contract)}
                </Badge>
              </div>
            </div>

            {/* Company Description */}
            {campaign.job.company_desc && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">About the Company</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{safeRender(campaign.job.company_desc)}</p>
              </div>
            )}

            {/* Job Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Job Description</h4>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setIsDirty(true)
                }}
                placeholder="Enter full job description"
                className="min-h-32 text-sm text-gray-600 leading-relaxed"
              />
            </div>

            {/* Salary Section */}
            {campaign.job.salary_min && campaign.job.salary_max && (
              <div className="flex items-center gap-2 text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <Euro className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Salary:</span>
                <span className="font-medium text-blue-800">
                  {salaryRange}
                </span>
              </div>
            )}

            {/* Key Details Grid */}
            {(campaign.job.department || campaign.job.seniority) && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {campaign.job.department && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</span>
                    <p className="text-sm font-medium">{safeRender(campaign.job.department)}</p>
                  </div>
                )}
                {campaign.job.seniority && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Seniority</span>
                    <p className="text-sm font-medium">{safeRender(campaign.job.seniority)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Requirements */}
            {campaign.job.requirements && campaign.job.requirements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Requirements</h4>
                <ul className="space-y-2">
                  {campaign.job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                      <span className="text-sm text-gray-600">{safeRender(req)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {campaign.job.skills && campaign.job.skills.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {skill.name}{skill.mastery && ` (${skill.mastery})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {campaign.job.benefits && campaign.job.benefits.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Benefits & Perks</h4>
                <ul className="space-y-2">
                  {campaign.job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                      <span className="text-sm text-gray-600">{safeRender(benefit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save/Cancel Buttons */}
      {isDirty && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button onClick={() => setIsDirty(false)}>Save Changes</Button>
              <Button variant="outline" onClick={() => {
                setTitle(campaign.job.title || "")
                setDescription(campaign.job.description || "")
                setIsDirty(false)
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
