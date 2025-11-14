"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { CheckCircle, Users, Building2, MapPin, DollarSign, Briefcase } from "lucide-react"

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
      return `${campaign.job.salary_min.toLocaleString()} - ${campaign.job.salary_max.toLocaleString()} ${currency}`
    }
    return "Not specified"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Job Description</h2>
        <p className="text-muted-foreground">Complete job details and requirements</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Position Title</label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setIsDirty(true)
                }}
                placeholder="e.g. Senior ML Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company
              </label>
              <Input value={campaign.job.company || ""} disabled className="bg-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Input value={campaign.job.location || ""} disabled className="bg-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Work Mode
              </label>
              <Input value={campaign.job.work_mode || ""} disabled className="bg-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salary Range
              </label>
              <Input value={formatSalary()} disabled className="bg-muted" />
            </div>
            {campaign.job.department && (
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Input value={campaign.job.department} disabled className="bg-muted" />
              </div>
            )}
            {campaign.job.seniority && (
              <div>
                <label className="block text-sm font-medium mb-2">Seniority Level</label>
                <Input value={campaign.job.seniority} disabled className="bg-muted" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Contract Type</label>
              <Input value={campaign.job.contract || ""} disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setIsDirty(true)
              }}
              placeholder="Enter full job description"
              className="min-h-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      {campaign.job.requirements && campaign.job.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-red-600" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {campaign.job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-base">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {campaign.job.skills && campaign.job.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {campaign.job.skills.map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-primary/10 text-primary border border-primary/30 rounded-full px-4 py-2 text-base font-semibold hover:bg-primary/20 hover:scale-105 transition-all"
                >
                  {skill.name}
                  {skill.mastery && ` (${skill.mastery})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {campaign.job.benefits && campaign.job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-600" />
              Benefits & Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {campaign.job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-base">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Company Description */}
      {campaign.job.company_desc && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              About {campaign.job.company}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap">{campaign.job.company_desc}</p>
          </CardContent>
        </Card>
      )}

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
