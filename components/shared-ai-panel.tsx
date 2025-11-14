"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
  Send,
  X,
  Download,
  ThumbsUp,
  ThumbsDown,
  MoveRight,
  Check,
  ChevronsUpDown,
  Plus,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RightPanelCampaign {
  id: string
  title: string
  company: string
  location: string
  contractType: string
  skills: string[]
  salary: string
  created: string
  updated: string
}

interface RightPanelCandidate {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  company?: string
  location?: string
  skills?: string[]
  linkedinUrl?: string
  campaignId: string
  campaignTitle: string
}

interface SharedAIPanelProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  selectedContextCandidate: string | null
  setSelectedContextCandidate: (id: string | null) => void
  selectedContextCampaign: string | null
  setSelectedContextCampaign: (id: string | null) => void
  selectedProfileView: string | null
  setSelectedProfileView: (id: string | null) => void
  selectedCampaignView: string | null
  setSelectedCampaignView: (id: string | null) => void
  campaigns: RightPanelCampaign[]
  candidates: RightPanelCandidate[]
  activeTab?: string
  onActiveTabChange?: (tab: string) => void
  selectedCandidateDetails?: any
  onCloseProfile?: () => void
  initialMessage?: string | null
  onInitialMessageSent?: () => void
}

export default function SharedAIPanel({
  isCollapsed,
  onToggleCollapse,
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
  activeTab = "ai-chat",
  onActiveTabChange,
  selectedCandidateDetails,
  onCloseProfile,
  initialMessage,
  onInitialMessageSent,
}: SharedAIPanelProps) {
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ id: string; content: string; sender: "user" | "ai" }>
  >([])
  const [aiChatInput, setAiChatInput] = useState("")
  const [isAiChatLoading, setIsAiChatLoading] = useState(false)

  const [profileTabView, setProfileTabView] = useState("fit")
  const [campaignComboOpen, setCampaignComboOpen] = useState(false)
  const [candidateComboOpen, setCandidateComboOpen] = useState(false)
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false)
  const [fitTabNotes, setFitTabNotes] = useState<string[]>([])
  const [newNoteText, setNewNoteText] = useState("")
  const [isResumeExpanded, setIsResumeExpanded] = useState(false)

  const [chatMode, setChatMode] = useState<"ask" | "copilot">("ask")

  const [allCampaigns, setAllCampaigns] = useState<RightPanelCampaign[]>([])
  const [allCandidates, setAllCandidates] = useState<RightPanelCandidate[]>([])
  const [isLoadingLists, setIsLoadingLists] = useState(false)

  // Initial message
  useEffect(() => {
    if (initialMessage && !hasSentInitialMessage && activeTab === "ai-chat") {
      setHasSentInitialMessage(true)

      const sendInitial = async () => {
        const userMsg = {
          id: Date.now().toString(),
          content: initialMessage,
          sender: "user" as const,
        }
        setAiChatMessages((prev) => [...prev, userMsg])
        setIsAiChatLoading(true)

        try {
          const response = await fetch("/api/chat-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: initialMessage,
              mode: chatMode,
              context: {
                campaign: selectedContextCampaign
                  ? campaigns.find((c) => c.id === selectedContextCampaign)
                  : null,
                candidate: selectedContextCandidate
                  ? candidates.find((c) => c.id === selectedContextCandidate)
                  : null,
              },
              schema: buildSchema(),
            }),
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(
              data.detail || data.error || data.message || `Server returned ${response.status} error`,
            )
          }

          const aiMsg = {
            id: (Date.now() + 1).toString(),
            content:
              data.answer ||
              data.response ||
              "I received your message but couldn't generate a proper response.",
            sender: "ai" as const,
          }
          setAiChatMessages((prev) => [...prev, aiMsg])
        } catch (err: any) {
          const msg =
            err?.message && typeof err.message === "string"
              ? err.message
              : "Unknown error occurred"
          setAiChatMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              content: `Sorry, the AI service encountered an issue: ${
                msg.length > 100 ? msg.slice(0, 100) + "..." : msg
              }`,
              sender: "ai",
            },
          ])
        } finally {
          setIsAiChatLoading(false)
          onInitialMessageSent && onInitialMessageSent()
        }
      }

      sendInitial()
    }
  }, [
    initialMessage,
    hasSentInitialMessage,
    activeTab,
    campaigns,
    candidates,
    selectedContextCampaign,
    selectedContextCandidate,
    onInitialMessageSent,
    chatMode,
  ])

  // Fetch campaigns + candidates
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingLists(true)
      try {
        // Campaigns
        const campaignsRes = await fetch("/api/campaigns-proxy", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          if (campaignsData.success && Array.isArray(campaignsData.data)) {
            setAllCampaigns(
              campaignsData.data.map((camp: any) => ({
                id: camp.campaign_id,
                title: camp.job?.title || "Untitled Campaign",
                company: camp.job?.company || "",
                location: camp.job?.location || "",
                contractType: camp.job?.contract || "",
                skills: camp.job?.skills?.map((s: any) => s.name) || [],
                salary:
                  camp.job?.salary_min && camp.job?.salary_max
                    ? `${camp.job.salary_min}k - ${camp.job.salary_max}k ${camp.job.salary_currency}`
                    : "Not specified",
                created: camp.created_at || "",
                updated: camp.updated_at || "",
              })),
            )
          }
        }

        // Candidates
        const candidatesRes = await fetch("/api/candidates", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })
        if (candidatesRes.ok) {
          const candidatesData = await candidatesRes.json()
          const rawList = Array.isArray(candidatesData)
            ? candidatesData
            : candidatesData.candidates || candidatesData.data || []
          if (Array.isArray(rawList)) {
            setAllCandidates(
              rawList.map((cand: any) => ({
                id: cand.email || cand.id || `candidate-${Math.random()}`,
                name: cand.name || "Unknown",
                email: cand.email || "",
                phone: cand.phone || "",
                title:
                  cand.experience?.[0]?.title ||
                  cand.experience?.[0]?.name ||
                  "",
                company: cand.experience?.[0]?.company || "",
                location: cand.country || cand.address || "",
                skills: Array.isArray(cand.skills) ? cand.skills : [],
                linkedinUrl: cand.profile_url || "",
                campaignId: "",
                campaignTitle: "",
              })),
            )
          }
        }
      } catch (e) {
        console.error("Error fetching lists:", e)
      } finally {
        setIsLoadingLists(false)
      }
    }

    fetchAllData()
  }, [])

  // Chat handler
  const handleAiChat = async (message: string) => {
    if (!message.trim()) return

    const userMsg = {
      id: Date.now().toString(),
      content: message,
      sender: "user" as const,
    }
    setAiChatMessages((prev) => [...prev, userMsg])
    setIsAiChatLoading(true)
    setAiChatInput("")

    try {
      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: message,
          mode: chatMode,
          context: {
            campaign: selectedContextCampaign
              ? campaigns.find((c) => c.id === selectedContextCampaign)
              : null,
            candidate: selectedContextCandidate
              ? candidates.find((c) => c.id === selectedContextCandidate)
              : null,
          },
          schema: buildSchema(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const msg =
          data.detail || data.error || data.message || `Server returned ${response.status} error`
        throw new Error(msg)
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        content:
          data.answer ||
          data.response ||
          "I received your message but couldn't generate a proper response.",
        sender: "ai" as const,
      }
      setAiChatMessages((prev) => [...prev, aiMsg])
    } catch (err: any) {
      const raw = err?.message || "Unknown error occurred"
      const isNetwork = raw.includes("fetch") || raw.includes("network")
      const isSyntax =
        raw.includes("SyntaxError") || raw.includes("Neo.ClientError")

      let friendly = ""
      if (isNetwork) {
        friendly =
          "Sorry, I'm having trouble connecting right now. Please try again in a moment."
      } else if (isSyntax) {
        friendly =
          "I had trouble understanding that. Try recruitment-focused questions like:\n• 'How many candidates fit this role?'\n• 'Who matches this campaign best?'\n• 'What skills should I look for?'"
      } else {
        friendly = `Sorry, the AI service encountered an issue: ${
          raw.length > 100 ? raw.slice(0, 100) + "..." : raw
        }`
      }

      setAiChatMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), content: friendly, sender: "ai" },
      ])
    } finally {
      setIsAiChatLoading(false)
    }
  }

  return (
    <div
      className={`${
        isCollapsed ? "w-12" : "w-96"
      } h-full bg-white transition-all duration-300 flex flex-col shadow-lg border-l border-border min-h-0 rounded-l-3xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-primary">
        {!isCollapsed && (
          <h3 className="font-semibold text-primary-foreground">
            AI Copilot
          </h3>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 ml-auto hover:bg-primary/90 text-primary-foreground"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Context selection */}
          <div className="p-3 border-b border-border bg-muted space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Campaign Context */}
              <div>
                <Label className="text-xs mb-1 block">Campaign Context</Label>
                <Popover open={campaignComboOpen} onOpenChange={setCampaignComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={campaignComboOpen}
                      className="w-full justify-between h-8 text-xs font-normal"
                      disabled={isLoadingLists}
                    >
                      {isLoadingLists
                        ? "Loading..."
                        : selectedContextCampaign
                        ? allCampaigns.find((c) => c.id === selectedContextCampaign)?.title ||
                          "Select..."
                        : "All Campaigns"}
                      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search campaigns..."
                        className="h-8 text-xs"
                      />
                      <CommandEmpty className="text-xs py-2 text-center">
                        {isLoadingLists ? "Loading..." : "No campaign found."}
                      </CommandEmpty>
                      <CommandGroup className="max-h-[220px] overflow-auto">
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedContextCampaign(null)
                            setCampaignComboOpen(false)
                          }}
                          className="text-xs"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3",
                              !selectedContextCampaign
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          All Campaigns
                        </CommandItem>
                        {allCampaigns.map((campaign) => (
                          <CommandItem
                            key={campaign.id}
                            value={`${campaign.title} ${campaign.company}`}
                            onSelect={() => {
                              setSelectedContextCampaign(campaign.id)
                              setCampaignComboOpen(false)
                            }}
                            className="text-xs"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3 w-3",
                                selectedContextCampaign === campaign.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col overflow-hidden">
                              <span className="truncate">{campaign.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {campaign.company}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Candidate Context */}
              <div>
                <Label className="text-xs mb-1 block">Candidate Context</Label>
                <Popover open={candidateComboOpen} onOpenChange={setCandidateComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={candidateComboOpen}
                      className="w-full justify-between h-8 text-xs font-normal"
                      disabled={isLoadingLists}
                    >
                      {isLoadingLists
                        ? "Loading..."
                        : selectedContextCandidate
                        ? allCandidates.find((c) => c.id === selectedContextCandidate)
                            ?.name || "Select..."
                        : "All Candidates"}
                      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search candidates..."
                        className="h-8 text-xs"
                      />
                      <CommandEmpty className="text-xs py-2 text-center">
                        {isLoadingLists ? "Loading..." : "No candidate found."}
                      </CommandEmpty>
                      <CommandGroup className="max-h-[220px] overflow-auto">
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedContextCandidate(null)
                            setCandidateComboOpen(false)
                          }}
                          className="text-xs"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3",
                              !selectedContextCandidate
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          All Candidates
                        </CommandItem>
                        {allCandidates.map((candidate) => (
                          <CommandItem
                            key={candidate.id}
                            value={`${candidate.name} ${candidate.email} ${candidate.title}`}
                            onSelect={() => {
                              setSelectedContextCandidate(candidate.id)
                              setCandidateComboOpen(false)
                            }}
                            className="text-xs"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3 w-3",
                                selectedContextCandidate === candidate.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col overflow-hidden">
                              <span className="truncate">{candidate.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {candidate.title || candidate.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={onActiveTabChange}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            <TabsList className="grid w-full grid-cols-3 mx-3 mt-2 mb-1 bg-muted border border-border">
              <TabsTrigger
                value="ai-chat"
                className="data-[state=active]:text-white text-muted-foreground"
                style={{
                  background:
                    activeTab === "ai-chat"
                      ? "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)"
                      : "transparent",
                }}
              >
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:text-white text-muted-foreground"
                style={{
                  background:
                    activeTab === "profile"
                      ? "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)"
                      : "transparent",
                }}
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="campaign"
                className="data-[state=active]:text-white text-muted-foreground"
                style={{
                  background:
                    activeTab === "campaign"
                      ? "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)"
                      : "transparent",
                }}
              >
                Campaign
              </TabsTrigger>
            </TabsList>

            {/* Mode toggle */}
            <div className="px-3 pb-2 flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground">Mode</span>
              <div className="flex gap-1">
                <Button
                  variant={chatMode === "ask" ? "default" : "outline"}
                  size="sm"
                  className={`h-6 text-[10px] px-2 ${
                    chatMode === "ask"
                      ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0"
                      : "bg-transparent"
                  }`}
                  onClick={() => {
                    if (chatMode !== "ask") {
                      setChatMode("ask")
                      setAiChatMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          content:
                            "Ask Mode: I'll answer questions without changing your setup.",
                          sender: "ai",
                        },
                      ])
                    }
                  }}
                >
                  Ask
                </Button>
                <Button
                  variant={chatMode === "copilot" ? "default" : "outline"}
                  size="sm"
                  className={`h-6 text-[10px] px-2 ${
                    chatMode === "copilot"
                      ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0"
                      : "bg-transparent"
                  }`}
                  onClick={() => {
                    if (chatMode !== "copilot") {
                      setChatMode("copilot")
                      setAiChatMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          content:
                            "Co-Pilot Mode: I’ll use your requests to drive candidate ranking, filters, and campaigns.",
                          sender: "ai",
                        },
                      ])
                    }
                  }}
                >
                  Co-Pilot
                </Button>
              </div>
            </div>

            {/* CHAT TAB - scrollable messages, input pinned */}
            <TabsContent
              value="ai-chat"
              className="flex-1 mt-0 px-3 data-[state=inactive]:hidden flex flex-col overflow-hidden"
            >
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Messages area - scrollable */}
                <ScrollArea className="flex-1 min-h-0">
                  {/* Suggestions (only when no messages) */}
                  {aiChatMessages.length === 0 && !isAiChatLoading && (
                    <div className="p-4 border-b border-border bg-muted">
                      <p className="text-xs text-foreground mb-3 font-medium">
                        Try asking:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-start">
                        {[
                          "How many candidates are in the database?",
                          "Show me all available jobs and their requirements.",
                          "What skills are most commonly required across jobs?",
                          "Which candidates have machine learning experience?",
                          "Show me jobs in Paris with high salaries.",
                          "Find candidates who speak multiple languages.",
                        ].map((s, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 border-border text-muted-foreground hover:bg-accent hover:border-accent hover:text-accent-foreground bg-transparent break-all max-w-full text-left"
                            style={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              textAlign: "left",
                            }}
                            onClick={() => {
                              setAiChatInput(s)
                              handleAiChat(s)
                            }}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="space-y-4 p-4">
                    {aiChatMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${
                          m.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                            m.sender === "user"
                              ? "text-white"
                              : "bg-card border"
                          }`}
                          style={
                            m.sender === "user"
                              ? {
                                  background:
                                    "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)",
                                }
                              : {}
                          }
                        >
                          <p className="text-xs whitespace-pre-line">
                            {m.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isAiChatLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] rounded-lg p-3 shadow-sm bg-card border">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-xs text-muted-foreground">
                              Hazel is typing...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input fixed at bottom */}
                <div className="flex-shrink-0 bg-background border-t border-border px-3 pb-3 pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about jobs, candidates, or skills..."
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      disabled={isAiChatLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          if (aiChatInput.trim() && !isAiChatLoading) {
                            handleAiChat(aiChatInput)
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAiChat(aiChatInput)}
                      size="sm"
                      disabled={isAiChatLoading || !aiChatInput.trim()}
                      className="text-white border-0"
                      style={{
                        background:
                          "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)",
                      }}
                    >
                      {isAiChatLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* PROFILE TAB (unchanged from your working version) */}
            <TabsContent
              value="profile"
              className="flex-1 mt-0 overflow-hidden flex flex-col data-[state=inactive]:hidden"
            >
              {selectedCandidateDetails ? (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Header */}
                  <div className="flex-shrink-0 bg-card border-b border-border">
                    <div className="p-3">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-primary/20">
                          <AvatarImage
                            src={selectedCandidateDetails.profile_pic_url || undefined}
                            alt={selectedCandidateDetails.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <AvatarFallback className="text-sm bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold w-full h-full flex items-center justify-center">
                            {selectedCandidateDetails.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "CN"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-semibold text-foreground truncate">
                              {selectedCandidateDetails.name}
                            </h2>
                            {selectedCandidateDetails.profile_url && (
                              <a
                                href={selectedCandidateDetails.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                                  alt="LinkedIn"
                                  className="h-4 w-4"
                                />
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-auto flex-shrink-0"
                              onClick={() => {
                                onActiveTabChange && onActiveTabChange("ai-chat")
                                setSelectedProfileView(null)
                                setSelectedContextCandidate(null)
                                onCloseProfile && onCloseProfile()
                              }}
                              title="Close profile"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {(selectedCandidateDetails.currentTitle ||
                            selectedCandidateDetails.currentCompany) && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Briefcase className="h-3 w-3" />
                              {selectedCandidateDetails.currentTitle &&
                              selectedCandidateDetails.currentCompany
                                ? `${selectedCandidateDetails.currentTitle} at ${selectedCandidateDetails.currentCompany}`
                                : selectedCandidateDetails.currentTitle ||
                                  selectedCandidateDetails.currentCompany}
                            </p>
                          )}

                          {(selectedCandidateDetails.address ||
                            selectedCandidateDetails.status) && (
                            <div className="flex items-center gap-2 mb-2">
                              {selectedCandidateDetails.address && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {selectedCandidateDetails.address}
                                </p>
                              )}
                              {selectedCandidateDetails.status && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {selectedCandidateDetails.status}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="space-y-1 pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">
                                {selectedCandidateDetails.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">
                                {selectedCandidateDetails.phone || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inner tabs for profile */}
                  <div className="flex-shrink-0 border-b border-border px-3 pt-2">
                    <Tabs
                      value={profileTabView}
                      onValueChange={setProfileTabView}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-5 h-8 bg-muted">
                        {["fit", "messages", "resume", "notes", "activity"].map((val) => (
                          <TabsTrigger
                            key={val}
                            value={val}
                            className="text-xs data-[state=active]:text-white"
                            style={{
                              background:
                                profileTabView === val
                                  ? "linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)"
                                  : "transparent",
                            }}
                          >
                            {val === "fit"
                              ? "Fit"
                              : val === "messages"
                              ? "Messages"
                              : val === "resume"
                              ? "Resume"
                              : val === "notes"
                              ? "Interviews"
                              : "Activity"}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Profile tab content */}
                  <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* FIT */}
                    {profileTabView === "fit" && (
                      <>
                        <ScrollArea
                          className="flex-1 px-3 py-4"
                          style={{ paddingBottom: "80px" }}
                        >
                          <div className="space-y-4">
                            {/* Score */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">
                                  Overall Score
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl font-bold text-primary">
                                    {selectedCandidateDetails.score || 85}%
                                  </div>
                                  <div className="flex-1">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${
                                            selectedCandidateDetails.score || 85
                                          }%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Skills */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">
                                  Skills Breakdown
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {(selectedCandidateDetails.skills || [
                                    "Python",
                                    "React",
                                    "AWS",
                                    "PostgreSQL",
                                  ]).map(
                                    (skill: string | any, index: number) => {
                                      const skillName =
                                        typeof skill === "string"
                                          ? skill
                                          : skill?.name ||
                                            skill?.title ||
                                            `Skill ${index}`
                                      return (
                                        <div
                                          key={`skill-${index}-${skillName}`}
                                          className="flex items-center justify-between"
                                        >
                                          <span className="text-xs font-medium">
                                            {skillName}
                                          </span>
                                          <div className="w-12 bg-muted rounded h-1.5">
                                            <div
                                              className="h-1.5 rounded"
                                              style={{
                                                width: "85%",
                                                backgroundColor: "#e8f5d9",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )
                                    },
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Salary */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">
                                  Salary Fit
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-xs space-y-1">
                                <p>
                                  Expected:{" "}
                                  <span className="font-semibold">
                                    {selectedCandidateDetails.salary ||
                                      "$100k - $130k"}
                                  </span>
                                </p>
                                <p className="text-muted-foreground">
                                  Within budget range
                                </p>
                              </CardContent>
                            </Card>

                            {/* Notes */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center justify-between">
                                  Notes
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => {
                                      if (newNoteText.trim()) {
                                        setFitTabNotes([
                                          ...fitTabNotes,
                                          newNoteText,
                                        ])
                                        setNewNoteText("")
                                      }
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add Note
                                  </Button>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {fitTabNotes.length > 0 && (
                                  <div className="space-y-2">
                                    {fitTabNotes.map((note, index) => (
                                      <div
                                        key={index}
                                        className="p-2 bg-muted rounded text-xs border"
                                      >
                                        <p className="text-xs">
                                          {note}
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs mt-1 text-muted-foreground"
                                          onClick={() =>
                                            setFitTabNotes(
                                              fitTabNotes.filter(
                                                (_, i) =>
                                                  i !== index,
                                              ),
                                            )
                                          }
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Remove
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Add a note..."
                                    value={newNoteText}
                                    onChange={(e) =>
                                      setNewNoteText(
                                        e.target.value,
                                      )
                                    }
                                    className="text-xs min-h-[60px] resize-none"
                                    rows={3}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </ScrollArea>

                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-background border-t">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1 bg-transparent h-8 text-xs"
                            >
                              <ThumbsDown className="h-3 w-3" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1 bg-transparent h-8 text-xs"
                            >
                              <MoveRight className="h-3 w-3" />
                              Move
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 gap-1 h-8 text-xs"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* MESSAGES */}
                    {profileTabView === "messages" && (
                      <ScrollArea className="flex-1 px-3 py-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">
                              Messages
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              Conversation history and AI drafts will appear here.
                            </p>
                          </CardContent>
                        </Card>
                      </ScrollArea>
                    )}

                    {/* RESUME */}
                    {profileTabView === "resume" && (
                      <ScrollArea className="flex-1 px-3 py-4">
                        <Card className="border-2 border-primary/20 shadow-md">
                          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-primary" />
                                Resume
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 bg-transparent h-7 text-xs border-primary/30 hover:bg-primary/10"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            {/* Keep your existing fake PDF preview / resume UI here */}
                          </CardContent>
                        </Card>
                      </ScrollArea>
                    )}

                    {/* NOTES */}
                    {profileTabView === "notes" && (
                      <ScrollArea className="flex-1 px-3 py-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">
                              Interviews
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <textarea
                              className="w-full p-2 border rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                              rows={8}
                              placeholder="Add interview notes..."
                              defaultValue={
                                selectedCandidateDetails.notes ||
                                ""
                              }
                            />
                          </CardContent>
                        </Card>
                      </ScrollArea>
                    )}

                    {/* ACTIVITY */}
                    {profileTabView === "activity" && (
                      <ScrollArea className="flex-1 px-3 py-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">
                              Activity Log
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-xs">
                              <p className="text-muted-foreground">
                                Recent candidate activity will appear here.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Select Candidate to View
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Click a candidate in the pipeline to open their profile here.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* CAMPAIGN TAB (unchanged) */}
            <TabsContent
              value="campaign"
              className="flex-1 mt-0 px-3 overflow-hidden data-[state=inactive]:hidden"
            >
              {selectedCampaignView ? (
                <div className="space-y-4 max-w-full overflow-hidden">
                  <Card className="mx-0 max-w-full">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Campaign Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 overflow-hidden">
                      {(() => {
                        const campaign = campaigns.find(
                          (c) => c.id === selectedCampaignView,
                        )
                        if (!campaign)
                          return (
                            <p className="text-xs text-muted-foreground">
                              Campaign not found.
                            </p>
                          )

                        return (
                          <>
                            <p className="truncate text-xs">
                              <span className="font-medium">Title:</span>{" "}
                              {campaign.title}
                            </p>
                            <p className="truncate text-xs">
                              <span className="font-medium">Company:</span>{" "}
                              {campaign.company}
                            </p>
                            <p className="truncate text-xs">
                              <span className="font-medium">Location:</span>{" "}
                              {campaign.location}
                            </p>
                            <p className="truncate text-xs">
                              <span className="font-medium">Contract:</span>{" "}
                              {campaign.contractType}
                            </p>
                            <p className="truncate text-xs">
                              <span className="font-medium">Salary:</span>{" "}
                              {campaign.salary}
                            </p>
                            <div>
                              <span className="font-medium text-xs">
                                Skills:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                                {campaign.skills.map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-[10px] px-1 py-0 shrink-0"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-4 max-w-full overflow-hidden">
                  <Card className="mx-0 max-w-full">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Select Campaign to View
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedCampaignView || ""}
                        onValueChange={(value) =>
                          setSelectedCampaignView(
                            value || null,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a campaign to analyze" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((campaign) => (
                            <SelectItem
                              key={campaign.id}
                              value={campaign.id}
                            >
                              {campaign.title} -{" "}
                              {campaign.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function buildSchema() {
  return {
    nodes: {
      Candidate: {
        properties: [
          "name",
          "email",
          "lastUpdated",
          "raw_json",
          "phone",
          "summary",
          "certifications",
          "links",
          "address",
          "created",
        ],
        relationships: ["HAS_SKILL", "WORKED_AT", "SPEAKS_LANGUAGE", "ATTENDED"],
      },
      CV: {
        properties: ["id", "updated_at", "text", "embedding"],
        relationships: [],
      },
      Skill: {
        properties: ["name", "expertise"],
        relationships: [],
      },
      Job: {
        properties: [
          "location",
          "company",
          "title",
          "remote",
          "description",
          "company_name",
          "created",
          "title_norm",
          "company_norm",
          "location_norm",
          "lastSeen",
          "lastUpdated",
          "work_mode",
          "company_desc",
          "seniority_tags",
          "education",
          "travel",
          "application_steps",
          "job_function",
          "industry_sector",
          "remote_time_zone",
          "equity_info",
          "team_size",
          "department",
          "recruiter",
          "contract_type",
          "salary_min",
          "salary_max",
          "seniority_level",
          "salary_currency",
          "job_description",
          "application_link",
        ],
        relationships: [
          "HAS_RESPONSIBILITY",
          "REQUIRES",
          "HAS_REQUIREMENT",
          "REQUIRES_SKILL",
          "SPEAKS_LANGUAGE",
          "OFFERS_BENEFIT",
        ],
      },
      Requirement: { properties: ["text", "level"], relationships: [] },
      Experience: {
        properties: [
          "company",
          "title",
          "years",
          "description",
          "start_date",
          "end_date",
        ],
        relationships: [],
      },
      Responsibility: { properties: ["text"], relationships: [] },
      Campaign: {
        properties: ["id", "created", "linkKey", "lastUpdated", "raw_json"],
        relationships: ["FOR_CAMPAIGN", "HAS_SPEC"],
      },
      JobSpec: {
        properties: ["id", "description", "created"],
        relationships: ["HAS_RESPONSIBILITY", "HAS_REQUIREMENT", "FOR_JOB"],
      },
      Language: { properties: ["name", "proficiency"], relationships: [] },
      Benefit: { properties: ["text"], relationships: [] },
      University: { properties: ["name"], relationships: [] },
    },
    relationships: [
      "(:Candidate)-[:HAS_SKILL]->(:Skill)",
      "(:Candidate)-[:WORKED_AT]->(:Experience)",
      "(:Candidate)-[:SPEAKS_LANGUAGE]->(:Language)",
      "(:Candidate)-[:ATTENDED {degree, field, start_date, end_date}]->(:University)",
      "(:Job)-[:HAS_RESPONSIBILITY]->(:Responsibility)",
      "(:Job)-[:REQUIRES]->(:Requirement)",
      "(:Job)-[:HAS_REQUIREMENT]->(:Requirement)",
      "(:Job)-[:REQUIRES_SKILL]->(:Skill)",
      "(:Job)-[:SPEAKS_LANGUAGE]->(:Language)",
      "(:Job)-[:OFFERS_BENEFIT]->(:Benefit)",
      "(:Campaign)-[:FOR_CAMPAIGN]->(:Job)",
      "(:Campaign)-[:HAS_SPEC]->(:JobSpec)",
      "(:JobSpec)-[:HAS_RESPONSIBILITY]->(:Responsibility)",
      "(:JobSpec)-[:HAS_REQUIREMENT]->(:Requirement)",
      "(:JobSpec)-[:FOR_JOB]->(:Job)",
    ],
  }
}
