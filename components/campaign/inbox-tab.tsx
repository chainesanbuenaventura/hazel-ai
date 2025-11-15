"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, FileText } from "lucide-react"
import { useState } from "react"

const conversations = [
  {
    id: 1,
    name: "Alice Johnson",
    type: "first_contact",
    lastMessage: "Thank you for reaching out! I'm very interested in learning more about this opportunity.",
    time: "2 hours ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Bob Smith",
    type: "scheduling",
    lastMessage: "Does Tuesday at 10am work for you? I'm flexible with other times as well.",
    time: "1 day ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "Carol White",
    type: "qualifying",
    lastMessage: "Can you tell me more about your ML experience? I'd love to discuss how it aligns with our role.",
    time: "3 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 4,
    name: "David Chen",
    type: "first_contact",
    lastMessage: "Hi! I saw your message about the Product Manager role. I'm definitely interested.",
    time: "5 hours ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 5,
    name: "Emma Rodriguez",
    type: "scheduling",
    lastMessage: "I've reviewed the job description and I'm excited about this opportunity. When can we schedule a call?",
    time: "6 hours ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 6,
    name: "Frank Miller",
    type: "qualifying",
    lastMessage: "I have 8 years of experience in SaaS product management. Would love to discuss how I can contribute.",
    time: "1 day ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 7,
    name: "Grace Kim",
    type: "first_contact",
    lastMessage: "Thank you for considering me! I'm very interested in this position.",
    time: "2 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 8,
    name: "Henry Taylor",
    type: "scheduling",
    lastMessage: "I'm available this week for an interview. Please let me know what works best for you.",
    time: "2 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 9,
    name: "Isabella Martinez",
    type: "qualifying",
    lastMessage: "I've worked with similar tech stacks before. Can we discuss the technical requirements?",
    time: "3 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 10,
    name: "James Wilson",
    type: "first_contact",
    lastMessage: "Hi there! I'm excited about this opportunity and would love to learn more.",
    time: "4 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 11,
    name: "Sophia Anderson",
    type: "scheduling",
    lastMessage: "Thank you for the interview invitation! I'm available Monday through Wednesday next week.",
    time: "1 hour ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 12,
    name: "Lucas Brown",
    type: "qualifying",
    lastMessage: "I have extensive experience with product roadmaps and stakeholder management. Happy to discuss further!",
    time: "4 hours ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 13,
    name: "Olivia Davis",
    type: "first_contact",
    lastMessage: "This role sounds perfect for my background. I'd love to learn more about the team and company culture.",
    time: "7 hours ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 14,
    name: "Noah Garcia",
    type: "scheduling",
    lastMessage: "I can do Tuesday afternoon or Wednesday morning. Which works better for you?",
    time: "1 day ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 15,
    name: "Ava Martinez",
    type: "qualifying",
    lastMessage: "I've led product teams of 5-10 people and have experience with both B2B and B2C products.",
    time: "1 day ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 16,
    name: "Ethan Lee",
    type: "first_contact",
    lastMessage: "Thank you for reaching out! I'm interested in learning more about this Product Manager position.",
    time: "2 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 17,
    name: "Mia Thompson",
    type: "scheduling",
    lastMessage: "I'm free this Thursday or Friday next week. Would either of those work?",
    time: "2 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 18,
    name: "Alexander Wright",
    type: "qualifying",
    lastMessage: "I have 6 years of product management experience, primarily in fintech and SaaS platforms.",
    time: "3 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
]

const drafts = [
  {
    id: "draft-1",
    name: "Sarah Thompson",
    subject: "Follow-up on Product Manager Role",
    preview: "Hi Sarah, I wanted to follow up on our previous conversation about the Product Manager position...",
    time: "1 hour ago",
  },
  {
    id: "draft-2",
    name: "Michael Brown",
    subject: "Interview Scheduling",
    preview: "Hi Michael, thank you for your interest. I'd like to schedule an interview with you...",
    time: "3 hours ago",
  },
  {
    id: "draft-3",
    name: "Olivia Davis",
    subject: "Re: Your Application",
    preview: "Hi Olivia, I've reviewed your application and I'm impressed with your background...",
    time: "1 day ago",
  },
]

export function InboxTab() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationFilter, setConversationFilter] = useState("")
  const [activeView, setActiveView] = useState<"chats" | "drafts">("chats")

  const filteredConversations = conversations.filter((conversation) => {
    if (!conversationFilter || conversationFilter === "all") return true
    return conversation.type === conversationFilter
  })

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Left Panel - Conversations List */}
      <div className="flex flex-col border-r bg-card w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h1 className="text-lg font-bold text-gray-600">Inbox</h1>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 p-3 border-b bg-muted/10">
          <Button
            variant={activeView === "chats" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("chats")}
            className="flex-1 h-8 text-xs"
          >
            Chats ({conversations.length})
          </Button>
          <Button
            variant={activeView === "drafts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("drafts")}
            className="flex-1 h-8 text-xs"
          >
            Drafts ({drafts.length})
          </Button>
        </div>

        {/* Campaign Filter - Only show for chats */}
        {activeView === "chats" && (
          <div className="p-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 flex items-center gap-2">
                <Select value={conversationFilter} onValueChange={setConversationFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="first_contact">First Contact</SelectItem>
                    <SelectItem value="scheduling">Scheduling</SelectItem>
                    <SelectItem value="qualifying">Qualifying</SelectItem>
                  </SelectContent>
                </Select>
                {conversationFilter && conversationFilter !== "all" && (
                  <Button variant="ghost" size="sm" onClick={() => setConversationFilter("all")} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9 h-8 text-xs" />
          </div>
        </div>

        {/* Conversations List or Drafts */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {activeView === "chats" ? (
              filteredConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                    selectedConversation === conversation.id.toString()
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "hover:bg-accent/50 border-border hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id.toString())}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                          {conversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                          {conversation.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            {conversation.type.replace("_", " ")}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {conversation.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              drafts.map((draft) => (
                <Card
                  key={draft.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                    selectedConversation === draft.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "hover:bg-accent/50 border-border hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedConversation(draft.id)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{draft.name}</h4>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            Draft
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 truncate">
                          {draft.subject}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {draft.preview}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {draft.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">Message view coming soon</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
