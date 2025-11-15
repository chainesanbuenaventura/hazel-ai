"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { useState } from "react"

const conversations = [
  {
    id: 1,
    name: "Alice Johnson",
    type: "first_contact",
    lastMessage: "Thank you for reaching out!",
    time: "2 hours ago",
    unread: true,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Bob Smith",
    type: "scheduling",
    lastMessage: "Does Tuesday at 10am work for you?",
    time: "1 day ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "Carol White",
    type: "qualifying",
    lastMessage: "Can you tell me about your ML experience?",
    time: "3 days ago",
    unread: false,
    avatar: "/placeholder-user.jpg",
  },
]

export function InboxTab() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationFilter, setConversationFilter] = useState("")

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

        {/* Campaign Filter */}
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

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9 h-8 text-xs" />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
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
            ))}
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
