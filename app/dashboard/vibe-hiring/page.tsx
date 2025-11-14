"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Copy, Send, X, Sparkles, FileText, Building2, MapPin, DollarSign, Briefcase, Users, CheckCircle, Code, Euro, Globe, Plus, MessageSquare, Search, Folder, Clock, Layers, Loader2 } from "lucide-react"
import SharedAIPanel from "@/components/shared-ai-panel"
import { useAIPanel } from "@/components/ai-panel-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface JobOffer {
  core: {
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
    requirements: string[]
    responsibilities: string[]
  }
  enrichment: {
    work_mode: string
    team_department: string
    seniority_tags: string[]
    company_description: string
    skills: Array<{ name: string; mastery?: string }>
    languages: Array<{ name: string; mastery: string }>
    benefits_perks: string[]
    education_requirements: string[]
    travel_requirements: string[]
  }
  advanced: {
    industry_sector: string
    estimated_team_size: string
    recruiter_contact: string
    application_steps: string[]
    equity_bonus_info: string
  }
}

const promptCues = [
  "I'm looking for a data scientist in Paris with 8+ years of experience",
  "Find me a senior frontend developer with React expertise",
  "I need a product manager with SaaS experience",
  "Looking for a DevOps engineer familiar with AWS and Kubernetes",
]

interface RecentChat {
  id: string
  title: string
  preview: string
  timestamp: Date
  jobOffer?: JobOffer
}

export default function VibeHiringPage() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [jobOfferText, setJobOfferText] = useState("")
  const [activeTab, setActiveTab] = useState<"chat" | "upload" | "paste">("chat")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null)
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false)
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const [isHoveringLogo, setIsHoveringLogo] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)

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
    campaigns,
    candidates,
  } = useAIPanel()

  const handleLogoHover = () => {
    setIsHoveringLogo(true)
    // Open sidebar after 300ms hover
    hoverTimeoutRef.current = setTimeout(() => {
      setIsChatHistoryOpen(true)
    }, 300)
  }

  const handleLogoLeave = () => {
    setIsHoveringLogo(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    // Don't close sidebar immediately when leaving logo - let sidebar handle its own close
  }

  const handleSidebarLeave = () => {
    // Close sidebar when mouse leaves the sidebar area
    setIsChatHistoryOpen(false)
    setIsHoveringLogo(false)
  }

  const handleLogoClick = () => {
    setIsChatHistoryOpen(true)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Load recent chats from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vibe-hiring-chats')
    if (stored) {
      try {
        const chats = JSON.parse(stored)
        setRecentChats(chats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        })))
      } catch (e) {
        console.error('Error loading recent chats:', e)
      }
    }
  }, [])

  // Save chat to recent chats when job offer is generated
  useEffect(() => {
    if (jobOffer && initialChatMessage) {
      const newChat: RecentChat = {
        id: Date.now().toString(),
        title: jobOffer.core.job_title || initialChatMessage.substring(0, 50) + '...',
        preview: initialChatMessage.substring(0, 100) + (initialChatMessage.length > 100 ? '...' : ''),
        timestamp: new Date(),
        jobOffer: jobOffer
      }
      
      setRecentChats(prev => {
        const updated = [newChat, ...prev.filter(c => c.id !== newChat.id)].slice(0, 10) // Keep max 10 chats
        localStorage.setItem('vibe-hiring-chats', JSON.stringify(updated))
        return updated
      })
    }
  }, [jobOffer, initialChatMessage])

  const handleNewChat = () => {
    setJobOffer(null)
    setHasSubmitted(false)
    setInput("")
    setJobOfferText("")
    setIsChatHistoryOpen(false)
  }

  const handleLoadChat = (chat: RecentChat) => {
    if (chat.jobOffer) {
      setJobOffer(chat.jobOffer)
      setHasSubmitted(true)
      setIsRightPanelCollapsed(false)
      setIsChatHistoryOpen(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !jobOfferText.trim()) return

    const messageContent = input || jobOfferText

    // Move chat to right panel after first submission
    if (!hasSubmitted) {
      setHasSubmitted(true)
      setIsRightPanelCollapsed(false)
      // Set initial message to be sent to AI panel
      setInitialChatMessage(messageContent)
      
      // Call the notes-to-job API (same as brief-to-job)
      setIsLoading(true)
      try {
        console.log("🤖 Processing message to job offer...")
        
        const response = await fetch("/api/notes-to-job-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: messageContent,
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
          const jobOfferData = data[0]
          
          // Transform the API response to match our JobOffer interface
          if (jobOfferData.message && jobOfferData.message.content) {
            const { core, enrichment, advanced } = jobOfferData.message.content
            
            setJobOffer({
              core: {
                job_title: core.job_title || "",
                company_name: core.company_name || "",
                location: core.location || "",
                contract_type: core.contract_type || "",
                salary_range: {
                  min: core.salary_range?.min || 0,
                  max: core.salary_range?.max || 0,
                  currency: core.salary_range?.currency || "USD"
                },
                job_description: core.job_description || "",
                requirements: core.requirements || [],
                responsibilities: core.responsibilities || []
              },
              enrichment: {
                work_mode: enrichment.work_mode || "",
                team_department: enrichment.team_department || "",
                seniority_tags: enrichment.seniority_tags || [],
                company_description: enrichment.company_description || "",
                skills: enrichment.skills || [],
                languages: enrichment.languages || [],
                benefits_perks: enrichment.benefits_perks || [],
                education_requirements: enrichment.education_requirements || [],
                travel_requirements: enrichment.travel_requirements || []
              },
              advanced: {
                industry_sector: advanced.industry_sector || "",
                estimated_team_size: advanced.estimated_team_size || "",
                recruiter_contact: advanced.recruiter_contact || "",
                application_steps: advanced.application_steps || [],
                equity_bonus_info: advanced.equity_bonus_info || ""
              }
            })
          }
        } else {
          throw new Error("Invalid response format from API")
        }
      } catch (error) {
        console.error("💥 Error processing message:", error)
        // Still show error but don't block the UI
        // The chat will continue in the right panel
      } finally {
        setIsLoading(false)
      }
    }

    setInput("")
    setJobOfferText("")
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "text/plain" || file.type === "application/pdf")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setJobOfferText(text)
        setActiveTab("paste")
      }
      reader.readAsText(file)
    }
  }

  const handlePasteJobOffer = () => {
    navigator.clipboard.readText().then((text) => {
      setJobOfferText(text)
    }).catch(() => {
      // Fallback: show paste area
    })
  }

  const safeRender = (value: any): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'object' && value !== null) {
      if (value.name) return value.name
      if (value.email) return value.email
      return JSON.stringify(value)
    }
    return String(value || '')
  }

  const formatJobOfferForCampaign = (offer: JobOffer): string => {
    const salaryRange = `${offer.core.salary_range.min.toLocaleString()}-${offer.core.salary_range.max.toLocaleString()} ${offer.core.salary_range.currency}`
    
    return `Job Title: ${offer.core.job_title}
Company: ${offer.core.company_name}
Location: ${offer.core.location}
Work Mode: ${offer.enrichment.work_mode}
Salary Range: ${salaryRange}
Department: ${offer.enrichment.team_department}
Seniority Level: ${offer.enrichment.seniority_tags.join(', ')}
Contract Type: ${offer.core.contract_type}
Industry: ${offer.advanced.industry_sector}

Job Description:
${offer.core.job_description}

Requirements:
${offer.core.requirements.map(req => `- ${req}`).join('\n')}

Responsibilities:
${offer.core.responsibilities.map(resp => `- ${resp}`).join('\n')}

Benefits & Perks:
${offer.enrichment.benefits_perks.map(benefit => `- ${benefit}`).join('\n')}

Skills Required:
${offer.enrichment.skills.map(skill => `- ${skill.name}${skill.mastery ? ` (${skill.mastery})` : ''}`).join('\n')}

Languages:
${offer.enrichment.languages.map(lang => `- ${lang.name} (${lang.mastery})`).join('\n')}

Application Process:
${offer.advanced.application_steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Additional Information:
- Contact: ${offer.advanced.recruiter_contact}
- Team Size: ${offer.advanced.estimated_team_size} people
- Education: ${offer.enrichment.education_requirements.join(', ')}
- Travel Requirements: ${offer.enrichment.travel_requirements.join(', ')}
- Equity/Bonus: ${offer.advanced.equity_bonus_info}`
  }

  const handleCreateCampaign = async () => {
    if (!jobOffer) return
    
    setIsCreatingCampaign(true)
    
    try {
      // Step 1: Convert the job offer JSON to a concatenated text format
      const campaignText = formatJobOfferForCampaign(jobOffer)
      
      // Step 2: Call extract_job_json API via proxy
      const extractResponse = await fetch('/api/extract-job-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawJobJson: campaignText
        })
      })
      
      if (!extractResponse.ok) {
        const errorData = await extractResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Extract API failed: ${extractResponse.status}`)
      }
      
      const extractedData = await extractResponse.json()
      
      // Step 3: Sanitize the data - convert null values to empty strings for required string fields
      const sanitizeData = (data: any): any => {
        if (data === null || data === undefined) {
          return ""
        }
        if (typeof data === "object" && !Array.isArray(data)) {
          const sanitized: any = {}
          for (const key in data) {
            if (data[key] === null) {
              // For required string fields, use empty string instead of null
              sanitized[key] = ""
            } else if (typeof data[key] === "object") {
              sanitized[key] = sanitizeData(data[key])
            } else {
              sanitized[key] = data[key]
            }
          }
          return sanitized
        }
        if (Array.isArray(data)) {
          return data.map(item => sanitizeData(item))
        }
        return data
      }
      
      const sanitizedContent = sanitizeData(extractedData)
      
      // Ensure required string fields are not null
      if (sanitizedContent.core) {
        sanitizedContent.core.company_name = sanitizedContent.core.company_name || ""
        sanitizedContent.core.location = sanitizedContent.core.location || ""
        sanitizedContent.core.job_title = sanitizedContent.core.job_title || ""
        sanitizedContent.core.contract_type = sanitizedContent.core.contract_type || ""
        sanitizedContent.core.job_description = sanitizedContent.core.job_description || ""
      }
      
      // Step 4: Format the data for ingest_campaign API
      // The API expects an array with index and message structure
      const ingestPayload = [
        {
          index: 0,
          message: {
            role: "assistant",
            content: sanitizedContent
          }
        }
      ]
      
      // Step 4: Call ingest_campaign API via proxy
      const ingestResponse = await fetch('/api/ingest-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingestPayload)
      })
      
      if (!ingestResponse.ok) {
        const errorData = await ingestResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Ingest API failed: ${ingestResponse.status}`)
      }
      
      const ingestResult = await ingestResponse.json()
      
      // Step 5: Fetch campaigns to get the newly created campaign
      console.log('🔄 Fetching campaigns to find newly created campaign...')
      const campaignsResponse = await fetch('/api/campaigns-proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })
      
      if (!campaignsResponse.ok) {
        throw new Error(`Failed to fetch campaigns: ${campaignsResponse.status}`)
      }
      
      const campaignsData = await campaignsResponse.json()
      
      if (campaignsData.success && Array.isArray(campaignsData.data) && campaignsData.data.length > 0) {
        // Campaigns are sorted newest first, so the first one should be our new campaign
        const newCampaign = campaignsData.data[0]
        const campaignId = newCampaign.campaign_id
        
        console.log('✅ Found new campaign:', campaignId)
        
        // Step 6: Redirect to the newly created campaign
        window.location.href = `/dashboard/campaigns/${campaignId}`
      } else {
        // Fallback: redirect to campaigns page if we can't find the new campaign
        console.warn('⚠️ Could not find new campaign, redirecting to campaigns page')
        window.location.href = '/dashboard/campaigns'
      }
      
    } catch (error) {
      console.error('Error creating campaign:', error)
      setIsCreatingCampaign(false)
      alert(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Hide panel initially until first message is submitted
  const shouldShowPanel = hasSubmitted

  // Show loading overlay when creating campaign
  if (isCreatingCampaign) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Creating Campaign...</h2>
            <p className="text-muted-foreground">Please wait while we create your recruitment campaign</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen gap-4 relative" style={{ marginRight: shouldShowPanel ? (isRightPanelCollapsed ? '4rem' : '25rem') : '0' }}>
      {/* Center Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        {/* Header Section */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer transition-all hover:scale-110 hover:bg-primary/10"
              onClick={handleLogoClick}
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
              <Sparkles className={`w-6 h-6 text-primary transition-transform ${isHoveringLogo ? 'scale-110' : ''}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-600">Vibe Hiring</h1>
              <p className="text-muted-foreground mt-1">
                {hasSubmitted 
                  ? "Review your job description template below" 
                  : "Describe your ideal candidate or upload a job offer to find the perfect match"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area with Sidebar */}
        <div className="flex-1 overflow-hidden relative">
          {/* Chat History Sidebar - positioned below header */}
          <div
            className={`absolute left-0 top-0 bottom-0 z-50 bg-background border-r shadow-lg transition-transform duration-300 ease-in-out ${
              isChatHistoryOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: '240px' }}
            onMouseEnter={() => {
              // Keep sidebar open when hovering over it
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
                hoverTimeoutRef.current = null
              }
            }}
            onMouseLeave={handleSidebarLeave}
          >
          <div className="h-full flex flex-col">
            <div className="px-3 py-2.5 border-b">
              <button
                className="w-full px-2 py-1.5 cursor-pointer text-xs text-foreground border border-border rounded hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
                onClick={handleNewChat}
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>
            </div>
            
            {/* Navigation Items */}
            <div className="px-3 py-1 border-b">
              <div className="space-y-0.5">
                <div className="px-2 py-1 cursor-pointer text-xs text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 rounded">
                  <Search className="w-3.5 h-3.5" />
                  Search
                </div>
                <div className="px-2 py-1 cursor-pointer text-xs text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 rounded">
                  <Folder className="w-3.5 h-3.5" />
                  Projects
                </div>
                <div className="px-2 py-1 cursor-pointer text-xs text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 rounded">
                  <Clock className="w-3.5 h-3.5" />
                  Recent Chats
                </div>
                <div className="px-2 py-1 cursor-pointer text-xs text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 rounded">
                  <Layers className="w-3.5 h-3.5" />
                  Design Systems
                </div>
                <div className="px-2 py-1 cursor-pointer text-xs text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 rounded">
                  <Globe className="w-3.5 h-3.5" />
                  Templates
                </div>
              </div>
            </div>
            
            <div className="px-3 py-3 border-b">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent Chats
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recentChats.length === 0 ? (
                <div className="text-center py-6 px-3">
                  <p className="text-xs text-muted-foreground">No recent chats</p>
                </div>
              ) : (
                <div className="py-0.5">
                  {recentChats.map((chat, index) => (
                    <div
                      key={chat.id}
                      className="px-3 py-1 cursor-pointer text-xs text-muted-foreground hover:bg-muted/50 transition-colors group"
                      onClick={() => handleLoadChat(chat)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">{chat.title}</span>
                        {index === 0 && (
                          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs">⋯</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{ paddingBottom: !hasSubmitted ? '200px' : '1rem' }}>
          {!hasSubmitted ? (
            // Initial state - show prompt cues
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">How can I help you find talent?</h2>
                <p className="text-muted-foreground">Try one of these prompts or upload a job offer</p>
              </div>

              {/* Prompt Cues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {promptCues.map((cue, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handlePromptClick(cue)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{cue}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Show JD Template
            <div className="max-w-4xl mx-auto space-y-6">
              {isLoading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                      <p className="text-muted-foreground">Generating your job description...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : jobOffer ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                      <span>Job Description Template</span>
                      {jobOffer && (
                        <Button
                          size="sm"
                          onClick={handleCreateCampaign}
                          disabled={isCreatingCampaign}
                        >
                          {isCreatingCampaign ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Campaign
                            </>
                          )}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6 max-h-[600px] overflow-y-auto">
                      {(() => {
                        const { core, enrichment, advanced } = jobOffer
                        
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
                            {(enrichment.education_requirements.length > 0 || (advanced.equity_bonus_info && advanced.equity_bonus_info !== "N/A")) && (
                              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-900">Additional Information</h4>
                                {enrichment.education_requirements.length > 0 && (
                                  <div>
                                    <span className="text-sm font-medium text-blue-800">Education: </span>
                                    <span className="text-sm text-blue-700">{enrichment.education_requirements.join(', ')}</span>
                                  </div>
                                )}
                                {advanced.equity_bonus_info && advanced.equity_bonus_info !== "N/A" && (
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
                          </>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </div>

          {/* Input Area - Only show if not submitted yet */}
          {!hasSubmitted && (
          <div className="border-t px-6 py-4 absolute bottom-4 left-0 right-0 bg-background">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "upload" | "paste")}>
            <TabsList className="mb-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="upload">Upload Job Offer</TabsTrigger>
              <TabsTrigger value="paste">Paste Job Offer</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type something like: I'm looking for a data scientist in Paris with 8+ years..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[80px] w-[80px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a job offer file (PDF or TXT)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Choose File
                </Button>
              </div>
              {jobOfferText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Job Offer Loaded</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setJobOfferText("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={jobOfferText}
                    onChange={(e) => setJobOfferText(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!jobOfferText.trim() || isLoading}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Job Offer
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paste" className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePasteJobOffer}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Paste from Clipboard
                </Button>
                <Textarea
                  placeholder="Paste your job offer here..."
                  value={jobOfferText}
                  onChange={(e) => setJobOfferText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              {jobOfferText && (
                <Button
                  onClick={handleSendMessage}
                  disabled={!jobOfferText.trim() || isLoading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Job Offer
                </Button>
              )}
            </TabsContent>
          </Tabs>
          </div>
          )}
        </div>
      </div>

      {/* AI Panel - fixed to viewport - only show after first submission */}
      {shouldShowPanel && (
      <div className="hidden md:block fixed right-0 top-0 bottom-0 z-30">
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
          campaigns={campaigns}
          candidates={candidates}
          activeTab={hasSubmitted ? "ai-chat" : undefined}
          onActiveTabChange={(tab) => {
            if (hasSubmitted && tab === "ai-chat") {
              // Ensure chat tab is active when chat is moved to panel
            }
          }}
          initialMessage={initialChatMessage}
          onInitialMessageSent={() => {
            // Clear initial message after it's sent
            setInitialChatMessage(null)
          }}
        />
      </div>
      )}
    </div>
  )
}

