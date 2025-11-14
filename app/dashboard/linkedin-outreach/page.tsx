"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Send,
  Edit3,
  User,
  Building,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  MessageSquare,
  Bot,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Filter,
  X,
} from "lucide-react"
import SharedAIPanel from "@/components/shared-ai-panel"
import { useAIPanel } from "@/components/ai-panel-context"

interface LinkedInProfile {
  id: string
  name: string
  title: string
  company: string
  location: string
  profileUrl: string
  avatar?: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description?: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    year: string
  }>
  skills: string[]
  summary?: string
}

interface Conversation {
  id: string
  profile: LinkedInProfile
  messages: Array<{
    id: string
    content: string
    sender: "user" | "contact"
    timestamp: Date
    status: "sent" | "delivered" | "read"
  }>
  draftMessage?: string
  attachedCampaign?: string
  lastActivity: Date
}

interface Campaign {
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

interface Candidate {
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

export default function LinkedInOutreachPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newLinkedInUrl, setNewLinkedInUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  
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
  const [newConversationMethod, setNewConversationMethod] = useState<"url" | "candidate">("url")
  const [selectedCampaignId, setSelectedCampaignId] = useState("")
  const [selectedCandidateId, setSelectedCandidateId] = useState("")
  const [candidateSearch, setCandidateSearch] = useState("")
  const [conversationFilter, setConversationFilter] = useState("")

  // Mock data for demonstration
  useEffect(() => {
    // Mock campaigns
    setCampaigns([
      {
        id: "1",
        title: "Machine Learning Engineer",
        company: "Outgoing",
        location: "Paris",
        contractType: "Full-time",
        skills: ["Python", "TensorFlow", "ML"],
        salary: "€80,000",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Principal Engineer",
        company: "Jobgether",
        location: "France",
        contractType: "Full-time",
        skills: ["React", "Node.js", "AWS"],
        salary: "€90,000",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      {
        id: "3",
        title: "CTO - Data & Tech",
        company: "Leopa",
        location: "Paris",
        contractType: "Full-time",
        skills: ["Leadership", "Strategy", "Tech"],
        salary: "€120,000",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    ])

    // Mock candidates from campaigns
    setCandidates([
      {
        id: "c1",
        name: "Alice Martin",
        email: "alice.martin@email.com",
        title: "ML Engineer",
        company: "DataCorp",
        location: "Paris",
        skills: ["Python", "TensorFlow", "PyTorch"],
        linkedinUrl: "https://linkedin.com/in/alice-martin",
        campaignId: "1",
        campaignTitle: "Machine Learning Engineer",
      },
      {
        id: "c2",
        name: "Bob Dubois",
        email: "bob.dubois@email.com",
        title: "Senior Developer",
        company: "TechStart",
        location: "Lyon",
        skills: ["React", "Node.js", "Python"],
        linkedinUrl: "https://linkedin.com/in/bob-dubois",
        campaignId: "1",
        campaignTitle: "Machine Learning Engineer",
      },
      {
        id: "c3",
        name: "Claire Rousseau",
        email: "claire.rousseau@email.com",
        title: "Principal Engineer",
        company: "BigTech",
        location: "Marseille",
        skills: ["AWS", "Kubernetes", "React"],
        linkedinUrl: "https://linkedin.com/in/claire-rousseau",
        campaignId: "2",
        campaignTitle: "Principal Engineer",
      },
      {
        id: "c4",
        name: "David Leroy",
        email: "david.leroy@email.com",
        title: "Tech Lead",
        company: "Innovation Labs",
        location: "Nice",
        skills: ["Leadership", "Architecture", "Cloud"],
        linkedinUrl: "https://linkedin.com/in/david-leroy",
        campaignId: "3",
        campaignTitle: "CTO - Data & Tech",
      },
    ])

    // Mock conversations
    setConversations([
      {
        id: "1",
        profile: {
          id: "1",
          name: "Sarah Johnson",
          title: "Senior ML Engineer",
          company: "TechCorp",
          location: "San Francisco, CA",
          profileUrl: "https://linkedin.com/in/sarah-johnson",
          avatar: "/placeholder-user.jpg",
          experience: [
            {
              title: "Senior ML Engineer",
              company: "TechCorp",
              duration: "2022 - Present",
              description: "Leading ML initiatives for recommendation systems",
            },
            {
              title: "ML Engineer",
              company: "StartupAI",
              duration: "2020 - 2022",
              description: "Developed NLP models for customer service automation",
            },
          ],
          education: [
            {
              school: "Stanford University",
              degree: "MS",
              field: "Computer Science",
              year: "2020",
            },
          ],
          skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "AWS"],
          summary: "Passionate ML engineer with 5+ years of experience in building scalable AI systems.",
        },
        messages: [
          {
            id: "1",
            content: "Hi Sarah, I came across your profile and was impressed by your ML work at TechCorp.",
            sender: "user",
            timestamp: new Date(Date.now() - 86400000),
            status: "read",
          },
          {
            id: "2",
            content: "Thank you for reaching out! I'd be happy to learn more about the opportunity.",
            sender: "contact",
            timestamp: new Date(Date.now() - 43200000),
            status: "read",
          },
        ],
        draftMessage:
          "I'd love to discuss a Machine Learning Engineer position at Outgoing that matches your expertise in recommendation systems. Would you be open to a brief call this week?",
        attachedCampaign: "1",
        lastActivity: new Date(Date.now() - 43200000),
      },
      {
        id: "2",
        profile: {
          id: "2",
          name: "Michael Chen",
          title: "Full Stack Developer",
          company: "InnovateTech",
          location: "New York, NY",
          profileUrl: "https://linkedin.com/in/michael-chen",
          avatar: "/placeholder-user.jpg",
          experience: [
            {
              title: "Full Stack Developer",
              company: "InnovateTech",
              duration: "2021 - Present",
              description: "Building scalable web applications with React and Node.js",
            },
          ],
          education: [
            {
              school: "MIT",
              degree: "BS",
              field: "Computer Science",
              year: "2021",
            },
          ],
          skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
          summary: "Experienced full-stack developer passionate about creating innovative web solutions.",
        },
        messages: [],
        draftMessage:
          "Hi Michael, I noticed your impressive full-stack development experience at InnovateTech. I have an exciting opportunity that would be perfect for your skill set.",
        attachedCampaign: "2",
        lastActivity: new Date(Date.now() - 86400000),
      },
      {
        id: "3",
        profile: {
          id: "3",
          name: "Emma Wilson",
          title: "Tech Lead",
          company: "StartupXYZ",
          location: "London, UK",
          profileUrl: "https://linkedin.com/in/emma-wilson",
          avatar: "/placeholder-user.jpg",
          experience: [
            {
              title: "Tech Lead",
              company: "StartupXYZ",
              duration: "2020 - Present",
              description: "Leading technical teams and architecture decisions",
            },
          ],
          education: [
            {
              school: "Cambridge University",
              degree: "BS",
              field: "Computer Science",
              year: "2019",
            },
          ],
          skills: ["Leadership", "Architecture", "Node.js", "React", "AWS"],
          summary: "Experienced tech lead with strong leadership and technical skills.",
        },
        messages: [
          {
            id: "1",
            content: "Hi Emma, I saw your leadership experience and thought you might be interested in a CTO role.",
            sender: "user",
            timestamp: new Date(Date.now() - 172800000),
            status: "read",
          },
        ],
        draftMessage: "Would you be interested in discussing this opportunity further?",
        // No attached campaign - this conversation has no campaign
        lastActivity: new Date(Date.now() - 172800000),
      },
    ])
  }, [])

  const handleStartNewConversation = async () => {
    if (newConversationMethod === "url" && !newLinkedInUrl.trim()) return
    if (newConversationMethod === "candidate" && !selectedCandidateId) return

    setIsAnalyzing(true)

    // Simulate profile analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    let mockProfile: LinkedInProfile

    if (newConversationMethod === "candidate") {
      // Create conversation from selected candidate
      const candidate = candidates.find((c) => c.id === selectedCandidateId)
      if (!candidate) return

      mockProfile = {
        id: candidate.id,
        name: candidate.name,
        title: candidate.title || "Professional",
        company: candidate.company || "Unknown Company",
        location: candidate.location || "Unknown Location",
        profileUrl: candidate.linkedinUrl || "https://linkedin.com/in/profile",
        experience: [
          {
            title: candidate.title || "Professional",
            company: candidate.company || "Unknown Company",
            duration: "Current",
            description: "Professional experience in the field",
          },
        ],
        education: [
          {
            school: "University",
            degree: "Degree",
            field: "Field of Study",
            year: "Year",
          },
        ],
        skills: candidate.skills || [],
        summary: `Professional with experience in ${candidate.skills?.join(", ") || "various technologies"}.`,
      }
    } else {
      // Create conversation from LinkedIn URL
      mockProfile = {
        id: Date.now().toString(),
        name: "John Doe",
        title: "Software Engineer",
        company: "Tech Solutions Inc",
        location: "New York, NY",
        profileUrl: newLinkedInUrl,
        experience: [
          {
            title: "Software Engineer",
            company: "Tech Solutions Inc",
            duration: "2021 - Present",
            description: "Full-stack development with React and Node.js",
          },
        ],
        education: [
          {
            school: "MIT",
            degree: "BS",
            field: "Computer Science",
            year: "2021",
          },
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
        summary: "Experienced software engineer passionate about building scalable web applications.",
      }
    }

    const newConversation: Conversation = {
      id: Date.now().toString(),
      profile: mockProfile,
      messages: [],
      draftMessage: `Hi ${mockProfile.name}, I noticed your impressive background in ${mockProfile.title} at ${mockProfile.company}. I'd love to discuss an exciting opportunity that aligns with your expertise.`,
      attachedCampaign:
        newConversationMethod === "candidate"
          ? candidates.find((c) => c.id === selectedCandidateId)?.campaignId
          : undefined,
      lastActivity: new Date(),
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedConversation(newConversation.id)
    setNewLinkedInUrl("")
    setSelectedCandidateId("")
    setSelectedCampaignId("")
    setCandidateSearch("")
    setIsAnalyzing(false)
    setShowNewConversationDialog(false)
  }

  const handleSendMessage = (conversationId: string, message: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const newMessage = {
            id: Date.now().toString(),
            content: message,
            sender: "user" as const,
            timestamp: new Date(),
            status: "sent" as const,
          }
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            draftMessage: undefined,
            lastActivity: new Date(),
          }
        }
        return conv
      }),
    )
  }

  const handleEditDraft = (conversationId: string, newDraft: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, draftMessage: newDraft } : conv)),
    )
  }

  const handleAttachCampaign = (conversationId: string, campaignId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, attachedCampaign: campaignId } : conv)),
    )
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation)
  const attachedCampaign = selectedConv?.attachedCampaign
    ? campaigns.find((c) => c.id === selectedConv.attachedCampaign)
    : null

  // Filter candidates based on selected campaign and search
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesCampaign = !selectedCampaignId || candidate.campaignId === selectedCampaignId
    const matchesSearch =
      !candidateSearch ||
      candidate.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      candidate.title?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      candidate.company?.toLowerCase().includes(candidateSearch.toLowerCase())
    return matchesCampaign && matchesSearch
  })

  // Filter conversations based on campaign filter
  const filteredConversations = conversations.filter((conversation) => {
    if (!conversationFilter) return true // Show all if no filter
    return conversation.attachedCampaign === conversationFilter
  })

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      {/* Left Panel - Conversations List */}
      <div
        className={`flex flex-col border-r bg-card transition-all duration-300 ${isLeftPanelCollapsed ? "w-16" : "w-80"}`}
      >
        <div className="flex items-center justify-between p-3 border-b">
          {!isLeftPanelCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h1 className="text-lg font-bold text-gray-600">Outreach Copilot</h1>
            </div>
          )}
          <div className="flex items-center gap-1">
            {!isLeftPanelCollapsed && (
              <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Start New LinkedIn Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Method Selection */}
                    <div className="space-y-3">
                      <Label>Choose method:</Label>
                      <div className="flex gap-4">
                        <Button
                          variant={newConversationMethod === "url" ? "default" : "outline"}
                          onClick={() => setNewConversationMethod("url")}
                          className="flex-1"
                        >
                          LinkedIn URL
                        </Button>
                        <Button
                          variant={newConversationMethod === "candidate" ? "default" : "outline"}
                          onClick={() => setNewConversationMethod("candidate")}
                          className="flex-1"
                        >
                          Campaign Candidate
                        </Button>
                      </div>
                    </div>

                    {/* LinkedIn URL Method */}
                    {newConversationMethod === "url" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                          <Input
                            id="linkedin-url"
                            placeholder="https://linkedin.com/in/username"
                            value={newLinkedInUrl}
                            onChange={(e) => setNewLinkedInUrl(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Campaign Candidate Method */}
                    {newConversationMethod === "candidate" && (
                      <div className="space-y-4">
                        <div>
                          <Label>Select Campaign</Label>
                          <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Campaigns" />
                            </SelectTrigger>
                            <SelectContent>
                              {campaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                  {campaign.title} - {campaign.company}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Search Candidates</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Search by name, title, or company..."
                              value={candidateSearch}
                              onChange={(e) => setCandidateSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Select Candidate</Label>
                          <ScrollArea className="h-64 border rounded-md p-2">
                            <div className="space-y-2">
                              {filteredCandidates.map((candidate) => (
                                <Card
                                  key={candidate.id}
                                  className={`cursor-pointer transition-colors ${
                                    selectedCandidateId === candidate.id
                                      ? "bg-primary/10 border-primary"
                                      : "hover:bg-accent"
                                  }`}
                                  onClick={() => setSelectedCandidateId(candidate.id)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="text-sm">
                                          {candidate.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm">{candidate.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                          {candidate.title} at {candidate.company}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Campaign: {candidate.campaignTitle}
                                        </p>
                                        {candidate.skills && candidate.skills.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {candidate.skills.slice(0, 3).map((skill, index) => (
                                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                                {skill}
                                              </Badge>
                                            ))}
                                            {candidate.skills.length > 3 && (
                                              <span className="text-xs text-muted-foreground">
                                                +{candidate.skills.length - 3} more
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {filteredCandidates.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>No candidates found</p>
                                  <p className="text-xs">Try adjusting your search or campaign filter</p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleStartNewConversation}
                      disabled={
                        isAnalyzing ||
                        (newConversationMethod === "url" && !newLinkedInUrl.trim()) ||
                        (newConversationMethod === "candidate" && !selectedCandidateId)
                      }
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Profile...
                        </>
                      ) : (
                        "Start Conversation"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isLeftPanelCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Campaign Filter */}
        {!isLeftPanelCollapsed && (
          <div className="p-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 flex items-center gap-2">
                <Select value={conversationFilter} onValueChange={setConversationFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Conversations" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.title} - {campaign.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {conversationFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setConversationFilter("")} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            {conversationFilter && (
              <div className="mt-2 text-xs text-muted-foreground">
                Showing {filteredConversations.length} conversation{filteredConversations.length !== 1 ? "s" : ""} for{" "}
                {campaigns.find((c) => c.id === conversationFilter)?.title}
              </div>
            )}
          </div>
        )}

        {isLeftPanelCollapsed ? (
          // Collapsed view - just avatars
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-200 p-2 rounded-lg ${
                    selectedConversation === conversation.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "hover:bg-accent border-2 border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation.id)
                    // Auto-populate context when selecting a conversation
                    setSelectedProfileView(conversation.id)
                    setSelectedCampaignView(conversation.attachedCampaign || null)
                    setSelectedContextCandidate(null) // Reset candidate context
                    setSelectedContextCampaign(conversation.attachedCampaign || null)
                  }}
                  title={`${conversation.profile.name} - ${conversation.profile.title}`}
                >
                  <Avatar className="h-10 w-10 mx-auto">
                    <AvatarImage src={conversation.profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {conversation.profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          // Expanded view
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => {
                const campaignInfo = conversation.attachedCampaign
                  ? campaigns.find((c) => c.id === conversation.attachedCampaign)
                  : null

                return (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                      selectedConversation === conversation.id
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "hover:bg-accent/50 border-border hover:border-primary/30"
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      // Auto-populate context when selecting a conversation
                      setSelectedProfileView(conversation.id)
                      setSelectedCampaignView(conversation.attachedCampaign || null)
                      setSelectedContextCandidate(null) // Reset candidate context
                      setSelectedContextCampaign(conversation.attachedCampaign || null)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border border-background shadow-sm flex-shrink-0">
                          <AvatarImage src={conversation.profile.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                            {conversation.profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-1">
                              {conversation.profile.name}
                            </h3>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                              {conversation.lastActivity.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-tight line-clamp-1">
                            {conversation.profile.title} at {conversation.profile.company}
                          </p>
                          {campaignInfo && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {campaignInfo.title}
                              </Badge>
                            </div>
                          )}
                          <div className="bg-muted/50 rounded p-2 border-l-2 border-primary/30 min-h-[2rem]">
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {conversation.messages.length > 0
                                ? `💬 ${conversation.messages[conversation.messages.length - 1].content}`
                                : conversation.draftMessage
                                  ? `✏️ Draft: ${conversation.draftMessage}`
                                  : "📝 No messages yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {filteredConversations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations found</p>
                  <p className="text-xs">
                    {conversationFilter
                      ? "No conversations for this campaign"
                      : "Start a new conversation to get started"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Center Panel - Chat Interface */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <Card className="mb-4 shadow-sm">
              <CardContent className="p-4 bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={selectedConv.profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {selectedConv.profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{selectedConv.profile.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConv.profile.title} at {selectedConv.profile.company}
                    </p>
                    {attachedCampaign && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {attachedCampaign.title}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedConv.profile.profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <ScrollArea className="flex-1 mb-4 bg-muted/20 rounded-lg border">
              <div className="space-y-4 p-6">
                {selectedConv.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}

                {/* Draft Message */}
                {selectedConv.draftMessage && (
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
                    <div className="flex items-start gap-2 mb-2">
                      <Bot className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm font-medium text-primary">AI Draft Ready</span>
                    </div>
                    <p className="text-sm mb-3 bg-background/50 p-3 rounded border">{selectedConv.draftMessage}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSendMessage(selectedConv.id, selectedConv.draftMessage!)}>
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newDraft = prompt("Edit message:", selectedConv.draftMessage)
                          if (newDraft !== null) {
                            handleEditDraft(selectedConv.id, newDraft)
                          }
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        const message = e.currentTarget.value.trim()
                        if (message) {
                          handleSendMessage(selectedConv.id, message)
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                  />
                  <Button size="sm" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a LinkedIn conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Panel - fixed with spacer */}
      <div className={`hidden md:block flex-shrink-0 ${isRightPanelCollapsed ? 'w-12' : 'w-96'}`}></div>
      {/* <div className="hidden md:block fixed right-0 top-0 h-screen z-30"> */}
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
          campaigns={rightPanelCampaigns}
          candidates={rightPanelCandidates}
        />
      </div>
    </div>
  )
}