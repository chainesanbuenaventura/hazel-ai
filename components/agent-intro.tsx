"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, FileText, Users, MessageSquare, Calendar, ArrowRight, CheckCircle } from "lucide-react"

const workflowSteps = [
  {
    id: "job-offer-creation",
    title: "Job Offer Creation",
    description: "Don't know what you're looking for? We'll brainstorm, identify skills, and help draft your job offer",
    icon: FileText,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "sourcing-matching",
    title: "Sourcing & Matching",
    description: "AI finds and matches the best candidates based on your requirements",
    icon: Users,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "outreach-prequalification",
    title: "Outreach & Prequalification",
    description: "Automated outreach and initial screening to ensure candidate fit",
    icon: MessageSquare,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "scheduling-interview",
    title: "Scheduling & Interview",
    description: "Schedule interviews ensuring good fit, availability, and alignment",
    icon: Calendar,
    color: "from-orange-500 to-red-500"
  }
]

const exampleChatMessages = [
  {
    role: "user" as const,
    content: "I need help creating a job posting but I'm not sure what skills to look for"
  },
  {
    role: "assistant" as const,
    content: "I'll help you brainstorm and identify the key skills needed. Let me ask a few questions about the role..."
  },
  {
    role: "assistant" as const,
    content: "Based on your needs, I suggest these skills: React, Node.js, TypeScript, PostgreSQL, AWS. I've drafted a comprehensive job description."
  },
  {
    role: "assistant" as const,
    content: "I've found 15 qualified candidates matching your criteria. Let me start the outreach process..."
  },
  {
    role: "assistant" as const,
    content: "8 candidates have responded and passed prequalification. Would you like me to schedule interviews with the top matches?"
  }
]

export function AgentIntro() {
  const [activeStep, setActiveStep] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState<Array<{ role: "user" | "assistant", content: string }>>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Auto-advance through workflow steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length)
    }, 3000) // Change step every 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Chat animation
  useEffect(() => {
    if (currentMessageIndex >= exampleChatMessages.length) {
      // Reset after showing all messages
      setTimeout(() => {
        setDisplayedMessages([])
        setCurrentMessageIndex(0)
      }, 2000)
      return
    }

    const currentMessage = exampleChatMessages[currentMessageIndex]
    const delay = currentMessage.role === "user" ? 500 : 1500

    const timeout = setTimeout(() => {
      setDisplayedMessages(prev => [...prev, currentMessage])
      setCurrentMessageIndex(prev => prev + 1)
    }, delay)

    return () => clearTimeout(timeout)
  }, [currentMessageIndex])

  return (
    <section className="border-b border-border py-20 sm:py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-40">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      {/* Section separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Agents Workflow</span>
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gray-700 mb-4">
              How our AI agents work together
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              From identifying your needs to matching candidates, our agents collaborate seamlessly to streamline your hiring process.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left side - Workflow Steps */}
            <div className="space-y-6">
              {workflowSteps.map((step, index) => {
                const isActive = activeStep === index
                const isCompleted = activeStep > index
                const Icon = step.icon

                return (
                  <Card
                    key={step.id}
                    className={`relative overflow-hidden transition-all duration-500 border-2 rounded-2xl ${
                      isActive
                        ? "border-primary shadow-lg scale-105"
                        : isCompleted
                        ? "border-primary/30 shadow-md"
                        : "border-border shadow-sm"
                    }`}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`}></div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Step number/icon */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? `bg-gradient-to-br ${step.color} shadow-lg scale-110`
                              : isCompleted
                              ? "bg-primary/10 border-2 border-primary/20"
                              : "bg-muted border border-border"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-primary" />
                          ) : (
                            <Icon
                              className={`w-6 h-6 ${
                                isActive ? "text-white" : "text-primary"
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3
                              className={`text-xl font-bold transition-colors ${
                                isActive ? "text-primary" : "text-gray-700"
                              }`}
                            >
                              {step.title}
                            </h3>
                            {isActive && (
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary border border-primary/20"
                              >
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        {index < workflowSteps.length - 1 && (
                          <div className="flex-shrink-0 pt-2">
                            <ArrowRight
                              className={`w-5 h-5 transition-colors ${
                                isCompleted || isActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Right side - Chat Preview */}
            <div className="lg:sticky lg:top-8">
              <Card className="border-2 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
                <CardContent className="p-6">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 pb-4 border-b mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Hazel AI Assistant</h3>
                      <p className="text-xs text-muted-foreground">Working with agents...</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 mb-4 h-[300px] overflow-y-auto pr-2">
                    {displayedMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-2.5 flex-shrink-0 ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-primary to-primary/90 text-white"
                              : "bg-muted border text-gray-700"
                          }`}
                        >
                          <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area (static) */}
                  <div className="flex gap-2 pt-4 border-t">
                    <div className="flex-1 h-10 bg-muted rounded-lg flex items-center px-3">
                      <span className="text-xs text-muted-foreground">
                        Agents are processing your request...
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

