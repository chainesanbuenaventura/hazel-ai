"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, CheckCircle2, Loader2, MapPin, Briefcase } from "lucide-react"

interface SourcingTabProps {
  campaignId?: string
  newQuery?: string
}

// Function to generate fake candidates based on query
const generateFakeCandidates = (query: string, batchNumber: number = 1) => {
  const firstNames = ["Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda", "James", "Lisa", "Daniel", "Maria", "Christopher", "Jennifer", "Matthew", "Nicole"]
  const lastNames = ["Chen", "Rodriguez", "Watson", "Kim", "Park", "Taylor", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Anderson", "Thomas"]
  const companies = ["TechCorp", "StartupXYZ", "CloudSoft", "DataFlow Inc", "FinTech Solutions", "E-commerce Pro", "AI Innovations", "Digital Ventures", "TechStart", "Future Labs"]
  const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA", "Chicago, IL", "Los Angeles, CA", "Denver, CO", "Portland, OR", "Miami, FL"]
  const titles = ["Senior Product Manager", "Product Manager", "Senior PM", "Product Lead", "Head of Product", "VP of Product", "Product Director"]
  
  const count = 8 + Math.floor(Math.random() * 5) // 8-12 candidates
  const candidates = []
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    const company = companies[Math.floor(Math.random() * companies.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const title = titles[Math.floor(Math.random() * titles.length)]
    const score = 75 + Math.floor(Math.random() * 20) // 75-95%
    const profileUrl = `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`
    
    candidates.push({
      id: batchNumber * 1000 + i + 1,
      name,
      email,
      currentTitle: title,
      currentCompany: company,
      address: location,
      score,
      skills: ["Product Management", "SaaS", query.includes("Senior") ? "Leadership" : "Agile", "B2B"],
      profile_url: profileUrl,
      stage: "sourced",
      shortlisted: false,
      batchNumber,
    })
  }
  
  return candidates
}

const stagesInitial = [
  { id: "sourced", label: "Sourced", count: 0 },
  { id: "shortlisted", label: "Shortlisted", count: 0 },
]

export function SourcingTab({ campaignId, newQuery }: SourcingTabProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState("1")
  const [currentStep, setCurrentStep] = useState<"idle" | "generating" | "searching" | "done">("idle")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [candidates, setCandidates] = useState<any[]>([])
  const [stagesState, setStagesState] = useState(stagesInitial)
  const [batches, setBatches] = useState([
    { id: "1", number: 1, totalBatches: "NA", candidates: 0, goodFits: 0 },
  ])
  const [batchCounter, setBatchCounter] = useState(1)

  // Update search query when newQuery prop changes
  useEffect(() => {
    if (newQuery) {
      setSearchQuery(newQuery)
      if (currentStep === "idle" || currentStep === "done") {
        // Generate new batch when query changes
        setBatchCounter((prev) => {
          const newBatchNumber = prev + 1
          
          setCurrentStep("generating")
          setIsRunning(true)
          
          // Generate fake candidates immediately when process starts
          const newCandidates = generateFakeCandidates(newQuery, newBatchNumber)
          const goodFits = newCandidates.filter((c) => c.score >= 85).length
          
          // Update batches
          setBatches((prevBatches) => {
            const newBatch = {
              id: newBatchNumber.toString(),
              number: newBatchNumber,
              totalBatches: "NA",
              candidates: newCandidates.length,
              goodFits,
            }
            return [...prevBatches, newBatch]
          })
          
          // Set new candidates (keep shortlisted ones from previous batch)
          setCandidates((prevCandidates) => {
            const shortlisted = prevCandidates.filter((c) => c.shortlisted && c.stage === "shortlisted")
            return [...shortlisted, ...newCandidates]
          })
          
          setSelectedBatch(newBatchNumber.toString())
          
          setTimeout(() => {
            setCurrentStep("searching")
            
            setTimeout(() => {
              setCurrentStep("done")
              setIsRunning(false)
            }, 3000)
          }, 2000)
          
          return newBatchNumber
        })
      }
    }
  }, [newQuery, currentStep])

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

  const handleShortlist = (candidateId: number) => {
    setCandidates((prev) => {
      const updated = prev.map((c) => {
        if (c.id === candidateId) {
          const newShortlisted = !c.shortlisted
          return {
            ...c,
            shortlisted: newShortlisted,
            stage: newShortlisted ? "shortlisted" : "sourced",
          }
        }
        return c
      })
      
      // Update stage counts
      const sourcedCount = updated.filter((c) => c.stage === "sourced").length
      const shortlistedCount = updated.filter((c) => c.stage === "shortlisted").length
      setStagesState([
        { id: "sourced", label: "Sourced", count: sourcedCount },
        { id: "shortlisted", label: "Shortlisted", count: shortlistedCount },
      ])
      
      return updated
    })
  }

  // Initialize and update stage counts when candidates change
  useEffect(() => {
    const sourcedCount = candidates.filter((c) => c.stage === "sourced").length
    const shortlistedCount = candidates.filter((c) => c.stage === "shortlisted").length
    setStagesState([
      { id: "sourced", label: "Sourced", count: sourcedCount },
      { id: "shortlisted", label: "Shortlisted", count: shortlistedCount },
    ])
  }, [candidates])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sourcing</h2>
        <p className="text-muted-foreground">Find and source candidates for your campaign</p>
      </div>

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
          {(currentStep === "searching" || currentStep === "done") && batches.find(b => b.id === selectedBatch)?.candidates > 0 ? (
            <div className="space-y-3">
              {candidates
                .filter((c) => c.batchNumber === parseInt(selectedBatch) && c.stage === "sourced")
                .map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all border"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={undefined} alt={candidate.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {candidate.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{candidate.name}</p>
                          {candidate.profile_url && (
                            <a
                              href={candidate.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 hover:opacity-80 transition-opacity"
                            >
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                                alt="LinkedIn"
                                className="h-4 w-4"
                              />
                            </a>
                          )}
                        </div>
                        {(candidate.currentTitle || candidate.currentCompany) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Briefcase className="h-3 w-3" />
                            {candidate.currentTitle && candidate.currentCompany
                              ? `${candidate.currentTitle} at ${candidate.currentCompany}`
                              : candidate.currentTitle || candidate.currentCompany}
                          </p>
                        )}
                        {candidate.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {candidate.address}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {typeof candidate.score === "number" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {candidate.score}% Match
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShortlist(candidate.id)
                            }}
                            className="h-7 text-xs"
                          >
                            Shortlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No candidates sourced yet</p>
              <p className="text-sm">Start sourcing to see candidates here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Pipeline Board */}
      {(currentStep === "searching" || currentStep === "done") && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pipeline Board</h2>
            {stagesState.find((s) => s.id === "shortlisted")?.count > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const shortlistedCount = stagesState.find((s) => s.id === "shortlisted")?.count || 0
                  alert(`${shortlistedCount} candidate(s) will be moved to screening`)
                }}
              >
                Move {stagesState.find((s) => s.id === "shortlisted")?.count} to Screening
              </Button>
            )}
          </div>
          <div
            className="overflow-x-auto w-full"
            style={{
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              className="flex gap-4 pb-4"
              style={{
                minWidth: "fit-content",
                width: "max-content",
              }}
            >
              {stagesState.map((stage) => {
                const candidatesInStage = candidates.filter(
                  (c) => c.stage === stage.id
                )

                return (
                  <div
                    key={stage.id}
                    className="flex-shrink-0 w-64 bg-muted rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">
                        {stage.label}
                      </h3>
                      <span className="text-xs bg-background px-2 py-1 rounded">
                        {stage.count}
                      </span>
                    </div>

                    <div className="space-y-2 min-h-80">
                      {candidatesInStage.map((candidate: any) => {
                        return (
                          <Card
                            key={candidate.id}
                            className={`p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
                              candidate.shortlisted
                                ? "ring-2 ring-primary border-primary shadow-lg shadow-primary/20 bg-primary/5"
                                : ""
                            }`}
                            onClick={() => handleShortlist(candidate.id)}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarImage
                                    src={undefined}
                                    alt={candidate.name}
                                    className="object-cover w-full h-full"
                                  />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold w-full h-full flex items-center justify-center">
                                    {candidate.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase() || "CN"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm truncate">
                                      {candidate.name}
                                    </p>
                                    {candidate.profile_url && (
                                      <a
                                        href={candidate.profile_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                      >
                                        <img
                                          src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                                          alt="LinkedIn"
                                          className="h-4 w-4"
                                        />
                                      </a>
                                    )}
                                  </div>
                                  {(candidate.currentTitle ||
                                    candidate.currentCompany) && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                      <Briefcase className="h-3 w-3" />
                                      {candidate.currentTitle &&
                                      candidate.currentCompany
                                        ? `${candidate.currentTitle} at ${candidate.currentCompany}`
                                        : candidate.currentTitle ||
                                          candidate.currentCompany}
                                    </p>
                                  )}
                                  {(candidate.address ||
                                    candidate.score) && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {candidate.address && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {candidate.address}
                                        </p>
                                      )}
                                      {typeof candidate.score === "number" && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] px-1.5 py-0"
                                        >
                                          {candidate.score}% Match
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}

                      {candidatesInStage.length === 0 && (
                        <div className="text-[10px] text-muted-foreground italic">
                          No candidates in this stage yet.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

