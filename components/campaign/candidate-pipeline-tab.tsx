"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Plus,
  Search,
  Database,
  ExternalLink,
  MapPin,
  Briefcase,
  Loader2,
  Save,
} from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"

const stagesInitial = [
  { id: "sourced", label: "Sourced", count: 12 },
  { id: "screened", label: "Screened", count: 5 },
  { id: "contacted", label: "Contacted", count: 3 },
  { id: "responded", label: "Responded", count: 2 },
  { id: "verify", label: "Verify", count: 2 },
  { id: "qualified", label: "Qualified", count: 1 },
  { id: "booked", label: "Booked", count: 0 },
  { id: "hired", label: "Hired/Rejected", count: 0 },
]

const mockCandidates = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    stage: "sourced",
    score: 92,
    skills: ["Python", "ML", "TensorFlow"],
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    stage: "sourced",
    score: 78,
    skills: ["Python", "Pandas"],
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol@example.com",
    stage: "screened",
    score: 85,
    skills: ["Python", "React", "AWS"],
  },
]

interface CandidatePipelineTabProps {
  onCandidateClick?: (candidate: (typeof mockCandidates)[0]) => void
  selectedCandidateId?: number | null
  isRightPanelCollapsed?: boolean
  campaignId?: string
}

/**
 * In-memory per-campaign cache so we don't refetch/import on every tab open.
 */
const pipelineCache: Record<
  string,
  {
    candidates: any[]
    stages: typeof stagesInitial
    databaseCandidatesAdded: number
    timestamp: number
  }
> = {}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function CandidatePipelineTab({
  onCandidateClick,
  selectedCandidateId,
  isRightPanelCollapsed = false,
  campaignId,
}: CandidatePipelineTabProps) {
  const [searchResults, setSearchResults] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [uploadedCandidates] = useState(0)
  const [databaseCandidatesAdded, setDatabaseCandidatesAdded] = useState(0)
  const [jobBoardCandidates] = useState(0)
  const [totalCandidatesCount, setTotalCandidatesCount] = useState(0)
  const [pipelineCandidates, setPipelineCandidates] =
    useState<any[]>(mockCandidates)
  const [stagesState, setStagesState] =
    useState<typeof stagesInitial>(stagesInitial)
  const [isAddingCandidates, setIsAddingCandidates] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isAddingAllDatabase, setIsAddingAllDatabase] = useState(false)
  const [hasAddedAllDatabase, setHasAddedAllDatabase] = useState(false)

  // auto-import / state flags
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [hasAutoImportedFromHazel, setHasAutoImportedFromHazel] =
    useState(false)

  // ---------- helpers ----------

  const getCandidatesFromResponse = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.candidates)) return data.candidates
    return []
  }

  const mapBackendCandidate = (candidate: any, index: number) => {
    const latestExperience =
      candidate.experience &&
      Array.isArray(candidate.experience) &&
      candidate.experience.length > 0
        ? candidate.experience[0]
        : null

    return {
      id:
        candidate.id ||
        candidate.email ||
        `hazel-${index}-${Date.now()}`,
      name:
        candidate.name ||
        candidate.full_name ||
        candidate.email ||
        `Candidate ${index + 1}`,
      email: candidate.email || "",
      phone: candidate.phone || null,
      profile_pic_url: candidate.profile_pic_url || null,
      profile_url: candidate.profile_url || null,
      address: candidate.address || candidate.country || null,
      status:
        candidate.status ||
        candidate.profile_status ||
        "Active",
      currentTitle:
        latestExperience?.title ||
        latestExperience?.name ||
        null,
      currentCompany: latestExperience?.company || null,
      stage: "sourced",
      score: candidate.score ?? null,
      skills: candidate.skills || [],
      summary: candidate.summary || null,
      experience: candidate.experience || [],
      education: candidate.education || [],
    }
  }

  const applyAndCache = (
    campaignKey: string | undefined,
    candidates: any[],
    fromAutoImport: boolean,
  ) => {
    if (!candidates.length) return

    setPipelineCandidates((prev) => {
      const existingKeys = new Set(
        prev.map((c) => (c.email || c.id) as string),
      )

      const toAdd: any[] = []
      for (const c of candidates) {
        const key = (c.email || c.id) as string | undefined
        if (key && existingKeys.has(key)) continue
        if (key) existingKeys.add(key)
        toAdd.push({ ...c, stage: "sourced" })
      }

      if (!toAdd.length) return prev

      const nextCandidates = [...prev, ...toAdd]
      const nextStages = stagesState.map((stage) =>
        stage.id === "sourced"
          ? { ...stage, count: stage.count + toAdd.length }
          : stage,
      )
      const nextDatabaseAdded =
        databaseCandidatesAdded + toAdd.length

      setStagesState(nextStages)
      setDatabaseCandidatesAdded(nextDatabaseAdded)
      setIsDirty(true)

      if (fromAutoImport) {
        setHasAddedAllDatabase(true)
        setHasAutoImportedFromHazel(true)
      }

      if (campaignKey) {
        pipelineCache[campaignKey] = {
          candidates: nextCandidates,
          stages: nextStages,
          databaseCandidatesAdded: nextDatabaseAdded,
          timestamp: Date.now(),
        }
      }

      console.log(
        "[CandidatePipelineTab] Added",
        toAdd.length,
        "candidates into Sourced lane (auto=",
        fromAutoImport,
        ")",
      )

      return nextCandidates
    })
  }

  const importAllFromHazel = async (opts?: { auto?: boolean }) => {
    const auto = opts?.auto ?? false
    if (!campaignId) return

    try {
      console.log(
        "[CandidatePipelineTab] importAllFromHazel (auto=",
        auto,
        ")",
      )

      const response = await fetch("/api/candidates", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(
          "[CandidatePipelineTab] /api/candidates HTTP",
          response.status,
        )
        return
      }

      const data = await response.json()
      const rawList = getCandidatesFromResponse(data)

      console.log(
        "[CandidatePipelineTab] /api/candidates resolved list length:",
        rawList.length,
      )

      if (!rawList.length) return

      const mapped = rawList.map(mapBackendCandidate)
      applyAndCache(campaignId, mapped, auto)
    } catch (error) {
      console.error(
        "[CandidatePipelineTab] Error importing Hazel candidates:",
        error,
      )
    }
  }

  // ---------- initial bootstrap: cache + ready check + auto-import ----------

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      if (!campaignId) {
        setIsInitialLoading(false)
        return
      }

      const cacheEntry = pipelineCache[campaignId]
      const now = Date.now()

      // Use cache if fresh
      if (
        cacheEntry &&
        now - cacheEntry.timestamp < CACHE_TTL_MS
      ) {
        console.log(
          "[CandidatePipelineTab] Using cached pipeline for campaign",
          campaignId,
        )
        if (!cancelled) {
          setPipelineCandidates(cacheEntry.candidates)
          setStagesState(cacheEntry.stages)
          setDatabaseCandidatesAdded(
            cacheEntry.databaseCandidatesAdded,
          )
          setHasAddedAllDatabase(true)
          setHasAutoImportedFromHazel(true)
          setIsInitialLoading(false)
        }
        return
      }

      // No/stale cache → check source-all-status & auto-import if ready
      try {
        const url = `/api/source-all-status?campaign_id=${encodeURIComponent(
          campaignId,
        )}`
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log(
          "[CandidatePipelineTab] /api/source-all-status:",
          data,
        )

        const ready = Boolean(data?.ready)

        if (!cancelled && ready) {
          await importAllFromHazel({ auto: true })
        }
      } catch (error) {
        console.error(
          "[CandidatePipelineTab] Failed status/bootstrap:",
          error,
        )
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false)
        }
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [campaignId])

  // ---------- fetch total count (labels only) ----------

  useEffect(() => {
    let cancelled = false

    const fetchCount = async () => {
      try {
        const response = await fetch("/api/candidates", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        if (!response.ok) return
        const data = await response.json()
        const list = getCandidatesFromResponse(data)
        if (!cancelled) {
          setTotalCandidatesCount(list.length)
        }
      } catch (error) {
        console.error(
          "[CandidatePipelineTab] Error fetching candidates count:",
          error,
        )
      }
    }

    fetchCount()
    return () => {
      cancelled = true
    }
  }, [])

  // ---------- manual handlers ----------

  const handleDatabaseSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      setSearchResults(totalCandidatesCount)
      setIsSearching(false)
    }, 1000)
  }

  const handleAddAllDatabase = async () => {
    if (isAddingAllDatabase) return
    setIsAddingAllDatabase(true)
    await importAllFromHazel({ auto: false })
    setHasAddedAllDatabase(true)
    setIsAddingAllDatabase(false)
  }

  const handleAddCandidates = async () => {
    if (isAddingCandidates || searchResults === 0) return
    setIsAddingCandidates(true)
    try {
      const response = await fetch("/api/candidates", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const list = getCandidatesFromResponse(data)
        const sliced = list.slice(0, searchResults)
        const mapped = sliced.map(mapBackendCandidate)
        applyAndCache(campaignId, mapped, false)
      }
    } catch (error) {
      console.error(
        "[CandidatePipelineTab] Error adding candidates:",
        error,
      )
    } finally {
      setIsAddingCandidates(false)
    }
  }

  const handleSave = async () => {
    if (isSaving || !isDirty) return
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      setIsSaving(false)
      setIsDirty(false)
      setHasAddedAllDatabase(false)
    }
  }

  // ---------- render ----------

  return (
    <div
      className={`space-y-6 ${
        isRightPanelCollapsed ? "max-w-6xl" : "max-w-3xl"
      } ${isRightPanelCollapsed ? "mr-4" : "mr-8"} overflow-x-hidden`}
    >
      {/* Source Candidates Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold">
            Source Candidates
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`gap-2 transition-colors ${
              isDirty
                ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                : ""
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                Save
              </>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Upload Candidates */}
          <Card className="h-[450px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Candidates
                </CardTitle>
                {uploadedCandidates > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {uploadedCandidates} added
                  </Badge>
                )}
              </div>
              <CardDescription>
                Add via CV, LinkedIn, or CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <Tabs defaultValue="cv" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="cv"
                    className="text-xs"
                  >
                    CV
                  </TabsTrigger>
                  <TabsTrigger
                    value="linkedin"
                    className="text-xs"
                  >
                    LinkedIn
                  </TabsTrigger>
                  <TabsTrigger
                    value="csv"
                    className="text-xs"
                  >
                    CSV
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="cv"
                  className="space-y-3 mt-4"
                >
                  <Input
                    placeholder="Candidate name"
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Candidate email"
                    className="h-9 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 bg-transparent"
                  >
                    <Upload className="h-3 w-3" />
                    Upload CV
                  </Button>
                </TabsContent>

                <TabsContent
                  value="linkedin"
                  className="space-y-3 mt-4"
                >
                  <Input
                    placeholder="Paste LinkedIn URL"
                    className="h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add from LinkedIn
                  </Button>
                </TabsContent>

                <TabsContent
                  value="csv"
                  className="space-y-3 mt-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 bg-transparent"
                  >
                    <Upload className="h-3 w-3" />
                    Upload CSV
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Format: email, linkedinUrl
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
            <div className="p-4 pt-0 border-t mt-auto">
              <Button
                className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                size="sm"
                disabled={uploadedCandidates === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidates{" "}
                {uploadedCandidates > 0 &&
                  `(${uploadedCandidates})`}
              </Button>
            </div>
          </Card>

          {/* Hazel Database */}
          <Card className="h-[450px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Hazel Database
                </CardTitle>
                {databaseCandidatesAdded > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {databaseCandidatesAdded} added
                  </Badge>
                )}
              </div>
              <CardDescription>
                Search our talent pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full gap-2 transition-colors ${
                    hasAddedAllDatabase
                      ? "border-blue-400 text-blue-600 bg-blue-50"
                      : "bg-transparent"
                  }`}
                  onClick={handleAddAllDatabase}
                  disabled={isAddingAllDatabase}
                >
                  {isAddingAllDatabase ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Add All Database{" "}
                      {totalCandidatesCount > 0 &&
                        `(${totalCandidatesCount})`}
                    </>
                  ) : (
                    <>
                      <Database className="h-3 w-3" />
                      Add All Database{" "}
                      {totalCandidatesCount > 0 &&
                        `(${totalCandidatesCount})`}
                    </>
                  )}
                </Button>

                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Or search with filters:
                </p>

                <div className="space-y-2">
                  <Input
                    placeholder="Skills (e.g., Python, React)"
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paris">
                          Paris
                        </SelectItem>
                        <SelectItem value="london">
                          London
                        </SelectItem>
                        <SelectItem value="berlin">
                          Berlin
                        </SelectItem>
                        <SelectItem value="remote">
                          Remote
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Seniority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">
                          Junior
                        </SelectItem>
                        <SelectItem value="mid">
                          Mid-level
                        </SelectItem>
                        <SelectItem value="senior">
                          Senior
                        </SelectItem>
                        <SelectItem value="lead">
                          Lead
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Keywords"
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Salary range (e.g., 60-80k)"
                    className="h-8 text-xs"
                  />
                </div>

                {searchResults > 0 && (
                  <div className="flex items-center justify-between p-2 bg-primary/10 rounded-md border border-primary/20">
                    <span className="text-xs font-medium text-primary">
                      {searchResults} candidates found
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {searchResults}
                    </Badge>
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleDatabaseSearch}
                  disabled={isSearching}
                >
                  <Search className="h-3 w-3" />
                  {isSearching
                    ? "Searching..."
                    : "Search in Hazel Database"}
                </Button>
              </div>
            </CardContent>
            <div className="p-4 pt-0 border-t mt-auto">
              <Button
                className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                size="sm"
                disabled={
                  searchResults === 0 || isAddingCandidates
                }
                onClick={handleAddCandidates}
              >
                {isAddingCandidates ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Candidates...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidates{" "}
                    {searchResults > 0 &&
                      `(${searchResults})`}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Post on Job Boards (Coming Soon) */}
          <Card className="h-[450px] flex flex-col opacity-60 pointer-events-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Post on Job Boards
                </CardTitle>
                {jobBoardCandidates > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {jobBoardCandidates} added
                  </Badge>
                )}
              </div>
              <CardDescription>
                Publish to external platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="text-center py-6">
                  <Badge
                    variant="secondary"
                    className="mb-3"
                  >
                    Coming Soon
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Automatically post to LinkedIn, Indeed, and
                    other job boards
                  </p>
                </div>
                <div className="space-y-2 opacity-50">
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <input
                      type="checkbox"
                      disabled
                      className="h-3 w-3"
                    />
                    <span className="text-xs">LinkedIn</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <input
                      type="checkbox"
                      disabled
                      className="h-3 w-3"
                    />
                    <span className="text-xs">Indeed</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <input
                      type="checkbox"
                      disabled
                      className="h-3 w-3"
                    />
                    <span className="text-xs">Glassdoor</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 border-t mt-auto">
              <Button
                className="w-full bg-blue-400 text-white"
                size="sm"
                disabled
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Post to Job Boards
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4">
          Pipeline Board
        </h2>
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
              const candidatesInStage = pipelineCandidates.filter(
                (c) => c.stage === stage.id,
              )

              const isSourcedLaneLoading =
                stage.id === "sourced" &&
                isInitialLoading &&
                !hasAutoImportedFromHazel

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
                    {/* Lane-specific loading animation for Sourced */}
                    {isSourcedLaneLoading && (
                      <Card className="p-3 flex items-center gap-2 border-dashed bg-background/60">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <div className="flex flex-col">
                          <p className="text-xs font-medium text-blue-700">
                            Importing Hazel candidates...
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            We&apos;re auto-filling your Sourced lane.
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Candidates in this stage */}
                    {candidatesInStage.map((candidate: any) => {
                      const isSelected =
                        selectedCandidateId === candidate.id
                      const isFromDatabase =
                        candidate.profile_url ||
                        candidate.profile_pic_url

                      return (
                        <Card
                          key={candidate.id}
                          className={`p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
                            isSelected
                              ? "ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50"
                              : ""
                          }`}
                          onClick={() =>
                            onCandidateClick?.(candidate)
                          }
                        >
                          {isFromDatabase &&
                          stage.id === "sourced" ? (
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarImage
                                    src={
                                      candidate.profile_pic_url ||
                                      undefined
                                    }
                                    alt={candidate.name}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      ;(e.currentTarget as HTMLImageElement).style.display =
                                        "none"
                                    }}
                                  />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold w-full h-full flex items-center justify-center">
                                    {candidate.name
                                      ?.split(" ")
                                      .map(
                                        (n: string) =>
                                          n[0],
                                      )
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
                                        href={
                                          candidate.profile_url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) =>
                                          e.stopPropagation()
                                        }
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
                                    candidate.status) && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {candidate.address && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {
                                            candidate.address
                                          }
                                        </p>
                                      )}
                                      {candidate.status && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] px-1.5 py-0"
                                        >
                                          {candidate.status}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="font-sm text-sm font-medium">
                                {candidate.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {candidate.email}
                              </p>
                              {typeof candidate.score ===
                                "number" && (
                                <p className="text-xs font-semibold text-primary mt-2">
                                  Score: {candidate.score}%
                                </p>
                              )}
                            </>
                          )}
                        </Card>
                      )
                    })}

                    {/* Empty state (non-loading) */}
                    {!isSourcedLaneLoading &&
                      candidatesInStage.length === 0 && (
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
    </div>
  )
}
