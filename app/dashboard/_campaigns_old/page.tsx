"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert" 

import {
  Plus,
  Search,
  MapPin,
  Building2,
  Clock,
  Users,
  Briefcase,
  Euro,
  Calendar,
  Eye,
  AlertCircle,
  Upload,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import SharedAIPanel from "@/components/shared-ai-panel"
import { useAIPanel } from "@/components/ai-panel-context"

interface Campaign {
  campaign_id: string
  created_at: string | null
  updated_at: string | null
  job: {
    title: string
    company: string
    location: string
    contract: string
    seniority: string | null
    salary_min: number | null
    salary_max: number | null
    salary_currency: string
    description: string
    work_mode: string
    department: string | null
    company_desc: string
    skills: Array<{ name: string; mastery: string | null }>
    benefits: string[]
    requirements: string[]
  }
}

interface ApiResponse {
  success: boolean
  data: Campaign[]
  count: number
  error?: string
}

// Cache management
const CAMPAIGNS_CACHE_KEY = "campaigns_cache"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheData {
  data: Campaign[]
  timestamp: number
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  
  // AI Panel context
  const {
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    selectedContextCandidate,
    setSelectedContextCandidate,
    selectedContextCampaign,
    setSelectedContextCampaign,
    selectedProfileView,
    setSelectedProfileView,
    selectedCampaignView,
    setSelectedCampaignView,
    campaigns: rightPanelCampaigns,
    candidates: rightPanelCandidates,
  } = useAIPanel()

  // Cache helper functions
  const isCacheValid = (cacheData: CacheData): boolean => {
    return Date.now() - cacheData.timestamp < CACHE_DURATION
  }

  const getCachedData = (): Campaign[] | null => {
    try {
      const cached = localStorage.getItem(CAMPAIGNS_CACHE_KEY)
      if (!cached) return null

      const cacheData: CacheData = JSON.parse(cached)
      if (isCacheValid(cacheData)) {
        console.log("📦 Using cached campaigns data")
        return Array.isArray(cacheData.data) ? cacheData.data : []
      }

      localStorage.removeItem(CAMPAIGNS_CACHE_KEY)
      return null
    } catch (error) {
      console.error("❌ Error reading campaigns cache:", error)
      localStorage.removeItem(CAMPAIGNS_CACHE_KEY)
      return null
    }
  }

  const setCachedData = (data: Campaign[]) => {
    try {
      const arrayData = Array.isArray(data) ? data : []
      const cacheData: CacheData = {
        data: arrayData,
        timestamp: Date.now(),
      }
      localStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(cacheData))
      console.log("💾 Campaigns data cached successfully")
    } catch (error) {
      console.error("❌ Error caching campaigns data:", error)
    }
  }

  const formatLastFetch = (date: Date | null) => {
    if (!date) return "Never"
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async (useCache = true) => {
    console.log("🚀 Starting fetchCampaigns, useCache:", useCache)
    setLoading(true)
    setError(null)
    setDebugInfo("")

    try {
      // Check cache first if useCache is true
      if (useCache) {
        const cachedData = getCachedData()
        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
          console.log("📦 Using cached data:", cachedData.length, "campaigns")
          setCampaigns(cachedData)
          setLastFetch(new Date())
          setLoading(false)
          setDebugInfo(`Using cached data: ${cachedData.length} campaigns`)
          return
        }
      }

      console.log("🌐 Fetching campaigns from API proxy...")
      setDebugInfo("Fetching from API...")

      const response = await fetch("/api/campaigns-proxy", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        // Add timeout
        signal: AbortSignal.timeout(30000),
      })

      console.log("📡 API proxy response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Reset retry count on success
        setRetryCount(0)

        const campaignsData = result.data || []
        console.log("✅ Campaigns loaded and sorted:", campaignsData.length)
        setDebugInfo(`API returned ${campaignsData.length} campaigns`)

        // Cache the data
        setCachedData(campaignsData)

        // Data is already sorted by the API (newest first)
        setCampaigns(campaignsData)
        setLastFetch(new Date())
      } else {
        setError(result.error || "Failed to fetch campaigns")
        setDebugInfo(`API Error: ${result.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("💥 Error fetching campaigns:", err)

      let errorMessage = "Failed to fetch campaigns"

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage = "Request timeout - API took too long to respond"
        } else if (err.message.includes("fetch")) {
          errorMessage = "Network error - Check your internet connection"
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      setDebugInfo(`Error: ${errorMessage}`)

      // Try to use cached data as fallback
      const cachedData = getCachedData()
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log("📦 Using cached data as fallback")
        setCampaigns(cachedData)
        setError(`${errorMessage} - Using cached data`)
        setDebugInfo(`${errorMessage} - Using cached data (${cachedData.length} campaigns)`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Retry with exponential backoff
  const retryFetch = async () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)

    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000)

    console.log(`🔄 Retrying fetch in ${delay}ms (attempt ${newRetryCount})`)

    setTimeout(() => {
      fetchCampaigns(false)
    }, delay)
  }

  const handleRefresh = () => {
    setRetryCount(0) // Reset retry count
    fetchCampaigns(false) // Force refresh, don't use cache
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.job.location.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "null"
    if (min && max) return `${min}k - ${max}k ${currency}`
    if (min) return `${min}k+ ${currency}`
    if (max) return `Up to ${max}k ${currency}`
    return "null"
  }

  // Enhanced date formatting function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "null"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "null"

      // Format as: "Jul 21, 2025 at 12:02 AM"
      return (
        date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) +
        " at " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      )
    } catch {
      return "null"
    }
  }

  // Relative time formatting
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "null"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "null"

      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      const diffInWeeks = Math.floor(diffInDays / 7)

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
      if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
      if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`

      return formatDate(dateString)
    } catch {
      return "null"
    }
  }

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset previous messages
    setUploadError(null)
    setUploadSuccess(null)

    // Check file size (max 50MB for binary upload)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File is too large. Please select a JSON file smaller than 50MB.')
      return
    }

    // Check file type
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setUploadError('Only JSON files are allowed. Please select a .json file.')
      return
    }

    try {
      setIsUploading(true)
      
      console.log('📤 Uploading file binary:', file.name, 'Size:', file.size, 'Type:', file.type)

      // Create FormData to send the file as binary
      const formData = new FormData()
      formData.append('file', file)

      // Send to webhook via our API proxy to avoid CORS issues
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for larger files

      const response = await fetch('/api/webhook-proxy', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('🔄 Webhook proxy response:', { status: response.status, ok: response.ok })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Webhook proxy result:', result)
        setUploadSuccess('JSON file uploaded successfully! The data has been processed.')
        
        // Refresh campaigns list
        setTimeout(() => {
          fetchCampaigns(false)
        }, 1000)
      } else {
        const errorResult = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorResult.error || `Request failed with status ${response.status}`)
      }

    } catch (error) {
      console.error('❌ Upload error:', error)
      
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Upload timed out. Please try again with a smaller file.'
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setUploadError(`Upload failed: ${errorMessage}`)
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }



  return (
    <div className="flex h-full min-h-screen gap-4">
      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Recruitment Campaigns</h1>
                {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              </div>
              <p className="text-muted-foreground/80">
                Manage and track your active recruitment campaigns ({campaigns.length} campaigns)
                {lastFetch && <span className="ml-2 text-xs">• Last updated: {formatLastFetch(lastFetch)}</span>}
              </p>
              {debugInfo && <p className="text-xs text-blue-600 mt-1">Debug: {debugInfo}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="bg-transparent">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('bulk-upload-input')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : 'Bulk Upload'}
              </Button>
              <Link href="/dashboard/campaigns/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Hidden file input for bulk upload */}
          <input
            id="bulk-upload-input"
            type="file"
            accept=".json,application/json"
            onChange={handleBulkUpload}
            style={{ display: 'none' }}
          />

          {/* Upload feedback messages */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {uploadError}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{uploadSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant={error.includes("cached") || error.includes("demo") ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {!error.includes("cached") && !error.includes("demo") && (
                  <Button variant="outline" size="sm" onClick={retryFetch} disabled={loading}>
                    Retry {retryCount > 0 && `(${retryCount})`}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 p-1 md:p-1.5">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition focus-visible:ring-2 focus-visible:ring-blue-400/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-blue-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading && campaigns.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading campaigns from API...</span>
              </div>
            </div>
          )}

          {/* Campaigns Grid */}
          {!loading && (
            <>
              {filteredCampaigns.length === 0 && !error ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchTerm ? "No campaigns match your search criteria." : "Get started by creating your first campaign."}
                    </p>
                    <Link href="/dashboard/campaigns/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <Link key={campaign.campaign_id} href={`/dashboard/campaigns/${campaign.campaign_id}`} className="block p-1 md:p-1.5">
              <Card className="group transition-all duration-300 border border-gray-200 rounded-2xl bg-white supports-[backdrop-filter]:bg-white/80 backdrop-blur-sm cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-300 hover:ring-2 hover:ring-blue-400/25 hover:ring-offset-2 hover:ring-offset-background min-h-[350px] max-h-[400px] w-full flex flex-col">
                <CardContent className="p-4 flex flex-col overflow-y-auto h-full">
                  {/* Job Header */}
                  <div className="space-y-3 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{campaign.job.title}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.job.company}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {campaign.job.seniority && (
                          <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                            {campaign.job.seniority}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 border-green-300 rounded-full px-2 py-0.5">Active</Badge>
                      </div>
                    </div>
                    
                  {/* Key Details Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full px-2 py-0.5 text-[10px]">
                      📍 {campaign.job.location}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-full px-2 py-0.5 text-[10px]">
                       💰 {formatSalary(campaign.job.salary_min, campaign.job.salary_max, campaign.job.salary_currency)}
                     </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 rounded-full px-2 py-0.5 text-[10px]">
                      🏢 {campaign.job.work_mode}
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 rounded-full px-2 py-0.5 text-[10px]">
                      📋 {campaign.job.contract}
                    </Badge>
                  </div>
                </div>

                {/* Company Description */}
                {campaign.job.company_desc && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900/90">About the Company</h4>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{campaign.job.company_desc}</p>
                  </div>
                )}

                {/* Job Description */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-gray-900/90">Job Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {campaign.job.job_description || `${campaign.job.title} position at ${campaign.job.company}`}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-xl mb-4">
                  {campaign.job.department && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Department</span>
                      <p className="text-sm font-medium">{campaign.job.department}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Industry</span>
                    <p className="text-sm font-medium">{campaign.job.company}</p>
                  </div>
                  {campaign.job.seniority && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Seniority</span>
                      <p className="text-sm font-medium">{campaign.job.seniority}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Status</span>
                    <p className="text-sm font-medium text-green-600">Active</p>
                  </div>
                </div>

                {/* Requirements */}
                {campaign.job.requirements.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-gray-900/90">Requirements</h4>
                    <ul className="space-y-2">
                      {campaign.job.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                          <span className="text-sm text-gray-600">{req}</span>
                        </li>
                      ))}
                      {campaign.job.requirements.length > 3 && (
                        <li className="text-sm text-gray-500">+{campaign.job.requirements.length - 3} more requirements</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                {campaign.job.skills.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-gray-900/90">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.job.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full px-2 py-0.5 text-[10px]">
                          {skill.name}{skill.mastery && ` (${skill.mastery})`}
                        </Badge>
                      ))}
                      {campaign.job.skills.length > 4 && (
                        <Badge variant="outline" className="text-[10px] border-indigo-300 text-indigo-800 bg-indigo-100 rounded-full px-2 py-0.5">
                          +{campaign.job.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {campaign.job.benefits.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-gray-900/90">Benefits & Perks</h4>
                    <ul className="space-y-2">
                      {campaign.job.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </li>
                      ))}
                      {campaign.job.benefits.length > 3 && (
                        <li className="text-sm text-gray-500">+{campaign.job.benefits.length - 3} more benefits</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-3 p-4 bg-blue-50/70 rounded-xl">
                  <h4 className="font-semibold text-blue-900">Additional Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-blue-800">Created: </span>
                      <span className="text-sm text-blue-700">{formatDate(campaign.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">Campaign ID: </span>
                      <span className="text-sm text-blue-700 font-mono">{campaign.campaign_id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          ))}
                </div>
              )}
            </>
          )}

          {/* No Data */}
          {!loading && campaigns.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No campaigns available.</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* AI Panel - fixed to viewport with spacer to preserve layout */}
      <div className={`hidden md:block flex-shrink-0 ${isRightPanelCollapsed ? 'w-12' : 'w-80'}`}></div>
      {/* <div className="hidden md:block fixed right-0 top-0 h-screen z-30"> */}
      <div className="hidden md:block fixed right-0 top-0 bottom-0 z-30">
        <SharedAIPanel
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          selectedContextCandidate={selectedContextCandidate}
          setSelectedContextCandidate={setSelectedContextCandidate}
          selectedContextCampaign={selectedContextCampaign}
          setSelectedContextCampaign={setSelectedContextCampaign}
          selectedProfileView={selectedProfileView}
          setSelectedProfileView={setSelectedProfileView}
          selectedCampaignView={selectedCampaignView}
          setSelectedCampaignView={setSelectedCampaignView}
          campaigns={rightPanelCampaigns}
          candidates={rightPanelCandidates}
        />
      </div>
    </div>
  )
}
