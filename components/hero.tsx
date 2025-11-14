"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Send, Sparkles, Bot, MessageSquare } from "lucide-react"
import { useAuthInfo } from "@propelauth/react"
import { buildSignupUrl } from "@/lib/auth-utils"

const FULL_TEXT = "Find your next hire in days, not months"

const exampleMessages = [
  {
    role: "user" as const,
    content: "I'm looking for a senior React developer with 5+ years of experience"
  },
  {
    role: "assistant" as const,
    content: "I found 12 qualified React developers matching your criteria. Here are the top matches..."
  },
  {
    role: "user" as const,
    content: "Show me candidates in Paris with AI/ML experience"
  },
  {
    role: "assistant" as const,
    content: "I've identified 8 candidates in Paris with strong AI/ML backgrounds. Would you like me to create a campaign for this role?"
  }
]

export function Hero() {
  const { isLoggedIn } = useAuthInfo()
  const [input, setInput] = useState("")
  const [displayedMessages, setDisplayedMessages] = useState<Array<{ role: "user" | "assistant", content: string, isTyping?: boolean }>>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Chat messages typing effect - start immediately
  useEffect(() => {
    // Start chat animation immediately
    setCurrentMessageIndex(0)
  }, [])

  useEffect(() => {
    if (currentMessageIndex >= exampleMessages.length) return

    const currentMessage = exampleMessages[currentMessageIndex]
    let typeInterval: NodeJS.Timeout | null = null
    let nextMessageTimeout: NodeJS.Timeout | null = null
    let typingTimeout: NodeJS.Timeout | null = null
    
    // For user messages, show immediately (no typing)
    if (currentMessage.role === "user") {
      setDisplayedMessages(prev => [...prev, { ...currentMessage, isTyping: false }])
      // Move to next message after a short delay
      nextMessageTimeout = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1)
      }, 1000)
    } else {
      // For assistant messages, show typing indicator first
      setDisplayedMessages(prev => [...prev, { ...currentMessage, content: "", isTyping: true }])

      // Then type out the message after a brief delay
      typingTimeout = setTimeout(() => {
        let charIndex = 0
        typeInterval = setInterval(() => {
          if (charIndex < currentMessage.content.length) {
            setDisplayedMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...currentMessage,
                content: currentMessage.content.substring(0, charIndex + 1),
                isTyping: false
              }
              return updated
            })
            charIndex++
          } else {
            if (typeInterval) clearInterval(typeInterval)
            // Move to next message after a short delay
            nextMessageTimeout = setTimeout(() => {
              setCurrentMessageIndex(prev => prev + 1)
            }, 1000)
          }
        }, 30) // Typing speed (lower = faster)
      }, 500) // Delay before starting to type
    }

    return () => {
      if (typeInterval) clearInterval(typeInterval)
      if (nextMessageTimeout) clearTimeout(nextMessageTimeout)
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }, [currentMessageIndex])

  const handleHireTalent = () => {
    if (isLoggedIn) {
      window.location.href = "/dashboard"
    } else {
      window.location.href = buildSignupUrl("/dashboard")
    }
  }

  return (
    <section className="relative border-b border-border pt-6 pb-20 sm:pt-8 sm:pb-32 bg-gradient-to-b from-background via-background to-muted/10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-10">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-400 to-cyan-400" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header Text */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Hiring Assistant</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl text-gray-700 mb-4">
              {FULL_TEXT}
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Chat with our AI agents to find, match, and hire the perfect candidates.
            </p>
          </div>

          {/* Chatbot Preview */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-2xl bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hazel AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Ready to help you find talent</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-4 h-[280px] overflow-y-auto pr-2">
                  {displayedMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 flex-shrink-0 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-primary to-primary/90 text-white"
                            : "bg-muted border text-gray-700"
                        }`}
                      >
                        {msg.isTyping ? (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-2 pt-4 border-t">
                  <Textarea
                    placeholder="Ask about candidates, skills, or create a job posting..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[60px] resize-none"
                    disabled
                  />
                  <Button
                    size="icon"
                    className="h-[60px] w-[60px] shrink-0"
                    disabled
                    style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}
              onClick={handleHireTalent}
            >
              Start chatting with Hazel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => {
                const element = document.getElementById('agents')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Meet our AI agents
            </Button>
          </div>
          
          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            <span className="text-primary font-semibold">Trusted by 500+ startups</span> • <span className="text-primary font-semibold">10,000+ qualified candidates</span>
          </p>
        </div>
      </div>
    </section>
  )
}
