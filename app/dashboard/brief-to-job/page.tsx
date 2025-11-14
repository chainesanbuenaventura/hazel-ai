"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  ChevronRight,
  Euro,
  Target,
  Globe,
  Send,
  Briefcase,
  Users,
  CheckCircle,
} from "lucide-react"
import SharedAIPanel from "@/components/shared-ai-panel"
import { useAIPanel } from "@/components/ai-panel-context"

// Mock data for right panel
const mockRightPanelCampaigns = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc",
    location: "San Francisco, CA",
    contractType: "Full-time",
    skills: ["React", "TypeScript", "Node.js"],
    salary: "$120,000 - $150,000",
    created: "2024-01-15",
    updated: "2024-01-15",
  },
  {
    id: "2", 
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "New York, NY",
    contractType: "Full-time",
    skills: ["Vue.js", "JavaScript", "Python"],
    salary: "$100,000 - $130,000",
    created: "2024-01-14",
    updated: "2024-01-14",
  },
]

const mockRightPanelCandidates = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    title: "Senior Developer",
    company: "TechCorp Inc",
    location: "San Francisco, CA",
    skills: ["React", "TypeScript", "Node.js"],
    linkedinUrl: "https://linkedin.com/in/johndoe",
    campaignId: "1",
    campaignTitle: "Senior Frontend Developer",
  },
  {
    id: "2",
    name: "Jane Smith", 
    email: "jane.smith@example.com",
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "New York, NY",
    skills: ["Vue.js", "JavaScript", "CSS"],
    linkedinUrl: "https://linkedin.com/in/janesmith",
    campaignId: "2",
    campaignTitle: "Full Stack Engineer",
  },
]

// Updated interfaces to match the API response
interface JobOfferCore {
  job_title: string
  company_name: string
  location: string
  contract_type: string
  salary_range: {
    min: number
    max: number
    currency: string
  }
  job_description: string
  application_link: string | null
  requirements: string[]
  responsibilities: string[]
}

interface JobOfferEnrichment {
  work_mode: string
  team_department: string
  company_description: string
  benefits_perks: string[]
  seniority_tags: string[]
  education_requirements: string[]
  travel_requirements: string[]
  languages: Array<{
    name: string
    mastery: string
  }>
  skills: Array<{
    name: string
    mastery: string | null
  }>
}

interface JobOfferAdvanced {
  application_steps: string[]
  job_function: string
  industry_sector: string
  remote_time_zone: string
  equity_bonus_info: string
  recruiter_contact: string
  estimated_team_size: number
}

interface JobOfferResponse {
  index: number
  message: {
    role: string
    content: {
      core: JobOfferCore
      enrichment: JobOfferEnrichment
      advanced: JobOfferAdvanced
    }
  }
}

export default function BriefToJobPage() {
  const [meetingNotes, setMeetingNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  const [processSuccess, setProcessSuccess] = useState<string | null>(null)
  const [jobOffer, setJobOffer] = useState<JobOfferResponse | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showJobBoardModal, setShowJobBoardModal] = useState(false)
  const [selectedJobBoards, setSelectedJobBoards] = useState<string[]>([]);

  // AI Panel context
  const {
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    selectedContextCandidate,
    setSelectedContextCandidate,
    selectedContextCampaign,
    setSelectedContextCampaign,
    selectedProfileView,
    setSelectedProfileView,
    selectedCampaignView,
    setSelectedCampaignView,
  } = useAIPanel()

  const handleProcessNotes = async () => {
    if (!meetingNotes.trim()) {
      setProcessError("Please enter meeting notes to process")
      return
    }

    setIsProcessing(true)
    setProcessError(null)
    setProcessSuccess(null)

    try {
      // Call the notes_to_job API
      console.log("🤖 Processing meeting notes to job offer...")
      
      const response = await fetch("/api/notes-to-job-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: meetingNotes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 API Response:", data)

      // The API returns an array, we take the first item
      if (Array.isArray(data) && data.length > 0) {
        const jobOfferData = data[0] as JobOfferResponse
        setJobOffer(jobOfferData)
        setProcessSuccess("Meeting notes successfully transformed into job offer!")
      } else {
        throw new Error("Invalid response format from API")
      }
      
    } catch (error) {
      console.error("💥 Error processing meeting notes:", error)
      let errorMessage = "Failed to process meeting notes"
      
      if (error instanceof Error) {
        if (error.message.includes("Neo4j") || error.message.includes("SyntaxError")) {
          errorMessage = "AI processing error. Please try rephrasing your meeting notes or try again."
        } else {
          errorMessage = error.message
        }
      }
      
      setProcessError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }



  const handleCopyJobOffer = () => {
    if (jobOffer) {
      const jobOfferText = formatJobOfferForCopy(jobOffer)
      navigator.clipboard.writeText(jobOfferText)
      setProcessSuccess("Job offer copied to clipboard!")
    }
  }

  const handlePublishToJobBoards = () => {
    setShowJobBoardModal(true)
  }

  const handleJobBoardToggle = (jobBoard: string) => {
    setSelectedJobBoards(prev => 
      prev.includes(jobBoard) 
        ? prev.filter(board => board !== jobBoard)
        : [...prev, jobBoard]
    );
  };

  const handlePublishSelected = () => {
    console.log("Publishing to selected job boards:", selectedJobBoards);
    // Here you would implement the actual publishing logic
    setShowJobBoardModal(false);
    setSelectedJobBoards([]);
  };

  const formatJobOfferForCopy = (offer: JobOfferResponse): string => {
    const { core, enrichment, advanced } = offer.message.content
    const salaryRange = `${core.salary_range.min.toLocaleString()}-${core.salary_range.max.toLocaleString()} ${core.salary_range.currency}`
    
    return `# ${core.job_title}
**Company:** ${core.company_name}
**Location:** ${core.location}
**Work Mode:** ${enrichment.work_mode}
**Salary:** ${salaryRange}
**Department:** ${enrichment.team_department}
**Seniority Level:** ${enrichment.seniority_tags.join(', ')}
**Contract Type:** ${core.contract_type}
**Industry:** ${advanced.industry_sector}

## Job Description
${core.job_description}

## Requirements
${core.requirements.map(req => `• ${req}`).join('\n')}

## Responsibilities
${core.responsibilities.map(resp => `• ${resp}`).join('\n')}

## Benefits & Perks
${enrichment.benefits_perks.map(benefit => `• ${benefit}`).join('\n')}

## Skills Required
${enrichment.skills.map(skill => `• ${skill.name}${skill.mastery ? ` (${skill.mastery})` : ''}`).join('\n')}

## Languages
${enrichment.languages.map(lang => `• ${lang.name} (${lang.mastery})`).join('\n')}

## Application Process
${advanced.application_steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Contact:** ${advanced.recruiter_contact}
**Team Size:** ${advanced.estimated_team_size} people
`
  }

  const handleReset = () => {
    setMeetingNotes("")
    setJobOffer(null)
    setProcessError(null)
    setProcessSuccess(null)
    setIsEditing(false)
  }

  const handleCreateCampaign = () => {
    if (!jobOffer) return
    
    // Convert the job offer JSON to a concatenated text format
    const campaignText = formatJobOfferForCampaign(jobOffer)
    
    // Navigate to campaigns page with the text pre-filled
    const encodedText = encodeURIComponent(campaignText)
    window.open(`/dashboard/campaigns/new?brief=${encodedText}`, '_blank')
  }

  const formatJobOfferForCampaign = (offer: JobOfferResponse): string => {
    const { core, enrichment, advanced } = offer.message.content
    const salaryRange = `${core.salary_range.min.toLocaleString()}-${core.salary_range.max.toLocaleString()} ${core.salary_range.currency}`
    
    return `Job Title: ${core.job_title}
Company: ${core.company_name}
Location: ${core.location}
Work Mode: ${enrichment.work_mode}
Salary Range: ${salaryRange}
Department: ${enrichment.team_department}
Seniority Level: ${enrichment.seniority_tags.join(', ')}
Contract Type: ${core.contract_type}
Industry: ${advanced.industry_sector}

Job Description:
${core.job_description}

Requirements:
${core.requirements.map(req => `- ${req}`).join('\n')}

Responsibilities:
${core.responsibilities.map(resp => `- ${resp}`).join('\n')}

Benefits & Perks:
${enrichment.benefits_perks.map(benefit => `- ${benefit}`).join('\n')}

Skills Required:
${enrichment.skills.map(skill => `- ${skill.name}${skill.mastery ? ` (${skill.mastery})` : ''}`).join('\n')}

Languages:
${enrichment.languages.map(lang => `- ${lang.name} (${lang.mastery})`).join('\n')}

Application Process:
${advanced.application_steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Additional Information:
- Contact: ${advanced.recruiter_contact}
- Team Size: ${advanced.estimated_team_size} people
- Education: ${enrichment.education_requirements.join(', ')}
- Travel Requirements: ${enrichment.travel_requirements.join(', ')}
- Equity/Bonus: ${advanced.equity_bonus_info}`
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      <div className="flex-1 overflow-auto pl-6 pr-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-600">Brief2Job</h1>
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-muted-foreground">
                Transform meeting notes and client briefs into structured job offers
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                className="md:hidden"
              >
                {isRightPanelCollapsed ? "Show" : "Hide"} AI Panel
              </Button>
            </div>
          </div>

          {/* Success/Error Alerts */}
          {processSuccess && (
            <Alert variant="default" className="border shadow-sm" style={{ backgroundColor: '#f5fbf0', borderColor: '#e8f5d9' }}>
              <AlertCircle className="h-4 w-4" style={{ color: '#a8c975' }} />
              <AlertDescription className="flex items-center justify-between" style={{ color: '#7a8b5a' }}>
                <span>{processSuccess}</span>
                <Button variant="ghost" size="sm" onClick={() => setProcessSuccess(null)}>
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {processError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{processError}</span>
                <Button variant="ghost" size="sm" onClick={() => setProcessError(null)}>
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Meeting Notes & Client Brief
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-notes">
                    Paste your meeting notes, client requirements, or job brief here:
                  </Label>
                  <Textarea
                    id="meeting-notes"
                    placeholder="Example:
Met with TechCorp today about their Frontend Developer position.
- Looking for someone with 3-5 years React experience
- Must know TypeScript, Next.js
- Remote work possible, but prefer hybrid (2 days in office)
- Salary range: $80k-$100k
- Start date: ASAP
- Team of 8 developers, reporting to Sarah (Engineering Manager)
- Benefits: Health insurance, 401k, unlimited PTO
- Working on e-commerce platform rebuild..."
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    className="min-h-[300px] resize-none"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleProcessNotes}
                    disabled={isProcessing || !meetingNotes.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Transform to Job Offer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-5 w-5" />
                    Generated Job Offer
                  </div>
                  {jobOffer && (
                    <Button
                      size="sm"
                      onClick={handleCreateCampaign}
                      className="text-xs bg-black hover:bg-gray-800 text-white border-black"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Create Campaign
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!jobOffer ? (
                  <div className="flex items-center justify-center h-[300px] text-center">
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Your structured job offer will appear here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Paste meeting notes on the left and click "Transform to Job Offer"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto">
                    {(() => {
                      const { core, enrichment, advanced } = jobOffer.message.content
                      
                      // Helper function to safely render values
                      const safeRender = (value: any): string => {
                        if (typeof value === 'string') return value
                        if (typeof value === 'number') return value.toString()
                        if (typeof value === 'object' && value !== null) {
                          // If it's an object with name/email properties, extract the name
                          if (value.name) return value.name
                          if (value.email) return value.email
                          // Otherwise, try to stringify it
                          return JSON.stringify(value)
                        }
                        return String(value || '')
                      }
                      
                      const salaryRange = `${core.salary_range.min.toLocaleString()}-${core.salary_range.max.toLocaleString()} ${core.salary_range.currency}`
                      
                      return (
                        <>
                          {/* Job Header */}
                          <div className="space-y-3 pb-4 border-b">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="text-xl font-semibold text-gray-900">{safeRender(core.job_title)}</h3>
                                <p className="text-lg text-muted-foreground">{safeRender(core.company_name)}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                {enrichment.seniority_tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                📍 {safeRender(core.location)}
                              </Badge>
                              <Badge variant="outline" className="border shadow-sm" style={{ backgroundColor: '#f5fbf0', color: '#7a8b5a', borderColor: '#e8f5d9' }}>
                                💰 {salaryRange}
                              </Badge>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                🏢 {safeRender(enrichment.work_mode)}
                              </Badge>
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                📋 {safeRender(core.contract_type)}
                              </Badge>
                            </div>
                          </div>

                          {/* Company Description */}
                          {enrichment.company_description && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900">About the Company</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{safeRender(enrichment.company_description)}</p>
                            </div>
                          )}

                          {/* Job Description */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Job Description</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{safeRender(core.job_description)}</p>
                          </div>

                          {/* Salary Section */}
                          <div className="flex items-center gap-2 text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <Euro className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-900">Salary:</span>
                            <span className="font-medium text-blue-800">
                              {salaryRange}
                            </span>
                          </div>

                          {/* Key Details Grid */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</span>
                              <p className="text-sm font-medium">{safeRender(enrichment.team_department)}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</span>
                              <p className="text-sm font-medium">{safeRender(advanced.industry_sector)}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Size</span>
                              <p className="text-sm font-medium">{safeRender(advanced.estimated_team_size)} people</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</span>
                              <p className="text-sm font-medium">{safeRender(advanced.recruiter_contact)}</p>
                            </div>
                          </div>

                          {/* Requirements */}
                          {core.requirements.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Requirements</h4>
                              <ul className="space-y-2">
                                {core.requirements.map((req, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                                    <span className="text-sm text-gray-600">{safeRender(req)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Responsibilities */}
                          {core.responsibilities.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Responsibilities</h4>
                              <ul className="space-y-2">
                                {core.responsibilities.map((resp, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#c4e4a5' }}></span>
                                    <span className="text-sm text-gray-600">{safeRender(resp)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Skills */}
                          {enrichment.skills.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {enrichment.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {skill.name}{skill.mastery && ` (${skill.mastery})`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Languages */}
                          {enrichment.languages.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Languages</h4>
                              <div className="flex flex-wrap gap-2">
                                {enrichment.languages.map((lang, index) => (
                                  <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    {lang.name} ({lang.mastery})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Benefits */}
                          {enrichment.benefits_perks.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Benefits & Perks</h4>
                              <ul className="space-y-2">
                                {enrichment.benefits_perks.map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                                    <span className="text-sm text-gray-600">{safeRender(benefit)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Application Process */}
                          {advanced.application_steps.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Application Process</h4>
                              <ol className="space-y-2">
                                {advanced.application_steps.map((step, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-600 pt-1">{safeRender(step)}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Additional Information */}
                          {(enrichment.education_requirements.length > 0 || advanced.equity_bonus_info !== "N/A") && (
                            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-900">Additional Information</h4>
                              {enrichment.education_requirements.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-blue-800">Education: </span>
                                  <span className="text-sm text-blue-700">{enrichment.education_requirements.join(', ')}</span>
                                </div>
                              )}
                              {advanced.equity_bonus_info !== "N/A" && (
                                <div>
                                  <span className="text-sm font-medium text-blue-800">Equity/Bonus: </span>
                                  <span className="text-sm text-blue-700">{safeRender(advanced.equity_bonus_info)}</span>
                                </div>
                              )}
                              {enrichment.travel_requirements.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-blue-800">Travel: </span>
                                  <span className="text-sm text-blue-700">{enrichment.travel_requirements.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
                            <Button 
                              variant="outline"
                              onClick={handleCopyJobOffer}
                              className="w-full"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Job Offer
                            </Button>
                            <Button 
                              className="w-full bg-black hover:bg-gray-800 text-white border-black"
                              onClick={handlePublishToJobBoards}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Publish to Job Boards
                            </Button>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Include Key Information:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Job title and seniority level</li>
                    <li>• Required skills and experience</li>
                    <li>• Salary range or budget</li>
                    <li>• Work location and remote policy</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Additional Details:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Team size and reporting structure</li>
                    <li>• Benefits and perks</li>
                    <li>• Start date and urgency</li>
                    <li>• Company culture and values</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Panel */}
      <SharedAIPanel
        isCollapsed={isRightPanelCollapsed}
        onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        selectedContextCandidate={selectedContextCandidate}
        setSelectedContextCandidate={setSelectedContextCandidate}
        selectedContextCampaign={selectedContextCampaign}
        setSelectedContextCampaign={setSelectedContextCampaign}
        selectedProfileView={selectedProfileView}
        setSelectedProfileView={setSelectedProfileView}
        selectedCampaignView={selectedCampaignView}
        setSelectedCampaignView={setSelectedCampaignView}
        campaigns={mockRightPanelCampaigns}
        candidates={mockRightPanelCandidates}
      />

      {/* Job Board Modal */}
      <Dialog open={showJobBoardModal} onOpenChange={setShowJobBoardModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Publish to Job Boards</DialogTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                Preview
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-lg">
                Choose which job boards to publish your job posting to
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* LinkedIn */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('LinkedIn')
                    ? 'bg-blue-100 border-blue-400 shadow-lg'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                }`}
                onClick={() => handleJobBoardToggle('LinkedIn')}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">LinkedIn</h3>
                <p className="text-sm text-blue-700">Professional network</p>
                <p className="text-xs text-blue-600 mt-2">Premium candidates</p>
                {selectedJobBoards.includes('LinkedIn') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Indeed */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('Indeed')
                    ? 'bg-indigo-100 border-indigo-400 shadow-lg'
                    : 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                }`}
                onClick={() => handleJobBoardToggle('Indeed')}
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-indigo-900 mb-2">Indeed</h3>
                <p className="text-sm text-indigo-700">Job search giant</p>
                <p className="text-xs text-indigo-700 mt-2">High volume</p>
                {selectedJobBoards.includes('Indeed') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Google Jobs */}
              <div 
                className={`text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  selectedJobBoards.includes('Google Jobs')
                    ? 'bg-red-100 border-red-400 shadow-lg'
                    : 'bg-red-50 border-red-200 hover:border-red-300'
                }`}
                onClick={() => handleJobBoardToggle('Google Jobs')}
              >
                <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-red-900 mb-2">Google Jobs</h3>
                <p className="text-sm text-red-700">Search integration</p>
                <p className="text-xs text-red-600 mt-2">Wide reach</p>
                {selectedJobBoards.includes('Google Jobs') && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Talent.com */}
              <div 
                className="text-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative shadow-sm hover:shadow-md"
                style={selectedJobBoards.includes('Talent.com') 
                  ? { backgroundColor: '#f5fbf0', borderColor: '#e8f5d9', boxShadow: '0 4px 12px rgba(232, 245, 217, 0.3)' }
                  : { backgroundColor: '#fafdf7', borderColor: '#e8f5d9' }
                }
                onMouseEnter={(e) => {
                  if (!selectedJobBoards.includes('Talent.com')) {
                    e.currentTarget.style.borderColor = '#c4e4a5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedJobBoards.includes('Talent.com')) {
                    e.currentTarget.style.borderColor = '#e8f5d9';
                  }
                }}
                onClick={() => handleJobBoardToggle('Talent.com')}
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#e8f5d9' }}>
                  <Users className="w-8 h-8" style={{ color: '#7a8b5a' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#7a8b5a' }}>Talent.com</h3>
                <p className="text-sm" style={{ color: '#7a8b5a' }}>Global platform</p>
                <p className="text-xs mt-2" style={{ color: '#a8c975' }}>International</p>
                {selectedJobBoards.includes('Talent.com') && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5d9' }}>
                    <CheckCircle className="w-4 h-4" style={{ color: '#7a8b5a' }} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowJobBoardModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                className="bg-black hover:bg-gray-800 text-white px-6"
                onClick={handlePublishSelected}
                disabled={selectedJobBoards.length === 0}
              >
                Publish Selected ({selectedJobBoards.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
