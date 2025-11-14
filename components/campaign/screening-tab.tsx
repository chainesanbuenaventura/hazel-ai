"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, Search, Filter, MapPin, Briefcase, ThumbsUp, ThumbsDown, Sparkles, Play,
} from "lucide-react"
import {
  Avatar, AvatarImage, AvatarFallback,
} from "@/components/ui/avatar"

interface RawCandidate {
  id?: string
  email?: string | null
  name?: string | null
  full_name?: string | null
  phone?: string | null
  address?: string | null
  country?: string | null
  summary?: string | null
  profile_status?: string | null
  profile_url?: string | null
  profile_pic_url?: string | null
  experience?: any[]
  skills?: any[]
}

export interface ScreeningCandidate {
  id: string
  name: string
  email: string
  profile_url?: string | null
  profile_pic_url?: string | null
  address?: string | null
  status?: string | null
  currentTitle?: string | null
  currentCompany?: string | null
  skills: string[]
  score: number
  decision?: "shortlisted" | "rejected"
}

export interface ChatRankResult {
  candidateId: string
  relevance: number
}

interface ScreeningTabProps {
  campaignId?: string
  onCandidateClick?: (candidate: ScreeningCandidate) => void
  selectedCandidateId?: string | number | null
  isRightPanelCollapsed?: boolean
  chatResults?: ChatRankResult[]
}

export function ScreeningTab({
  campaignId,
  onCandidateClick,
  selectedCandidateId,
  isRightPanelCollapsed = false,
  chatResults,
}: ScreeningTabProps) {
  // Data
  const [candidates, setCandidates] = useState<ScreeningCandidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<ScreeningCandidate[]>([])

  // UI state
  const [isFetching, setIsFetching] = useState<boolean>(false) // internal fetch; no UI spinner
  const [hasStarted, setHasStarted] = useState<boolean>(false) // gate fit list until clicked
  const [isScreening, setIsScreening] = useState<boolean>(false) // show loader only after click

  // Fit filters
  const [minScore, setMinScore] = useState<number>(70)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "shortlisted" | "rejected">("all")

  // ------- helpers -------
  const getCandidatesFromResponse = (data: any): RawCandidate[] => {
    if (!data) return []
    if (Array.isArray(data)) return data as RawCandidate[]
    if (Array.isArray(data.candidates)) return data.candidates as RawCandidate[]
    if (Array.isArray(data.data)) return data.data as RawCandidate[]
    return []
  }

  const computeScore = (c: RawCandidate): number => {
    const skillsCount = Array.isArray(c.skills) ? c.skills.length : 0
    const hasLinkedIn = c.profile_url ? 10 : 0
    const hasSummary = c.summary ? 5 : 0
    const base = 40
    let score = base + Math.min(skillsCount * 3, 30) + hasLinkedIn + hasSummary
    if (c.profile_status === "active") score += 10
    if (!Number.isFinite(score)) score = 50
    return Math.round(Math.max(20, Math.min(99, score)))
  }

  const mapCandidate = (c: RawCandidate, index: number): ScreeningCandidate => {
    const latestExp =
      c.experience && Array.isArray(c.experience) && c.experience.length > 0
        ? c.experience[0]
        : null

    const skills: string[] = Array.isArray(c.skills)
      ? (c.skills
          .map((s: any) => (typeof s === "string" ? s : typeof s?.name === "string" ? s.name : null))
          .filter(Boolean) as string[])
      : []

    return {
      id: c.id || c.email || `screen-${index}-${Date.now()}`,
      name: c.name || c.full_name || c.email || "Unknown candidate",
      email: c.email || "",
      profile_url: c.profile_url || null,
      profile_pic_url: c.profile_pic_url || null,
      address: c.address || c.country || undefined,
      status: c.profile_status || undefined,
      currentTitle: latestExp?.title || latestExp?.name || null,
      currentCompany: latestExp?.company || null,
      skills,
      score: computeScore(c),
    }
  }

  const applyFilters = (
    all: ScreeningCandidate[],
    {
      min,
      term,
      status,
    }: {
      min: number
      term: string
      status: "all" | "shortlisted" | "rejected"
    },
  ) => {
    const t = term.trim().toLowerCase()
    const next = all.filter((c) => {
      if (c.score < min) return false
      if (status !== "all" && c.decision !== status) return false
      if (!t) return true
      const haystack = [
        c.name, c.email, c.currentTitle, c.currentCompany, c.address, c.skills.join(" "),
      ].join(" ").toLowerCase()
      return haystack.includes(t)
    })
    setFilteredCandidates(next)
  }

  // ------- fetch silently on mount / campaign change -------
  useEffect(() => {
    let cancelled = false
    const fetchAndScore = async () => {
      setIsFetching(true)
      try {
        const res = await fetch("/api/candidates", {
          method: "GET",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const raw = getCandidatesFromResponse(data)
        const mapped = raw.map(mapCandidate)
        if (!cancelled) setCandidates(mapped)
      } catch (err) {
        console.error("[ScreeningTab] Error loading candidates:", err)
        if (!cancelled) setCandidates([])
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    fetchAndScore()
    return () => { cancelled = true }
  }, [campaignId])

  // ------- re-apply filters ONLY after start -------
  useEffect(() => {
    if (!hasStarted) return
    applyFilters(candidates, { min: minScore, term: searchTerm, status: statusFilter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScore, searchTerm, statusFilter, candidates, hasStarted])

  // ------- decisions -------
  const handleDecision = (id: string, decision: "shortlisted" | "rejected") => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, decision: c.decision === decision ? undefined : decision } : c)),
    )
  }

  // ------- chat relevance (independent) -------
  const chatRankedCandidates = useMemo(() => {
    if (!chatResults || chatResults.length === 0) return []
    const byId = new Map(candidates.map((c) => [String(c.id), c]))
    return (
      chatResults
        .map((r) => {
          const c = byId.get(String(r.candidateId))
          return c ? { ...c, _relevance: r.relevance } : null
        })
        .filter(Boolean)
        .sort((a: any, b: any) => (b._relevance ?? 0) - (a._relevance ?? 0)) as (ScreeningCandidate & {
        _relevance?: number
      })[]
    )
  }, [chatResults, candidates])

  // ------- shared card -------
  const renderCandidateCard = (
    c: ScreeningCandidate & { _relevance?: number },
    opts?: {
      isSelected?: boolean
      badgeLabel?: string
      badgeTone?: "fit" | "chat"
      relevance?: number
    },
  ) => {
    const { isSelected, badgeLabel, badgeTone, relevance } = opts || {}
    const toneClass =
      badgeTone === "chat"
        ? "bg-purple-50 text-purple-600 border-purple-200"
        : "bg-blue-50 text-blue-600 border-blue-200"

    return (
      <Card
        key={c.id + (badgeTone || "")}
        className={`p-3 flex items-start gap-3 cursor-pointer hover:shadow-md transition-all duration-150 ${
          isSelected ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/40" : ""
        }`}
        onClick={() => onCandidateClick?.(c)}
      >
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage
            src={c.profile_pic_url || undefined}
            alt={c.name}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
          <AvatarFallback className="text-[9px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "CN"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{c.name}</p>

            {c.profile_url && (
              <a
                href={c.profile_url}
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

            {c.status && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {c.status}
              </Badge>
            )}

            {badgeLabel && (
              <Badge
                variant="outline"
                className={`text-[8px] px-1.5 py-0 ml-1 border ${toneClass}`}
              >
                {badgeLabel}
              </Badge>
            )}
          </div>

          {(c.currentTitle || c.currentCompany) && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {c.currentTitle && c.currentCompany
                ? `${c.currentTitle} at ${c.currentCompany}`
                : c.currentTitle || c.currentCompany}
            </p>
          )}

          {c.address && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {c.address}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 ml-2">
          {/* Fit score */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-muted-foreground">Fit score</span>
            <span
              className={`text-sm font-semibold ${
                c.score >= 80 ? "text-emerald-600" : c.score >= 70 ? "text-blue-600" : "text-amber-600"
              }`}
            >
              {c.score}%
            </span>
          </div>

          {/* Chat relevance */}
          {typeof relevance === "number" && (
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-purple-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Match
              </span>
              <span className="text-[10px] font-semibold text-purple-600">
                {Math.round(Math.max(0, Math.min(relevance <= 1 ? relevance * 100 : relevance, 100)))}%
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1 mt-1">
            <Button
              size="icon"
              variant={c.decision === "shortlisted" ? "default" : "outline"}
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                handleDecision(c.id, "shortlisted")
              }}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant={c.decision === "rejected" ? "destructive" : "outline"}
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                handleDecision(c.id, "rejected")
              }}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Start matching: gate + short loader
  const handleStartMatching = () => {
    setHasStarted(true)
    setIsScreening(true)
    // fake brief compute; you can trigger a backend job here
    setTimeout(() => {
      applyFilters(candidates, { min: minScore, term: searchTerm, status: statusFilter })
      setIsScreening(false)
    }, 600)
  }

  // ------- render -------
  const fitShown = hasStarted ? filteredCandidates.length : 0

  return (
    <div
      className={`space-y-6 ${
        isRightPanelCollapsed ? "max-w-6xl mr-4" : "max-w-3xl mr-8"
      } overflow-x-hidden`}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Screening</CardTitle>
          <CardDescription>
            Left: baseline fit ranking (starts on click). Right: AI chat relevance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center text-xs">
          {/* Min score */}
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Min fit score</span>
            <Select value={String(minScore)} onValueChange={(v) => setMinScore(parseInt(v, 10) || 0)}>
              <SelectTrigger className="h-8 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="70">70</SelectItem>
                <SelectItem value="80">80</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[140px] flex items-center gap-2">
            <Search className="h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, company... (fit view)"
              className="h-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Counters */}
          <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[9px] px-2 py-0.5">
              {fitShown} fit shown
            </Badge>
            <span>{candidates.length} total</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              {chatRankedCandidates.length > 0
                ? `${chatRankedCandidates.length} chat matches`
                : "No chat matches yet"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* LEFT: FIT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Baseline fit ranking
            </span>

            {/* Start matching button beside the label */}
            {!hasStarted && (
              <Button
                size="sm"
                className="h-7 px-3 gap-1 text-[10px] bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0 hover:from-blue-600 hover:to-blue-500"
                onClick={handleStartMatching}
              >
                <Play className="h-3 w-3" />
                Start matching
              </Button>
            )}
          </div>

          {/* Empty until click */}
          {!hasStarted && (
            <Card className="p-4 text-[10px] text-muted-foreground">
              Click <span className="font-medium text-blue-600">Start matching</span> to run baseline fit.
            </Card>
          )}

          {/* Loader only after click */}
          {hasStarted && isScreening && (
            <Card className="p-4 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-xs text-muted-foreground">Screening candidates by baseline fit…</span>
            </Card>
          )}

          {/* Results after loader */}
          {hasStarted && !isScreening && filteredCandidates.length === 0 && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">
                No candidates match the current fit filters. Try lowering the min score or changing status.
              </p>
            </Card>
          )}

          {hasStarted && !isScreening &&
            filteredCandidates.map((c) =>
              renderCandidateCard(c, {
                isSelected: String(selectedCandidateId ?? "") === String(c.id),
                badgeLabel: "Fit",
                badgeTone: "fit",
              }),
            )}
        </div>

        {/* RIGHT: CHAT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Chat relevance
            </span>
            <span className="text-[9px] text-muted-foreground text-right">
              Driven by your latest AI Copilot query. Not affected by the fit filters.
            </span>
          </div>

          {chatRankedCandidates.length === 0 ? (
            <Card className="p-4">
              <p className="text-[10px] text-muted-foreground">
                Ask Hazel in the AI Copilot panel to rank candidates, for example:
              </p>
              <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground list-disc list-inside">
                <li>“Show top 5 candidates for this campaign.”</li>
                <li>“Find senior React engineers in Berlin with fintech experience.”</li>
                <li>“Who is the single best match for this role?”</li>
              </ul>
            </Card>
          ) : (
            chatRankedCandidates.map((c) =>
              renderCandidateCard(c, {
                isSelected: String(selectedCandidateId ?? "") === String(c.id),
                badgeLabel: "Chat match",
                badgeTone: "chat",
                relevance: c._relevance,
              }),
            )
          )}
        </div>
      </div>
    </div>
  )
}
