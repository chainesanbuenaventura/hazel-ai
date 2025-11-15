"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Play, CheckCircle2, Loader2 } from "lucide-react"

interface SourcingTabProps {
  campaignId?: string
  newQuery?: string
}

export function SourcingTab({ campaignId, newQuery }: SourcingTabProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState("1")
  const [currentStep, setCurrentStep] = useState<"idle" | "generating" | "searching" | "done">("idle")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
  // Mock batch data - replace with actual API data
  const batches = [
    { id: "1", number: 1, totalBatches: "NA", candidates: 0, goodFits: 0 },
    { id: "2", number: 2, totalBatches: "NA", candidates: 15, goodFits: 5 },
    { id: "3", number: 3, totalBatches: "NA", candidates: 22, goodFits: 7 },
  ]

  // Update search query when newQuery prop changes
  useEffect(() => {
    if (newQuery) {
      setSearchQuery(newQuery)
      if (currentStep === "idle") {
        setCurrentStep("generating")
        setIsRunning(true)
        setTimeout(() => {
          setCurrentStep("searching")
          setTimeout(() => {
            setCurrentStep("done")
            setIsRunning(false)
          }, 3000)
        }, 2000)
      }
    }
  }, [newQuery])

  // Mock search phrases - replace with actual generated keywords
  const searchPhrases = searchQuery
    ? [searchQuery] // Use the new query if available
    : [
        "Senior Machine Learning Engineer",
        "ML Engineer Python",
        "Deep Learning Specialist",
        "AI Engineer TensorFlow",
        "Machine Learning Researcher",
        "Data Scientist ML",
        "ML Engineer Remote",
        "Senior AI Engineer",
        "ML Engineer PyTorch",
        "Machine Learning Developer",
        "AI ML Engineer",
        "ML Engineer 5+ years",
        "Senior ML Engineer",
        "Machine Learning Architect",
        "ML Engineer Kubernetes",
        "AI Engineer MLOps",
        "ML Engineer AWS",
        "Machine Learning Lead",
        "ML Engineer NLP",
        "Senior ML Researcher",
      ]

  const handleStartBatch = () => {
    setIsRunning(true)
    setCurrentStep("generating")
    
    // Simulate process
    setTimeout(() => {
      setCurrentStep("searching")
      setTimeout(() => {
        setCurrentStep("done")
        setIsRunning(false)
      }, 3000)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sourcing</h2>
        <p className="text-muted-foreground">Find and source candidates for your campaign</p>
      </div>

      {/* Start Batch Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleStartBatch}
            disabled={isRunning}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            Start batch
          </Button>
        </CardContent>
      </Card>

      {/* Agentic Process Log */}
      {(isRunning || currentStep !== "idle") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sourcing Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Generating Keywords Step */}
              <div className="flex items-start gap-3">
                {currentStep === "generating" ? (
                  <Loader2 className="h-4 w-4 mt-0.5 animate-spin text-primary" />
                ) : currentStep === "searching" || currentStep === "done" ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                ) : (
                  <div className="h-4 w-4 mt-0.5 rounded-full border-2 border-muted" />
                )}
                <div className="flex-1">
                  {searchQuery ? (
                    <p className="text-sm font-medium">
                      Looking for candidates in: <span className="font-semibold text-primary">{searchQuery}</span>
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Generating keywords and search phrases...</p>
                      {currentStep === "generating" && (
                        <p className="text-xs text-muted-foreground mt-1">Analyzing job description and extracting relevant terms</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Search Phrases Display - only show if no newQuery */}
              {(currentStep === "searching" || currentStep === "done") && !searchQuery && (
                <div className="ml-7 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Generated {searchPhrases.length} search phrases:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchPhrases.map((phrase, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs font-normal"
                      >
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Searching Step */}
              {(currentStep === "searching" || currentStep === "done") && (
                <div className="flex items-start gap-3">
                  {currentStep === "searching" ? (
                    <Loader2 className="h-4 w-4 mt-0.5 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Searching and sourcing candidates...</p>
                    {currentStep === "searching" && (
                      <p className="text-xs text-muted-foreground mt-1">Querying databases and matching profiles</p>
                    )}
                  </div>
                </div>
              )}

              {/* Done - Show Candidates */}
              {currentStep === "done" && (
                <div className="ml-7 mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">Sourcing complete</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Found {batches.find(b => b.id === selectedBatch)?.candidates || 0} candidates · {batches.find(b => b.id === selectedBatch)?.goodFits || 0} good fits
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sourced Candidates - Dropdown View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sourced Candidates</CardTitle>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    Batch #{batch.number} {batch.totalBatches !== "NA" && `(${batch.totalBatches} total)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {batches.find(b => b.id === selectedBatch)?.candidates === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No candidates sourced yet</p>
              <p className="text-sm">Start sourcing to see candidates here</p>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Candidates for batch #{batches.find(b => b.id === selectedBatch)?.number}</p>
              <p className="text-sm">
                {batches.find(b => b.id === selectedBatch)?.candidates} candidates · {batches.find(b => b.id === selectedBatch)?.goodFits} good fits
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

