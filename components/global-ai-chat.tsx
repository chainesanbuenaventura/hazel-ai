"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"

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

interface GlobalAiChatProps {
  campaigns: Campaign[]
  candidates: Candidate[]
  selectedContextCampaign?: string | null
  selectedContextCandidate?: string | null
  onContextChange?: (campaign: string | null, candidate: string | null) => void
}

export default function GlobalAiChat({
  campaigns,
  candidates,
  selectedContextCampaign = null,
  selectedContextCandidate = null,
  onContextChange
}: GlobalAiChatProps) {
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ id: string; content: string; sender: "user" | "ai" }>>([])
  const [aiChatInput, setAiChatInput] = useState("")
  const [isAiChatLoading, setIsAiChatLoading] = useState(false)
  const [contextCampaign, setContextCampaign] = useState<string | null>(selectedContextCampaign)
  const [contextCandidate, setContextCandidate] = useState<string | null>(selectedContextCandidate)

  const handleAiChat = async (message: string) => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user" as const,
    }

    setAiChatMessages((prev) => [...prev, newMessage])
    setIsAiChatLoading(true)
    setAiChatInput("")

    try {
      console.log("Making API call with message:", message)
      
      const response = await fetch("/api/chat-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          context: {
            campaign: contextCampaign ? campaigns.find(c => c.id === contextCampaign) : null,
            candidate: contextCandidate ? candidates.find(c => c.id === contextCandidate) : null,
          }
        }),
      })

      console.log("Response received:", response)
      const data = await response.json()
      console.log("API Response:", { status: response.status, data })

      if (!response.ok) {
        const errorMessage = data.detail || data.error || data.message || `Server returned ${response.status} error`
        throw new Error(errorMessage)
      }
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: data.answer || data.response || "I received your message but couldn't generate a proper response.",
        sender: "ai" as const,
      }
      
      setAiChatMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error calling AI chat API:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      const isNetworkError = errorMessage.includes("fetch") || errorMessage.includes("network")
      const isSyntaxError = errorMessage.includes("SyntaxError") || errorMessage.includes("Neo.ClientError")
      
      let userFriendlyMessage = ""
      
      if (isNetworkError) {
        userFriendlyMessage = "Sorry, I'm having trouble connecting to the AI service right now. Please check your internet connection and try again."
      } else if (isSyntaxError) {
        userFriendlyMessage = "I had trouble understanding your question. Try asking recruitment-related questions like:\n• 'How many candidates are there?'\n• 'Are there any jobs available?'\n• 'What skills should I look for in candidates?'\n• 'Tell me about the available positions'"
      } else {
        userFriendlyMessage = `Sorry, the AI service encountered an issue: ${errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage}`
      }
      
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        content: userFriendlyMessage,
        sender: "ai" as const,
      }
      
      setAiChatMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsAiChatLoading(false)
    }
  }

  const handleContextChange = (campaign: string | null, candidate: string | null) => {
    setContextCampaign(campaign)
    setContextCandidate(candidate)
    onContextChange?.(campaign, candidate)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Context Selection */}
      <div className="p-4 border-b space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Campaign Context</Label>
            <Select 
              value={contextCampaign || "all"} 
              onValueChange={(value) => handleContextChange(value === "all" ? null : value, contextCandidate)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Candidate Context</Label>
            <Select 
              value={contextCandidate || "all"} 
              onValueChange={(value) => handleContextChange(contextCampaign, value === "all" ? null : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Candidates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quick suggestions */}
      {aiChatMessages.length === 0 && !isAiChatLoading && (
        <div className="p-4 border-b">
          <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "How many candidates are there?",
              "Are there any jobs available?", 
              "What skills are most important?",
              "Tell me about open positions"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setAiChatInput(suggestion)
                  handleAiChat(suggestion)
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4 p-4">
          {aiChatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                }`}
              >
                <p className="text-xs whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          {isAiChatLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-lg p-3 shadow-sm bg-card border">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-xs text-muted-foreground">Hazel is typing...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4">
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
  )
}
