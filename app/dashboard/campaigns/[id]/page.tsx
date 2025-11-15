"use client"

import { useState, useEffect } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  LogOut,
  Settings,
  BarChart3,
  MessageSquare,
  Briefcase,
  Users,
  RefreshCw,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"
import { OverviewTab } from "@/components/campaign/overview-tab"
import { CandidatePipelineTab } from "@/components/campaign/candidate-pipeline-tab"
import { InboxTab } from "@/components/campaign/inbox-tab"
import { PreQuestionsTab } from "@/components/campaign/pre-questions-tab"
import { JDTab } from "@/components/campaign/jd-tab"
import { ScreeningTab } from "@/components/campaign/screening-tab"
import { SourcingTab } from "@/components/campaign/sourcing-tab"
import SharedAIPanel from "@/components/shared-ai-panel"
import { useAIPanel } from "@/components/ai-panel-context"

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

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const campaignId = params.id

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [aiPanelTab, setAiPanelTab] = useState<"ai-chat" | "profile">("ai-chat")
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sourcingNewQuery, setSourcingNewQuery] = useState<string>("")

  // Fetch this campaign
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch("/api/campaigns-proxy")
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()

        if (result?.success && Array.isArray(result.data)) {
          const found = result.data.find(
            (c: Campaign) => c.campaign_id === campaignId,
          )
          setCampaign(found || null)
        }
      } catch (err) {
        console.error("Error fetching campaign:", err)
        setCampaign(null)
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) fetchCampaign()
  }, [campaignId])

  // Deep link to JD
  useEffect(() => {
    const savedTab = sessionStorage.getItem("campaignTab")
    if (savedTab === "jd") {
      setActiveTab("jd")
      sessionStorage.removeItem("campaignTab")
    }
  }, [])

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
    campaigns: rightPanelCampaigns,
    candidates: rightPanelCandidates,
  } = useAIPanel()

  const campaignTitle =
    campaign?.job.title || (loading ? "Loading campaign..." : "Campaign")
  const campaignCompany =
    campaign?.job.company || (loading ? "" : "Confidential")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    // Only reset AI panel when leaving candidate-focused tabs
    if (tab !== "candidate-pipeline" && tab !== "sourcing" && tab !== "screening") {
      setSelectedCandidate(null)
      setAiPanelTab("ai-chat")
      setSelectedContextCandidate(null)
      setSelectedProfileView(null)
    }
  }

  const handleCandidateClick = (candidate: any) => {
    if (selectedCandidate?.id === candidate.id) {
      // toggle off
      setSelectedCandidate(null)
      setAiPanelTab("ai-chat")
      setSelectedContextCandidate(null)
      setSelectedProfileView(null)
    } else {
      setSelectedCandidate(candidate)
      setAiPanelTab("profile")

      // wire candidate into global AI panel context
      if (candidate?.id != null) {
        const cid = String(candidate.id)
        setSelectedContextCandidate(cid)
        setSelectedProfileView(cid)
      }

      if (campaignId) {
        setSelectedContextCampaign(campaignId)
        setSelectedCampaignView(campaignId)
      }
    }
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar>
        <SidebarHeader className="border-b py-4">
          <div className="flex items-center gap-2 px-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)",
              }}
            >
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-700">
                Hazel AI
              </span>
              <span className="text-xs text-muted-foreground">
                Recruitment Copilot
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <MessageSquare className="h-4 w-4" />
                <span>Message Copilot</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <Briefcase className="h-4 w-4" />
                <span>Brief→Job</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive className="h-10">
                <Briefcase className="h-4 w-4" />
                <span>Recruitment Campaigns</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <Users className="h-4 w-4" />
                <span>Candidates</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarContent className="mt-auto border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-10">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex flex-col">
        <div
          className={`flex flex-1 overflow-hidden ${
            isRightPanelCollapsed ? "mr-12" : "mr-96"
          }`}
        >
          <div
            className="flex-1 flex flex-col min-w-0 overflow-hidden overflow-x-hidden relative"
            style={{
              minWidth: 0,
              background:
                "linear-gradient(135deg, #fafbfc 0%, #f5f7fa 25%, #f0f4f8 50%, #eef2f6 75%, #fafbfc 100%)",
            }}
          >
            <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/campaigns">
                    <Button variant="ghost" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-600">
                      {campaignTitle}
                    </h1>
                    {campaignCompany && (
                      <p className="text-base text-muted-foreground">
                        {campaignCompany}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b flex-shrink-0">
                <div className="px-6 overflow-x-auto">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="candidate-pipeline">
                        Candidate Pipeline
                      </TabsTrigger>
                      <TabsTrigger value="sourcing">
                        Sourcing
                      </TabsTrigger>
                      <TabsTrigger value="screening">
                        Screening
                      </TabsTrigger>
                      <TabsTrigger value="inbox">
                        Inbox
                      </TabsTrigger>
                      <TabsTrigger value="pre-questions">
                        Pre-qualifying Questions
                      </TabsTrigger>
                      <TabsTrigger value="jd">
                        Job Description
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
                <div
                  className={`px-8 py-6 ${
                    isRightPanelCollapsed ? "pr-8" : "pr-20"
                  } text-base w-full overflow-x-hidden`}
                >
                  {activeTab === "overview" && (
                    <OverviewTab
                      onNavigateToTab={setActiveTab}
                      campaignId={campaignId}
                    />
                  )}

                  {activeTab === "candidate-pipeline" && (
                    <CandidatePipelineTab
                      onCandidateClick={handleCandidateClick}
                      selectedCandidateId={selectedCandidate?.id || null}
                      isRightPanelCollapsed={isRightPanelCollapsed}
                      campaignId={campaignId}
                    />
                  )}

                  {activeTab === "sourcing" && <SourcingTab campaignId={campaignId} newQuery={sourcingNewQuery} />}

                  {activeTab === "screening" && (
                    <ScreeningTab
                      campaignId={campaignId}
                      onCandidateClick={handleCandidateClick}
                      selectedCandidateId={selectedCandidate?.id || null}
                      isRightPanelCollapsed={isRightPanelCollapsed}
                    />
                  )}

                  {activeTab === "inbox" && <InboxTab />}
                  {activeTab === "pre-questions" && <PreQuestionsTab />}
                  {activeTab === "jd" && <JDTab campaign={campaign} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI panel */}
        <div className="hidden md:block fixed right-0 top-0 bottom-0 z-30">
          <SharedAIPanel
            isCollapsed={isRightPanelCollapsed}
            onToggleCollapse={() =>
              setIsRightPanelCollapsed(!isRightPanelCollapsed)
            }
            selectedContextCandidate={selectedContextCandidate}
            setSelectedContextCandidate={setSelectedContextCandidate}
            selectedContextCampaign={selectedContextCampaign}
            setSelectedContextCampaign={setSelectedContextCampaign}
            selectedProfileView={selectedProfileView}
            setSelectedProfileView={setSelectedProfileView}
            selectedCampaignView={selectedCampaignView}
            setSelectedCampaignView={setSelectedCampaignView}
            campaigns={rightPanelCampaigns}
            candidates={rightPanelCandidates}
            activeTab={aiPanelTab}
            onActiveTabChange={(tab) =>
              setAiPanelTab(tab === "profile" ? "profile" : "ai-chat")
            }
            selectedCandidateDetails={selectedCandidate}
            onCloseProfile={() => setSelectedCandidate(null)}
            campaignPageTab={activeTab}
            campaignId={campaignId}
            onSourcingQueryUpdate={setSourcingNewQuery}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
