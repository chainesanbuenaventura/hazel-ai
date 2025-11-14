"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Download, ThumbsUp, ThumbsDown, MoveRight } from "lucide-react"

interface CandidateDrawerProps {
  candidate: {
    id: number
    name: string
    email: string
    stage: string
    score?: number
    skills?: string[]
    salary?: string
    notes?: string
    messages?: Array<{ sender: string; text: string; timestamp: string }>
  }
  onClose: () => void
  onMove?: (candidateId: number, newStage: string) => void
}

const stages = ["sourced", "screened", "contacted", "responded", "verify", "qualified", "booked", "hired"]

export function CandidateDrawer({ candidate, onClose, onMove }: CandidateDrawerProps) {
  const [activeTab, setActiveTab] = useState("fit")

  return (
    <div className="w-96 border-l border-r bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">{candidate.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-6 pt-4 flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="fit" className="text-xs">
                Fit
              </TabsTrigger>
              <TabsTrigger value="messages" className="text-xs">
                Messages
              </TabsTrigger>
              <TabsTrigger value="resume" className="text-xs">
                Resume
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">
                Notes
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                Activity
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Tab 1: Fit & Actions */}
          {activeTab === "fit" && (
            <div className="space-y-4">
              {/* Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Overall Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-primary">{candidate.score || 85}%</div>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${candidate.score || 85}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Skills Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(candidate.skills || ["Python", "React", "AWS", "PostgreSQL"]).map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-xs font-medium">{skill}</span>
                        <div className="w-12 bg-muted rounded h-1.5">
                          <div className="bg-green-500 h-1.5 rounded" style={{ width: "85%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Salary Fit */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Salary Fit</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p>
                    Expected: <span className="font-semibold">{candidate.salary || "$100k - $130k"}</span>
                  </p>
                  <p className="text-muted-foreground">Within budget range</p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent h-8 text-xs">
                  <ThumbsDown className="h-3 w-3" />
                  Reject
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent h-8 text-xs">
                  <MoveRight className="h-3 w-3" />
                  Move
                </Button>
                <Button size="sm" className="flex-1 gap-1 h-8 text-xs">
                  <ThumbsUp className="h-3 w-3" />
                  Approve
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Messages */}
          {activeTab === "messages" && (
            <div className="space-y-3">
              <div className="space-y-2 bg-muted rounded-lg p-3 min-h-48 max-h-48 overflow-y-auto text-xs">
                {(
                  candidate.messages || [
                    {
                      sender: "ai",
                      text: "Hi Alice! We found your profile interesting for our ML Engineer role.",
                      timestamp: "2 hours ago",
                    },
                    {
                      sender: "candidate",
                      text: "Thanks! I'm very interested in learning more.",
                      timestamp: "1 hour ago",
                    },
                  ]
                ).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-xs p-2 rounded-lg text-xs ${
                        msg.sender === "ai" ? "bg-background border" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="opacity-70 text-xs mt-0.5">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Outbound Draft</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    AI-generated follow-up pending approval...
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent h-7 text-xs">
                      Edit & Send
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent h-7 text-xs">
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab 3: Resume */}
          {activeTab === "resume" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between">
                  Resume
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent h-7 text-xs">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded h-64 flex items-center justify-center text-xs text-muted-foreground">
                  PDF Viewer
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 4: Notes */}
          {activeTab === "notes" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-2 border rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={8}
                  placeholder="Add notes..."
                  defaultValue={candidate.notes || ""}
                />
              </CardContent>
            </Card>
          )}

          {/* Tab 5: Activity Log */}
          {activeTab === "activity" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2 pb-2 border-b">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs">AI messaged</p>
                      <p className="text-muted-foreground text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-2 border-b">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs">Candidate replied</p>
                      <p className="text-muted-foreground text-xs">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs">Moved to Contacted</p>
                      <p className="text-muted-foreground text-xs">30 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
