"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send } from "lucide-react"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Try asking: How many candidates are in the database?",
    },
    {
      role: "assistant",
      content: "Show me jobs in Paris with high salaries",
    },
    {
      role: "assistant",
      content: "Which candidates have machine learning experience?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }])
      setInput("")
      // Simulate assistant response
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: "I'm analyzing your request..." }])
      }, 500)
    }
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-sm">AI Chat</h3>
          <p className="text-xs text-muted-foreground">Ask about jobs, candidates, or skills</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3 flex-shrink-0 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
            className="text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Try: "Show me jobs in Paris", "How many ML engineers?"</p>
      </div>
    </div>
  )
}
