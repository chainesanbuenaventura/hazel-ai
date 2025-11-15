"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  Settings,
  Play,
  Pause,
  Loader2,
  ChevronRight,
} from "lucide-react"

interface Agent {
  id: string
  name: string
  status:
    | "disabled"
    | "running"
    | "paused"
    | "ready"
    | "waiting"
    | "needs-setup"
    | "loading"
  count: number | null
  countLabel: string | null
  details: Record<string, any>
}

type DisplayStatus = Agent["status"] | "done"

const agents: Agent[] = [
  {
    id: "sourcing",
    name: "Sourcing",
    status: "disabled",
    count: null,
    countLabel: null,
    details: {},
  },
  {
    id: "screening",
    name: "Screening",
    status: "waiting",
    count: 12,
    countLabel: "sourced so far",
    details: {
      screened: 5,
      scoreWeights: { skills: 0.4, location: 0.3, salaryFit: 0.3 },
      minimumThreshold: 0.7,
    },
  },
  {
    id: "outreach",
    name: "Outreach",
    status: "ready",
    count: 3,
    countLabel: "contacted",
    details: {
      replied: 1,
      tone: "Professional",
      sequenceLength: 3,
      delayBetweenFollowups: "2 days",
      personalization: "medium",
    },
  },
  {
    id: "qualifying",
    name: "Qualifying",
    status: "needs-setup",
    count: 2,
    countLabel: "qualified",
    details: {
      qualified: 2,
    },
  },
  {
    id: "scheduling",
    name: "Scheduling",
    status: "ready",
    count: 0,
    countLabel: "scheduled / 5 needed",
    details: {},
  },
]

function getStatusBadge(status: DisplayStatus) {
  switch (status) {
    case "loading":
      return (
        <Badge className="bg-muted text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking…
        </Badge>
      )
    case "disabled":
      return <Badge variant="secondary">Not Available</Badge>
    case "running":
      return (
        <Badge
          className="border-0 shadow-sm"
          style={{ backgroundColor: "#f5fbf0", color: "#7a8b5a" }}
        >
          Running
        </Badge>
      )
    case "paused":
      return <Badge variant="destructive">Paused</Badge>
    case "ready":
      return <Badge className="bg-blue-600">Ready</Badge>
    case "waiting":
      return <Badge className="bg-amber-600">Waiting</Badge>
    case "needs-setup":
      return <Badge className="bg-orange-600">Needs Setup</Badge>
    case "done":
      return (
        <Badge className="bg-emerald-500 text-white">
          Done
        </Badge>
      )
    default:
      return <Badge>Unknown</Badge>
  }
}

function getBatchStatusBadge(status: "pending review" | "not started" | "done") {
  switch (status) {
    case "pending review":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          Pending Review
        </Badge>
      )
    case "not started":
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          Not Started
        </Badge>
      )
    case "done":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          Done
        </Badge>
      )
  }
}

interface OverviewTabProps {
  onNavigateToTab?: (tab: string) => void
  campaignId?: string
}

export function OverviewTab({ onNavigateToTab, campaignId }: OverviewTabProps) {
  const [configOpen, setConfigOpen] = useState<string | null>(null)

  // Target interviews
  const [objective, setObjective] = useState<number | "">(0)

  // New: Timeframe to hire (weeks)
  const [timelineWeeks, setTimelineWeeks] = useState<number | "">("")

  const [isRunning, setIsRunning] = useState(false)
  const [blockedReason, setBlockedReason] = useState<string | null>(null)
  const [candidatesUploaded, setCandidatesUploaded] = useState(false)
  const [prequalConfirmed, setPrequalConfirmed] = useState(false)

  const [isSourcingReady, setIsSourcingReady] = useState<boolean | null>(null)
  const [isSourcingStatusLoading, setIsSourcingStatusLoading] = useState(false)
  const [, setSourcingError] = useState<string | null>(null)

  const [sourcingTooltip, setSourcingTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
  })

  // Batch data for sourcing agent
  const [sourcingBatch, setSourcingBatch] = useState<{
    batchNumber: number
    totalBatches: number | "NA"
    totalCandidates: number
    goodFits: number
    tier: string
    status: "pending review" | "not started" | "done"
  } | null>(null)
  const [isLoadingBatch, setIsLoadingBatch] = useState(false)

  // Fetch sourcing batch data
  useEffect(() => {
    if (!campaignId) return

    const fetchBatchData = async () => {
      setIsLoadingBatch(true)
      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch(`/api/sourcing-batch?campaign_id=${campaignId}`)
        // const data = await response.json()
        // setSourcingBatch(data)
        
        // Mock data for now - replace with API call
        const mockData = {
          batchNumber: 1,
          totalBatches: "NA" as number | "NA",
          totalCandidates: 0,
          goodFits: 0,
          tier: "",
          status: "not started" as "pending review" | "not started" | "done",
        }
        
        // If totalBatches is "NA" or batchNumber is 1, status should be "not started"
        if (mockData.totalBatches === "NA" || mockData.batchNumber === 1) {
          mockData.status = "not started"
        }
        
        setSourcingBatch(mockData)
      } catch (error) {
        console.error("Failed to fetch sourcing batch:", error)
      } finally {
        setIsLoadingBatch(false)
      }
    }

    fetchBatchData()
  }, [campaignId])

  const [agentStatusOverrides, setAgentStatusOverrides] = useState<
    Record<string, Agent["status"] | undefined>
  >({})

  useEffect(() => {
    let cancelled = false

    const checkStatus = async () => {
      if (!campaignId) {
        setIsSourcingReady(null)
        setIsSourcingStatusLoading(false)
        setSourcingError("No campaign id provided")
        return
      }

      setIsSourcingStatusLoading(true)
      setSourcingError(null)

      try {
        const url = `/api/source-all-status?campaign_id=${encodeURIComponent(
          campaignId,
        )}`
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        console.log("[OverviewTab] /api/source-all-status response:", data)

        if (!cancelled) {
          // When backend returns ready: true, sourcing agent turns green (Done status)
          // Expected response: {"campaign_id":"[id]","source_all_hazel_database":true,"ready":true}
          setIsSourcingReady(Boolean(data?.ready))
          setIsSourcingStatusLoading(false)
        }
      } catch (err) {
        console.error("[OverviewTab] Failed to fetch sourcing status:", err)
        if (!cancelled) {
          setIsSourcingReady(false)
          setIsSourcingStatusLoading(false)
          setSourcingError("Unable to verify sourcing status")
        }
      }
    }

    checkStatus()
    return () => {
      cancelled = true
    }
  }, [campaignId])

  const candidateCount = candidatesUploaded
    ? agents.find((a) => a.id === "screening")?.count ?? 0
    : 0

  const targetSet = objective && Number(objective) > 0
  const timelineSet = timelineWeeks && Number(timelineWeeks) > 0

  const isBlockedFromStart =
    !candidatesUploaded || !prequalConfirmed || !targetSet || !timelineSet

  const handleStartAutopilot = () => {
    if (isBlockedFromStart) {
      if (!candidatesUploaded) setBlockedReason("candidates")
      else if (!prequalConfirmed) setBlockedReason("prequal")
      else if (!targetSet) setBlockedReason("target")
      else if (!timelineSet) setBlockedReason("timeline")
      return
    }
    setIsRunning(true)
    setBlockedReason(null)
  }

  const handleUploadCandidates = () => {
    if (onNavigateToTab) onNavigateToTab("candidate-pipeline")
  }

  const handleConfirmPrequal = () => {
    if (onNavigateToTab) onNavigateToTab("pre-questions")
  }

  const setAgentStatus = (id: string, status: Agent["status"]) => {
    setAgentStatusOverrides((prev) => ({ ...prev, [id]: status }))
  }

  const getEffectiveStatus = (agent: Agent): Agent["status"] => {
    if (agent.id === "sourcing") {
      if (isSourcingStatusLoading) return "loading"
      if (isSourcingReady === true) return "ready"
      if (isSourcingReady === false) return "disabled"
      return agent.status
    }
    return agentStatusOverrides[agent.id] ?? agent.status
  }

  return (
    <>
      <div className="space-y-8">
        {/* Autopilot */}
        <Card
          className={`border-2 ${
            isRunning ? "border-opacity-30" : "border-primary/20"
          }`}
          style={isRunning ? { borderColor: "#e8f5d9" } : {}}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Autopilot Mode</CardTitle>
                <CardDescription>
                  Define your hiring objective to start
                </CardDescription>
              </div>
              {isRunning && (
                <Badge
                  className="border-0 shadow-sm"
                  style={{ backgroundColor: "#f5fbf0", color: "#7a8b5a" }}
                >
                  Running
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Target interviews */}
              <div className="flex-1 min-w-[180px] space-y-2">
                <label className="text-base font-medium">
                  Target Number of Interviews to Book
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 5"
                  value={objective}
                  onChange={(e) =>
                    setObjective(
                      e.target.value ? Number.parseInt(e.target.value) : "",
                    )
                  }
                  disabled={isRunning}
                  className="bg-background"
                />
              </div>

              {/* Timeframe to hire */}
              <div className="w-56 space-y-2">
                {!timelineSet && (
                  <p className="text-xs text-muted-foreground">
                    This helps Hazel pace sourcing, screening & outreach.
                  </p>
                )}
                <label className="text-base font-medium">
                  Timeframe to Hire (weeks)
                </label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g., 4"
                  value={timelineWeeks}
                  onChange={(e) =>
                    setTimelineWeeks(
                      e.target.value ? Number.parseInt(e.target.value) : "",
                    )
                  }
                  disabled={isRunning}
                  className="bg-background"
                />
              </div>

              {/* Start / Pause */}
              <div className="flex gap-2">
                {!isRunning ? (
                  <Button
                    onClick={handleStartAutopilot}
                    className={`gap-2 ${
                      isBlockedFromStart ? "opacity-75 cursor-pointer" : ""
                    }`}
                    size="lg"
                  >
                    <Play className="h-4 w-4" />
                    Start Autopilot
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsRunning(false)}
                    variant="destructive"
                    className="gap-2"
                    size="lg"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
              </div>
            </div>

            {blockedReason && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    {!candidatesUploaded && (
                      <div className="flex items-center gap-2 text-base text-amber-800">
                        <span>☐</span>
                        <span>Upload candidates</span>
                        <button
                          onClick={handleUploadCandidates}
                          className="text-amber-700 underline hover:font-semibold"
                        >
                          Go to Candidate Pipeline →
                        </button>
                      </div>
                    )}
                    {!prequalConfirmed && (
                      <div className="flex items-center gap-2 text-base text-amber-800">
                        <span>☐</span>
                        <span>Confirm pre-qualifying questions</span>
                        <button
                          onClick={handleConfirmPrequal}
                          className="text-amber-700 underline hover:font-semibold"
                        >
                          Go to Pre-qualifying Questions →
                        </button>
                      </div>
                    )}
                    {!targetSet && (
                      <div className="flex items-center gap-2 text-base text-amber-800">
                        <span>☐</span>
                        <span>Set target interviews above</span>
                      </div>
                    )}
                    {!timelineSet && (
                      <div className="flex items-center gap-2 text-base text-amber-800">
                        <span>☐</span>
                        <span>Set timeframe to hire (weeks)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isRunning && (
              <p className="text-sm text-muted-foreground">
                Target: {objective} interviews • Timeframe: {timelineWeeks} weeks •
                Status: All agents active and pacing to hit your goal.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Agents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Agents Status</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const baseStatus = getEffectiveStatus(agent)

              const isDisabled = baseStatus === "disabled"
              const isWaiting = baseStatus === "waiting"
              const needsSetup = baseStatus === "needs-setup"
              const isRunningAgent = baseStatus === "running"

              const highlightSourcing =
                agent.id === "sourcing" &&
                blockedReason &&
                !candidatesUploaded
              const highlightQualifying =
                agent.id === "qualifying" &&
                blockedReason &&
                !prequalConfirmed

              const sourcingReadyHighlight =
                agent.id === "sourcing" && isSourcingReady === true
              const sourcingNotReadyHighlight =
                agent.id === "sourcing" &&
                isSourcingReady === false &&
                !isSourcingStatusLoading

              const runningHighlight =
                agent.id !== "sourcing" && isRunningAgent

              const cardHighlightClass = runningHighlight
                ? "border-2 border-amber-300 bg-amber-50"
                : highlightSourcing || highlightQualifying
                  ? ""
                  : sourcingReadyHighlight
                    ? "border-2 border-emerald-400 bg-emerald-50/40"
                    : sourcingNotReadyHighlight
                      ? ""
                      : ""

              const playIsPause = isRunningAgent

              const displayStatus: DisplayStatus = sourcingReadyHighlight
                ? "done"
                : baseStatus

              const handlePlayPauseClick = (
                event: React.MouseEvent<HTMLButtonElement>,
              ) => {
                if (agent.id === "sourcing") {
                  const rect = event.currentTarget.getBoundingClientRect()
                  setSourcingTooltip({
                    visible: true,
                    x: rect.right + 8,
                    y: rect.top + window.scrollY,
                  })
                  setTimeout(
                    () =>
                      setSourcingTooltip((prev) => ({
                        ...prev,
                        visible: false,
                      })),
                    2000,
                  )
                  return
                }

                if (playIsPause) {
                  setAgentStatus(agent.id, "paused")
                } else {
                  setAgentStatus(agent.id, "running")
                }
              }

              return (
                <Card
                  key={agent.id}
                  className={`relative h-52 flex flex-col ${cardHighlightClass}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          {agent.name}
                        </CardTitle>

                        {agent.id === "sourcing" && (
                          <div className="mt-1">
                            {isLoadingBatch ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Loading batch data...</p>
                              </div>
                            ) : sourcingBatch ? (
                              <p className="text-sm text-center text-muted-foreground">
                                Latest Batch: <span className="font-semibold text-primary">{sourcingBatch.totalBatches}</span>
                              </p>
                            ) : (
                              <p className="text-sm text-center text-muted-foreground">No batch data available</p>
                            )}
                          </div>
                        )}
                      </div>
                      {agent.id === "sourcing" && sourcingBatch ? (
                        getBatchStatusBadge(sourcingBatch.status)
                      ) : agent.id === "sourcing" ? (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          Not Started
                        </Badge>
                      ) : (
                        getStatusBadge(displayStatus)
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="h-full pt-1 pb-3">
                    <div className="h-full flex flex-col">
                      <div className="flex-1 space-y-2">
                        {agent.id === "sourcing" ? (
                          isLoadingBatch ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : sourcingBatch ? (
                            <div className="space-y-3">
                              <div>
                                <div className="text-3xl font-bold text-primary">
                                  {sourcingBatch.totalCandidates}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  candidates
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sm w-full bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                                onClick={() => {
                                  if (onNavigateToTab) onNavigateToTab("sourcing")
                                }}
                              >
                                View current batch
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sm"
                                onClick={() => {
                                  if (onNavigateToTab) onNavigateToTab("sourcing")
                                }}
                              >
                                View current batch
                              </Button>
                            </div>
                          )
                        ) : (
                          <>
                            {agent.id === "screening" && (
                              <div>
                                <div className="text-3xl font-bold text-primary">
                                  {candidateCount}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {candidatesUploaded
                                    ? agent.countLabel
                                    : "candidates"}
                                </p>
                              </div>
                            )}

                            {agent.id !== "screening" &&
                              agent.count !== null && (
                                <div>
                                  <div className="text-3xl font-bold text-primary">
                                    {agent.count}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {agent.countLabel}
                                  </p>
                                </div>
                              )}

                            {isWaiting && agent.id === "screening" && (
                              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-900">
                                Add candidates to unlock Screening.
                              </div>
                            )}

                            {needsSetup && agent.id === "qualifying" && (
                              <button
                                onClick={handleConfirmPrequal}
                                className="w-full bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-900 hover:bg-blue-100 transition-colors text-left"
                              >
                                Confirm pre-qual questions to enable
                                Qualifying.
                              </button>
                            )}

                            {agent.id === "outreach" &&
                              baseStatus === "ready" && (
                                <p className="text-sm text-muted-foreground">
                                  Outreach will contact top-fit candidates using
                                  your templates.
                                </p>
                              )}

                            {agent.id === "scheduling" &&
                              baseStatus === "ready" && (
                                <p className="text-sm text-muted-foreground">
                                  Scheduling will book interviews for qualified
                                  candidates.
                                </p>
                              )}
                          </>
                        )}
                      </div>

                      {/* FOOTER */}
                      <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
                        {agent.id !== "sourcing" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfigOpen(
                                configOpen === agent.id ? null : agent.id,
                              )
                            }
                            className="h-7 w-7 p-0"
                            title={`Configure ${agent.name} parameters`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}

                        {agent.id === "sourcing" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Start the sourcing agent (play it)
                              setAgentStatus("sourcing", "running")
                            }}
                            className="h-7 px-3 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 ml-auto"
                          >
                            <Play className="h-4 w-4" />
                            <span className="text-xs">Start New batch</span>
                          </Button>
                        ) : (
                          <>
                            <div></div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handlePlayPauseClick}
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title={
                                playIsPause
                                  ? `Pause ${agent.name}`
                                  : `Start ${agent.name}`
                              }
                            >
                              {playIsPause ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>

                      {/* CONFIG */}
                      {configOpen === agent.id && (
                        <div className="absolute inset-x-4 bottom-11 p-3 bg-muted rounded-lg space-y-2 text-xs border shadow-sm">
                          {agent.id === "screening" && (
                            <>
                              <div>
                                <span className="font-semibold">
                                  Screened:
                                </span>{" "}
                                {agent.details.screened}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Score Weights:
                                </span>
                                <div className="ml-2 mt-1 space-y-0.5">
                                  <div>
                                    Skills:{" "}
                                    {(
                                      agent.details.scoreWeights?.skills *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </div>
                                  <div>
                                    Location:{" "}
                                    {(
                                      agent.details.scoreWeights?.location *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </div>
                                  <div>
                                    Salary:{" "}
                                    {(
                                      agent.details.scoreWeights?.salaryFit *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Min Threshold:
                                </span>{" "}
                                {(
                                  agent.details.minimumThreshold * 100
                                ).toFixed(0)}
                                %
                              </div>
                            </>
                          )}

                          {agent.id === "outreach" && (
                            <>
                              <div>
                                <span className="font-semibold">Replied:</span>{" "}
                                {agent.details.replied}
                              </div>
                              <div>
                                <span className="font-semibold">Tone:</span>{" "}
                                {agent.details.tone}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Sequence:
                                </span>{" "}
                                {agent.details.sequenceLength} messages
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Personalization:
                                </span>{" "}
                                {agent.details.personalization}
                              </div>
                            </>
                          )}

                          {agent.id === "qualifying" && (
                            <div>
                              <span className="font-semibold">
                                Qualified:
                              </span>{" "}
                              {agent.details.qualified}
                            </div>
                          )}

                          {agent.id === "scheduling" && (
                            <div>
                              <span className="font-semibold">
                                Scheduled:
                              </span>{" "}
                              0 / 5
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Candidate Pipeline Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
            <CardDescription>Current flow across all stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { count: 12, label: "Sourced", color: "blue" },
                { count: 5, label: "Screened", color: "purple" },
                { count: 3, label: "Contacted", color: "orange" },
                { count: 2, label: "Qualified", color: "green" },
              ].map((stage) => (
                <div
                  key={stage.label}
                  className="text-center p-3 bg-muted rounded-lg"
                >
                  <div
                    className={`text-3xl font-bold text-${stage.color}-600`}
                  >
                    {stage.count}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stage.label}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 bg-transparent"
            >
              Go to Full Pipeline
            </Button>
          </CardContent>
        </Card>

        {/* JD Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Position overview</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
            >
              Edit in JD Tab
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              Senior Machine Learning Engineer - Build and maintain ML systems.
              5+ years experience required.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sourcing tooltip */}
      {sourcingTooltip.visible && (
        <div
          className="fixed z-50 px-3 py-1.5 text-xs rounded-md shadow-md bg-slate-900 text-white pointer-events-none"
          style={{ top: sourcingTooltip.y, left: sourcingTooltip.x }}
        >
          Sourcing automation isn&apos;t available yet.
          Add candidates manually. Autopilot sourcing is coming soon.
        </div>
      )}
    </>
  )
}
